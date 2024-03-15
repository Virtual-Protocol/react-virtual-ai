import { ConfigType } from "../types/ConfigType";
import { PromptType } from "../types/PromptType";
import { UNSAFE_initAccessToken } from "../utils/initAccessToken";
import { getVirtualRunnerUrl } from "../utils/jwt";
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
    if (modelResp.status !== 200) throw new Error("Fetch virtual failed");
    const modelRespJson = await modelResp.json();

    setModelUrl(modelRespJson?.data?.model ?? "");
  };

  const initSession = async (vid: number | string, retry: number = 0) => {
    try {
      if (!!vid) {
        const initToken = !!initAccessToken
          ? initAccessToken
          : UNSAFE_initAccessToken;
        const token = await initToken(vid, metadata);
        localStorage.setItem(`runnerToken${vid}`, token);
      }
      await initVirtual();
    } catch (err: any) {
      console.log("Error fetching data", err);
      if (retry >= 3) {
        throw err;
      }
      localStorage.removeItem(`runnerToken${vid}`);
      await initSession(vid, retry + 1);
    }
  };

  useEffect(() => {
    if (!!virtualId) {
      // reset previous values
      setRunnerUrl("");
      setModelUrl("");
      // init session
      initSession(virtualId);
    }
  }, [virtualId]);

  const createPrompt = async (
    content: string | Blob,
    configs?: ConfigType,
    onPromptReceived?: (prompt: PromptType) => void,
    retry?: number
  ): Promise<PromptType> => {
    try {
      if (!virtualId) throw new Error("Virtual not found");
      const initToken = !!initAccessToken
        ? initAccessToken
        : UNSAFE_initAccessToken;
      const cachedRunnerToken = await initToken(virtualId ?? -1, metadata);
      const formData = new FormData();
      if (typeof content !== "string") {
        formData.append("audio", content, "recording.webm");
        formData.append("skipTTS", configs?.skipTTS ? "true" : "false");
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
                skipTTS: configs?.skipTTS,
                userName,
                botName: virtualName,
              })
            : formData,
      });
      // if encountered error, retry after init access token
      if (resp.status !== 200 && (retry ?? 0) < 3) {
        localStorage.removeItem(`runnerToken${virtualId}`);
        await initSession(virtualId);
        return (await createPrompt(
          content,
          {
            skipTTS: !!configs?.skipTTS,
          },
          onPromptReceived,
          (retry ?? 0) + 1
        )) as PromptType;
      } else if (resp.status !== 200) {
        onPromptError?.(resp);
      }

      const respJson = await resp.json();
      if (!!respJson?.error) {
        throw new Error(respJson.error);
      }
      if (!!onPromptReceived) {
        onPromptReceived(respJson as PromptType);
      }
      return respJson as PromptType;
    } catch (err: any) {
      if ((retry ?? 0) < 3)
        return (await createPrompt(
          content,
          {
            skipTTS: !!configs?.skipTTS,
          },
          onPromptReceived,
          (retry ?? 0) + 1
        )) as PromptType;
      onPromptError?.(err);
      return {
        expression: {
          uid: "",
          name: "",
          url: "",
        },
      };
    }
  };

  const getVoiceUrl = async (
    content: string,
    retry?: number
  ): Promise<string> => {
    try {
      if (!virtualId) throw new Error("Virtual not found");
      const initToken = !!initAccessToken
        ? initAccessToken
        : UNSAFE_initAccessToken;
      const cachedRunnerToken = await initToken(virtualId ?? -1, metadata);
      const resp = await fetch(`${runnerUrl}/voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cachedRunnerToken}`,
        },
        body: JSON.stringify({
          text: content,
        }),
      });
      // if encountered error, retry after init access token
      if (resp.status !== 200 && (retry ?? 0) < 3) {
        localStorage.removeItem(`runnerToken${virtualId}`);
        await initSession(virtualId);
        return (await getVoiceUrl(content, (retry ?? 0) + 1)) as string;
      } else if (resp.status !== 200) {
        onPromptError?.(resp);
      }

      const respJson = await resp.json();
      if (!!respJson?.error) {
        throw new Error(respJson.error);
      }
      return (respJson?.audioUid ?? "") as string;
    } catch (err: any) {
      if ((retry ?? 0) < 3)
        return (await getVoiceUrl(content, (retry ?? 0) + 1)) as string;
      onPromptError?.(err);
      return "";
    }
  };

  return {
    runnerUrl,
    modelUrl,
    createPrompt,
    getVoiceUrl,
  };
};
