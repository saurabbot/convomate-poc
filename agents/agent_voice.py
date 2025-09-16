import logging
import numpy as np
import os
import urllib.request
from dotenv import load_dotenv
import cv2
import asyncio
from livekit import rtc
from livekit.rtc import VideoFrame
from livekit.rtc import VideoBufferType
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobRequest,
    JobProcess,
    RoomInputOptions,
    RoomOutputOptions,
    RunContext,
    WorkerOptions,
    cli,
    metrics,
)
from livekit.agents.llm import function_tool
from livekit.agents.voice import MetricsCollectedEvent
from livekit.plugins import deepgram, openai, silero
from livekit.plugins.turn_detector.english import EnglishModel

# uncomment to enable Krisp background voice/noise cancellation
# currently supported on Linux and MacOS
# from livekit.plugins import noise_cancellation

logger = logging.getLogger("basic-agent")

load_dotenv()

AGENT_DISPLAY_NAME = "Suresh"
TEST_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
VIDEO_PATH = "agents/data/BigBuckBunny.mp4"


class MyAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="Your name is Suresh. You would interact with users via voice. with that in mind keep your responses concise and to the point. You are curious and friendly, and have a sense of humor. your job is to help the client find the right property and then share screen and play video of the property. ",
        )
        self.room = None 
        self.screen_share_source = None
        self.video_playing = False
        self.video_task = None
    async def on_enter(self):
        self.session.generate_reply(instructions="Hey I'm Suresh, your real estate agent. How can I help you today?")
  
    def _frame_to_argb(self, frame):
        frame_resized = cv2.resize(frame, (1280, 720))
        frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
        height, width, _ = frame_rgb.shape
        frame_argb = np.zeros((height, width, 4), dtype=np.uint8)
        frame_argb[:, :, 1:4] = frame_rgb  # RGB goes to channels 1,2,3
        frame_argb[:, :, 0] = 255  # Alpha channel (fully opaque)
        return frame_argb
    
    def get_sample_video(self):
        sample_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        local_path = "sample_video.mp4"
        if not os.path.exists(local_path):
            logger.info("Downloading sample video...")
            urllib.request.urlretrieve(sample_url, local_path)
            logger.info("Download complete.")
        else:
            logger.info("Sample video already exists locally.")

        return os.path.abspath(local_path)
    
    @function_tool
    async def share_property_video(self):
        if self.room is None:
            return "Room not available"
        try:
            self.screen_share_source = rtc.VideoSource(1280, 720)
            track = rtc.LocalVideoTrack.create_video_track("property_video", self.screen_share_source)
            await self.room.local_participant.publish_track(
                track,
                rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_SCREENSHARE)
            )

            video_path = self.get_sample_video()  # Get video automatically
            self.video_playing = True
            self.video_task = asyncio.create_task(self._play_video(video_path))
            return "Started sharing property video on screen"

        except Exception as e:
            logger.error(f"Error sharing screen: {e}")
            return f"Failed to share screen: {str(e)}"


    async def _play_video(self, video_path: str):
        try:
            if not os.path.exists(video_path):
                logger.error(f"Video file does not exist: {video_path}")
                return False
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                logger.error(f"Could not open video file: {video_path}")
                return False
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_delay = 1.0 / fps if fps > 0 else 1.0 / 30
            self.video_playing = True
            logger.info(f"Starting video playback at {fps} fps")
            while self.video_playing:
                ret, frame = cap.read()
                if not ret:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Loop video
                    continue
                frame_resized = cv2.resize(frame, (1280, 720))
                frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
                frame_bytes = frame_rgb.tobytes()
                video_frame = VideoFrame(
                    width=1280,
                    height=720,
                    type=VideoBufferType.RGB24,  # instead of proto_video.VideoBufferType.RGB24
                    data=frame_bytes
                )
                if self.screen_share_source:
                    self.screen_share_source.capture_frame(video_frame)
                await asyncio.sleep(frame_delay)
            cap.release()
            logger.info("Video playback stopped")
            return True

        except Exception as e:
            logger.error(f"Error playing video: {e}")
            return False



def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    logger.info(f"Context: {ctx}")
    logger.info(f"Room Beep Boop: {ctx.room}")
    
    
    session = AgentSession(

        vad=ctx.proc.userdata["vad"],
        llm=openai.LLM(model="gpt-4o-mini"),
        stt=deepgram.STT(model="nova-3"),
        tts=openai.TTS(voice="alloy"),
        turn_detection=EnglishModel(),
    )

    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    await ctx.wait_for_participant()

    agent = MyAgent()
    agent.room = ctx.room
    
    await session.start(
        agent=agent,
        room=ctx.room,
        room_input_options=RoomInputOptions(
        ),
        room_output_options=RoomOutputOptions(transcription_enabled=True),
    )

async def request_fnc(req: JobRequest):
    await req.accept(
        name=AGENT_DISPLAY_NAME,
    )

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            request_fnc=request_fnc,
            agent_name="livekit-agent"
        )
    )

