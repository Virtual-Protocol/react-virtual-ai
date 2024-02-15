import { defaultVirtualConfig } from "../constants/model";
import { PromptDto } from "../types/PromptDto";
import { getVirtualUid } from "../utils/jwt";
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
  const [virtualConfigUrl, setVirtualConfigUrl] = useState("");

  const fetchVirtualConfig = async (url: string) => {
    try {
      const resp = await fetch(url);
      const respJson = await resp.json();
      if (!!respJson) {
        setVirtualConfig(respJson);
      }
    } catch (err) {
      console.log("Error loading config", err);
    }
  };

  useEffect(() => {
    if (!virtualConfigUrl) return;
    fetchVirtualConfig(virtualConfigUrl);
  }, [virtualConfigUrl]);

  const initVirtual = async () => {
    setVirtualConfigUrl("");
    let cachedRunnerToken =
      localStorage.getItem(`runnerToken${virtualId}`) ?? "";
    // initialize virtual related configuration
    const uid = getVirtualUid(cachedRunnerToken);
    // get virtual by virtual uid
    // TODO: Integrate .env
    const resp = await fetch(
      `https://api-dev.virtuals.io/api/virtuals?filters[uid]=${uid}&populate=cores&pagination[limit]=1`
    );
    const respJson = await resp.json();
    const metadata = respJson?.data?.[0]?.attributes?.metadata;
    const url = metadata?.runner ?? "https://runner.virtuals.gg";
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
    setVirtualConfigUrl(`${url}/${modelRespJson.config ?? ""}`);
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
    onPromptReceived?: (prompt: PromptDto) => void
  ) => {
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
