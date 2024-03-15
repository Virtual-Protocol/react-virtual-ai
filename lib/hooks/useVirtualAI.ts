import {
  VirtualService,
  defaultVirtualService,
} from "../services/VirtualService";
import { useEffect, useState } from "react";

export type VirtualAIProps = {
  virtualId?: number | string;
  userName?: string;
  virtualName?: string;
  initAccessToken?: (
    virtualId: number | string,
    metadata?: { [id: string]: any }
  ) => Promise<string>;
  onPromptError?: (error: any) => void;
  metadata?: { [id: string]: any };
};

export const useVirtualAI = ({
  virtualId,
  userName,
  virtualName,
  initAccessToken,
  onPromptError,
  metadata,
}: VirtualAIProps) => {
  const [runnerUrl, setRunnerUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [virtualService, setVirtualService] = useState(defaultVirtualService);

  useEffect(() => {
    console.log("Initialized virtual service");
    setVirtualService(
      new VirtualService({
        virtualId,
        userName,
        virtualName,
        initAccessToken,
        onPromptError,
        metadata,
      })
    );
  }, [
    virtualId,
    userName,
    virtualName,
    initAccessToken,
    onPromptError,
    metadata,
  ]);

  useEffect(() => {
    if (!!virtualId && !!virtualService) {
      // reset previous values
      setRunnerUrl("");
      setModelUrl("");
      // init session
      virtualService
        .initSession(virtualId)
        .then(() => {
          setRunnerUrl(virtualService.runnerUrl);
          setModelUrl(virtualService.modelUrl);
        })
        .catch((err: any) => {
          console.log("Error initializing session", err);
        });
    }
  }, [virtualId, virtualService]);

  return {
    runnerUrl,
    modelUrl,
    createPrompt: virtualService.createPrompt,
    getVoiceUrl: virtualService.getVoiceUrl,
  };
};
