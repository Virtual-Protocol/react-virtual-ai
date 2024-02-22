import { defaultVirtualConfig } from "../constants/model";
import { PromptDto } from "../types/PromptDto";
import { getVirtualRunnerUrl } from "../utils/jwt";
import { useEffect, useState } from "react";

export type VirtualAIProps = {
  virtualId?: number | string;
  userName?: string;
  virtualName?: string;
  initAccessToken: (virtualId: number | string) => Promise<string>;
};

export const useVirtualAI = ({
  virtualId,
  userName,
  virtualName,
  initAccessToken,
}: VirtualAIProps) => {
  const [runnerUrl, setRunnerUrl] = useState("");
  const [virtualConfig, setVirtualConfig] = useState(defaultVirtualConfig);

  const initVirtual = async () => {
    let cachedRunnerToken =
      localStorage.getItem(`runnerToken${virtualId}`) ?? "";
    const runnerUrl = getVirtualRunnerUrl(cachedRunnerToken);
    const url = !!runnerUrl ? runnerUrl : "https://runner.virtuals.gg";
    setRunnerUrl(url);
    // initialize model url
    const modelResp = await fetch(`${url}/model`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cachedRunnerToken}`,
      },
    });
    const modelRespJson = await modelResp.json();

    if (!!modelRespJson?.config) {
      // backward compatibility
      const modelConfigResp = await fetch(`${url}/${modelRespJson.config}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cachedRunnerToken}`,
        },
      });
      const modelConfigRespJson = await modelConfigResp.json();
      setVirtualConfig(modelConfigRespJson ?? defaultVirtualConfig);
    } else setVirtualConfig(modelRespJson?.data ?? defaultVirtualConfig);
  };

  const initSession = async (vid: number | string) => {
    if (!!vid) {
      const token = await initAccessToken(vid);
      localStorage.setItem(`runnerToken${vid}`, token);
    }
    await initVirtual();
  };

  useEffect(() => {
    if (!!virtualId) {
      // reset previous values
      setRunnerUrl("");
      setVirtualConfig(defaultVirtualConfig);
      // init session
      initSession(virtualId);
    }
  }, [virtualId]);

  const createPrompt = async (
    content: string | Blob,
    isNsfw: boolean,
    isRedo: boolean,
    skipTTS: boolean,
    skipLipSync: boolean,
    onPromptReceived?: (prompt: PromptDto) => void,
    retry?: number
  ): Promise<PromptDto> => {
    if (!virtualId) throw new Error("Virtual not found");
    const cachedRunnerToken = await initAccessToken(virtualId ?? -1);
    const formData = new FormData();
    if (typeof content !== "string") {
      formData.append("audio", content, "recording.webm");
      formData.append("isNsfw", isNsfw ? "true" : "false");
      formData.append("isRedo", isRedo ? "true" : "false");
      formData.append("skipLipSync", skipLipSync ? "true" : "false");
      formData.append("skipTTS", skipTTS ? "true" : "false");
      formData.append("userName", userName ?? "");
      formData.append("botName", virtualName ?? "");
    }
    const resp = await fetch(`${runnerUrl}/prompts`, {
      method: "POST",
      headers:
        typeof content === "string"
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cachedRunnerToken}`,
            }
          : {
              Authorization: `Bearer ${cachedRunnerToken}`,
            },
      body:
        typeof content === "string"
          ? JSON.stringify({
              text: content,
              isNsfw: isNsfw,
              isRedo: isRedo,
              skipLipSync,
              skipTTS,
              userName,
              botName: virtualName,
            })
          : formData,
    });
    const respJson = await resp.json();
    if (!!respJson?.error) {
      // if encountered 402 error, retry after init access token
      if (respJson.error?.status === 402 && (retry ?? 0) < 3) {
        localStorage.removeItem(`runnerToken${virtualId}`);
        await initSession(virtualId);
        return (await createPrompt(
          content,
          isNsfw,
          isRedo,
          skipTTS,
          skipLipSync,
          onPromptReceived,
          (retry ?? 0) + 1
        )) as PromptDto;
      }
      throw new Error(respJson.error);
    }
    if (!!onPromptReceived) {
      onPromptReceived(respJson as PromptDto);
    }
    return respJson as PromptDto;
  };

  return {
    runnerUrl,
    modelUrl: virtualConfig.model,
    createPrompt,
    virtualConfig,
  };
};
