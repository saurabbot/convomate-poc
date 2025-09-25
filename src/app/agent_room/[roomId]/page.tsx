"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  formatChatMessageLinks,
  PreJoin,
} from "@livekit/components-react";
import { Room, VideoPresets } from "livekit-client";
import "@livekit/components-styles";
import "../../videoconference.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const CONN_DETAILS_ENDPOINT = "/api/livekit/connection-details";

export default function AgentRoom() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const roomId = params.roomId as string;

  const [preJoinChoices, setPreJoinChoices] = useState<{ username: string; videoEnabled: boolean; audioEnabled: boolean } | undefined>(undefined);
  const [connectionDetails, setConnectionDetails] = useState<{ participantToken: string; serverUrl: string } | undefined>(undefined);
  const [agentRequested, setAgentRequested] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: string;
    microphone: string;
  }>({ camera: "prompt", microphone: "prompt" });
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setIsCheckingPermissions(true);

      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.navigator) {
        return;
      }

      const nav = window.navigator;

      // Check if Permissions API is supported
      if ("permissions" in nav && nav.permissions) {
        const cameraPermission = await nav.permissions.query({
          name: "camera" as PermissionName,
        });
        const micPermission = await nav.permissions.query({
          name: "microphone" as PermissionName,
        });

        setPermissionStatus({
          camera: cameraPermission.state,
          microphone: micPermission.state,
        });
      } else {
        // Fallback: try to access media directly
        try {
          if (nav.mediaDevices && nav.mediaDevices.getUserMedia) {
            const stream = await nav.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            setPermissionStatus({ camera: "granted", microphone: "granted" });
          } else {
            setPermissionStatus({ camera: "denied", microphone: "denied" });
          }
        } catch (error) {
          console.error("Media access check failed:", error);
          setPermissionStatus({ camera: "denied", microphone: "denied" });
        }
      }
    } catch (error) {
      console.error("Permission check failed:", error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setIsCheckingPermissions(true);

      // Check if we're in a browser environment and mediaDevices is available
      if (typeof window === 'undefined' || !window.navigator) {
        setPermissionStatus({ camera: "denied", microphone: "denied" });
        return;
      }

      const nav = window.navigator;
      
      if (!nav.mediaDevices || !nav.mediaDevices.getUserMedia) {
        setPermissionStatus({ camera: "denied", microphone: "denied" });
        return;
      }

      // Request media access to trigger browser permission dialog
      const stream = await nav.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());

      // Update permission status
      setPermissionStatus({ camera: "granted", microphone: "granted" });

      console.log("Permissions granted successfully");
    } catch (error: unknown) {
      console.error("Permission request failed:", error);

      if (error instanceof Error && error.name === "NotAllowedError") {
        setPermissionStatus({ camera: "denied", microphone: "denied" });
        alert(
          "Please allow camera and microphone access in your browser settings, then refresh the page."
        );
      }
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const preJoinDefaults = useMemo(() => {
    const hasMediaAccess =
      permissionStatus.camera === "granted" &&
      permissionStatus.microphone === "granted";
    return {
      username: "",
      videoEnabled: hasMediaAccess,
      audioEnabled: hasMediaAccess,
    };
  }, [permissionStatus]);

  const handlePreJoinSubmit = useCallback(
    async (values: { username: string; videoEnabled: boolean; audioEnabled: boolean }) => {
      setPreJoinChoices(values);
      const connectionUrl = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
      connectionUrl.searchParams.append("roomName", roomId);
      connectionUrl.searchParams.append("participantName", values.username);
      if (url) {
        connectionUrl.searchParams.append("url", url);
      }
      try {
        const connectionDetailsResp = await fetch(connectionUrl.toString());
        const connectionDetailsData = await connectionDetailsResp.json();
        setConnectionDetails(connectionDetailsData);
      } catch (error) {
        console.error("Failed to get connection details:", error);
        alert("Failed to connect to the meeting. Please try again.");
      }
    },
    [roomId, url]
  );

  const handlePreJoinError = useCallback((error: Error) => {
    console.error("PreJoin Error:", error);

    if (error.name === "NotAllowedError") {
      alert(
        "Camera/microphone access denied. Please check browser permissions."
      );
    } else if (error.name === "NotFoundError") {
      alert("No camera or microphone found. Please check your devices.");
    }
  }, []);

  const roomOptions = useMemo(
    () => ({
      videoCaptureDefaults: {
        resolution: VideoPresets.h720,
      },
      publishDefaults: {
        dtx: false,
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
        red: true,
      },
      adaptiveStream: { pixelDensity: "screen" as const },
      dynacast: true,
    }),
    []
  );

  const room = useMemo(() => new Room(roomOptions), [roomOptions]);

  const connectOptions = useMemo(
    () => ({
      autoSubscribe: true,
    }),
    []
  );

  const handleOnLeave = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleError = useCallback((error: Error) => {
    console.error("Room error:", error);
    alert(`Meeting error: ${error.message}`);
  }, []);

  const requestAgent = useCallback(async () => {
    if (agentRequested) return;

    try {
      setAgentRequested(true);
      const response = await fetch(
        "/api/livekit/request-agent?url=" + url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: roomId, url: url }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error("Failed to request agent:", data.error);
        setAgentRequested(false);
      }
    } catch (error) {
      console.error("Error requesting agent:", error);
      setAgentRequested(false);
    }
  }, [roomId, agentRequested, url]);

  const handleBackToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // Show permission request if needed
  const needsPermission =
    permissionStatus.camera !== "granted" ||
    permissionStatus.microphone !== "granted";

  if (connectionDetails === undefined || preJoinChoices === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-5 font-sans">
        <Card className="max-w-lg w-full bg-gray-800/95 border-gray-600/30 shadow-2xl backdrop-blur-2xl relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-green-400 before:via-cyan-400 before:to-violet-400 before:rounded-t-3xl animate-[fadeIn_0.5s_ease-out]">
          <CardContent className="p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Join Agent Meeting
            </h1>
            <p className="text-base text-gray-400 font-medium m-0 mb-8 py-2 px-4 bg-gray-600/50 rounded-full inline-block border border-gray-500/20">
              Room: {roomId}
            </p>
          </div>

          {/* Permission Status Display */}
          {needsPermission && (
            <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-amber-400 font-medium">
                  Media Permissions Required
                </h3>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      permissionStatus.camera === "granted"
                        ? "bg-green-500/20 text-green-400"
                        : permissionStatus.camera === "denied"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    📹 {permissionStatus.camera}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      permissionStatus.microphone === "granted"
                        ? "bg-green-500/20 text-green-400"
                        : permissionStatus.microphone === "denied"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    🎤 {permissionStatus.microphone}
                  </span>
                </div>
              </div>

              <p className="text-amber-300 text-sm mb-3">
                Camera and microphone access is required for video meetings.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={requestPermissions}
                  disabled={isCheckingPermissions}
                  className="flex-1 text-sm"
                  size="sm"
                >
                  {isCheckingPermissions ? "Checking..." : "Grant Permissions"}
                </Button>
                <Button
                  onClick={checkPermissions}
                  className="text-sm"
                  size="sm"
                >
                  🔄
                </Button>
              </div>
            </div>
          )}

          <PreJoin
            defaults={preJoinDefaults}
            onSubmit={handlePreJoinSubmit}
            onError={handlePreJoinError}
            joinLabel="Join Meeting"
            micLabel="Microphone"
            camLabel="Camera"
            userLabel="Enter your name"
          />

          <div className="text-center">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="py-3 px-6 hover:-translate-y-0.5 hover:shadow-lg mt-4"
            >
              ← Back to Home
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative">
      <LiveKitRoom
        room={room}
        token={connectionDetails.participantToken}
        serverUrl={connectionDetails.serverUrl}
        connectOptions={connectOptions}
        video={preJoinChoices.videoEnabled}
        audio={preJoinChoices.audioEnabled}
        onDisconnected={handleOnLeave}
        onError={handleError}
        className="h-full w-full"
      >
        <VideoConference chatMessageFormatter={formatChatMessageLinks} />

        <Button
          className="fixed top-5 right-5 bg-gradient-to-r from-violet-500 to-cyan-400 text-white font-semibold py-3 px-5 transition-all duration-300 z-50 backdrop-blur-md shadow-lg shadow-violet-500/30 uppercase tracking-wider hover:from-violet-600 hover:to-cyan-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/40 disabled:bg-violet-500/60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md disabled:shadow-violet-500/20 active:translate-y-0 md:top-2.5 md:right-2.5 md:py-2.5 md:px-4 md:text-xs rounded-full text-sm"
          onClick={requestAgent}
          disabled={agentRequested}
          title={agentRequested ? "Agent requested" : "Request AI Agent"}
        >
          {agentRequested ? "🤖 Agent Active" : "🤖 Request Agent"}
        </Button>
      </LiveKitRoom>
    </div>
  );
}
