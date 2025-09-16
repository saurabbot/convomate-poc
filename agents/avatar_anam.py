import logging
import os

from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, JobContext, JobRequest, WorkerOptions, WorkerType, cli
from livekit.plugins import anam, openai

logger = logging.getLogger("anam-avatar-example")
logger.setLevel(logging.INFO)

load_dotenv()


async def entrypoint(ctx: JobContext):
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="coral"),
        # resume_false_interruption=False,
    )

    anam_api_key = os.getenv("ANAM_API_KEY")
    if not anam_api_key:
        raise ValueError("ANAM_API_KEY is not set")

    anam_avatar_id = os.getenv("ANAM_AVATAR_ID")
    if not anam_api_key:
        raise ValueError("ANAM_AVATAR_ID is not set")

    anam_avatar = anam.AvatarSession(
        persona_config=anam.PersonaConfig(
            name="avatar",
            avatarId=anam_avatar_id,
        ),
        api_key=anam_api_key,
        avatar_participant_name="Mia",
    )
    await anam_avatar.start(session, room=ctx.room)

    # start the agent, it will join the room and wait for the avatar to join
    await session.start(
        agent=Agent(instructions="Your name is Mia. Your are a friendly and helpful assistant. Keep your responses short and concise in English."),
        room=ctx.room,
    )
    # generate a reply using the generate_reply method
    await session.generate_reply(instructions="say hello to the user in English")


async def request_fnc(req: JobRequest):
    await req.accept(
        attributes={"agentType": "avatar"},
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            worker_type=WorkerType.ROOM,
            request_fnc=request_fnc,
            agent_name="livekit-agent" # used to request the agent
        )
    )