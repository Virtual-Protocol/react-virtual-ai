import { Core, VirtualService } from "../services/VirtualService";
import { useEffect, useState } from "react";

export type VirtualProps = {
  virtualId?: number | string;
  userName?: string;
  virtualName?: string;
  initAccessToken: (
    virtualId: number | string,
    forceRefetchToken?: boolean,
    metadata?: { [id: string]: any }
  ) => Promise<string>;
  onPromptError?: (error: any) => void;
  onLoadError?: (error: any) => void;
  metadata?: { [id: string]: any };
  onInitCompleted?: (cores: Core[]) => void;
};

export const useVirtual = ({
  virtualId,
  userName,
  virtualName,
  initAccessToken,
  onPromptError,
  onLoadError,
  metadata,
  onInitCompleted,
}: VirtualProps) => {
  const [runnerUrl, setRunnerUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [cores, setCores] = useState<string[]>([]);
  const [virtualService, setVirtualService] = useState<VirtualService>();

  useEffect(() => {
    // skip if everything is same
    if (
      !!virtualService &&
      virtualId === virtualService.configs.virtualId &&
      userName === virtualService.configs.userName &&
      virtualName === virtualService.configs.virtualName &&
      JSON.stringify(virtualService.configs.metadata ?? {}) ===
        JSON.stringify(metadata ?? {})
    )
      return;
    if (!virtualId) {
      setVirtualService(undefined);
      return;
    }
    setVirtualService(
      new VirtualService({
        virtualId,
        userName,
        virtualName,
        initAccessToken,
        onPromptError,
        metadata,
        onInitCompleted,
      })
    );
  }, [
    virtualId,
    userName,
    virtualName,
    metadata,
    virtualService,
    initAccessToken,
  ]);

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
        .catch((err) => {
          // console.log("Error initializing session", err);
          if (!!onLoadError) onLoadError(err);
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
