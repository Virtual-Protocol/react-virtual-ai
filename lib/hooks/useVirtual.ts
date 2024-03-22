import {
  VirtualService,
  defaultVirtualService,
} from "../services/VirtualService";
import { useEffect, useState } from "react";

export type VirtualProps = {
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

export const useVirtual = ({
  virtualId,
  userName,
  virtualName,
  initAccessToken,
  onPromptError,
  metadata,
}: VirtualProps) => {
  const [runnerUrl, setRunnerUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [cores, setCores] = useState<string[]>([]);
  const [virtualService, setVirtualService] = useState(defaultVirtualService);

  useEffect(() => {
    // skip if everything is same
    if (
      virtualId === virtualService.configs.virtualId &&
      userName === virtualService.configs.userName &&
      virtualName === virtualService.configs.virtualName &&
      JSON.stringify(virtualService.configs.metadata ?? {}) ===
        JSON.stringify(metadata ?? {})
    )
      return;
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
  }, [virtualId, userName, virtualName, metadata, virtualService]);

  useEffect(() => {
    if (!!virtualId && !!virtualService) {
      // reset previous values
      setRunnerUrl("");
      setModelUrl("");
      setCores([]);
      // init session
      virtualService
        .initSession(virtualId)
        .then(() => {
          setRunnerUrl(virtualService.runnerUrl);
          setModelUrl(virtualService.modelUrl);
          setCores(virtualService.cores);
        })
        .catch((err: any) => {
          // console.log("Error initializing session", err);
        });
    }
  }, [virtualId, virtualService]);

  return {
    runnerUrl,
    modelUrl,
    virtualService,
    cores,
  };
};
