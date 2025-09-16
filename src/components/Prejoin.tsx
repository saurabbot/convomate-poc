import React, { useState, useRef } from "react";
import { defaultUserChoices, log } from "@livekit/components-core";
import type { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import type { ConnectionDetails } from "@/utils/types";
import {
  Track,
  facingModeFromDeviceLabel,
  facingModeFromLocalTrack,
} from "livekit-client";
import { usePersistentUserChoices } from "@livekit/components-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
type PreJoinProps = {
  defaults: any;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
};
interface initialStateInterface {
  userChoices: unknown;
  persistantUserChoice: boolean;
  connectionDetails: ConnectionDetails | undefined;
}
export function Prejoin(props: PreJoinProps) {
  const initialState: initialStateInterface = {
    userChoices: defaultUserChoices,
    persistantUserChoice: true,
    connectionDetails: undefined,
  };
  const [preJoinState, setPreJoinState] = useState(initialState);

  const partialDefaults: Partial<LocalUserChoices> = {
    ...(props.defaults.audioDeviceId !== undefined && {
      audioDeviceId: props.defaults.audioDeviceId,
    }),
    ...(props.defaults.videoDeviceId !== undefined && {
      videoDeviceId: props.defaults.videoDeviceId,
    }),
    ...(props.defaults.audioEnabled !== undefined && {
      audioEnabled: props.defaults.audioEnabled,
    }),
    ...(props.defaults.videoEnabled !== undefined && {
      videoEnabled: props.defaults.videoEnabled,
    }),
    ...(props.defaults.username !== undefined && {
      username: props.defaults.username,
    }),
  };

  const prejoinDefaults = React.useMemo(() => {
    return {
      username: "",
      isVideoEnabled: true,
      isAudioEnabled: true,
    };
  });
  const {
    userChoices: initialUserChoices,
    saveAudioDeviceId,
    saveVideoDeviceId,
  } = usePersistentUserChoices({
    defaults: partialDefaults,
    preventSave: !preJoinState.persistantUserChoice,
    preventLoad: !preJoinState.persistantUserChoice,
  });
  const videoEl = useRef(null);
  const videoTeack = React.useMemo(() => tracks);
  return (
    <Card className="shadow-2xl bg-slate-800/95 border-gray-700/30 backdrop-blur-xl">
      <CardContent className="p-10">
        <div className="text-center text-white">
          <h2 className="text-2xl font-semibold mb-4">Join Meeting</h2>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Join Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
