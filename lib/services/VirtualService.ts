import { ConfigType } from "../types/ConfigType";
import { PromptType } from "../types/PromptType";
import { UNSAFE_initAccessToken } from "../utils/initAccessToken";
import { getVirtualRunnerUrl } from "../utils/jwt";

export type VirtualServiceConfigs = {
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

export class VirtualService {
  configs: VirtualServiceConfigs;
  modelUrl: string;
  runnerUrl: string;

  constructor(configs: VirtualServiceConfigs) {
    this.configs = configs;
    this.modelUrl = "";
    this.runnerUrl = "";
  }

  async initVirtual() {
    let cachedRunnerToken =
      localStorage.getItem(`runnerToken${this.configs.virtualId}`) ?? "";

    const runnerUrl = getVirtualRunnerUrl(cachedRunnerToken);
    const url = !!runnerUrl ? runnerUrl : "https://runner.virtuals.gg";
    this.runnerUrl = url;
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
    this.modelUrl = modelRespJson?.data?.model ?? "";
  }

  async initSession(vid: number | string, retry: number = 0) {
    try {
      if (!!vid) {
        const initToken = !!this.configs.initAccessToken
          ? this.configs.initAccessToken
          : UNSAFE_initAccessToken;
        const token = await initToken(vid, this.configs.metadata);
        localStorage.setItem(`runnerToken${vid}`, token);
      }
      await this.initVirtual();
    } catch (err: any) {
      console.log("Error fetching data", err);
      if (retry >= 3) {
        throw err;
      }
      localStorage.removeItem(`runnerToken${vid}`);
      await this.initSession(vid, retry + 1);
    }
  }

  async createPrompt(
    content: string | Blob,
    configs?: ConfigType,
    onPromptReceived?: (prompt: PromptType) => void,
    retry?: number
  ): Promise<PromptType> {
    try {
      if (!this.configs.virtualId) throw new Error("Virtual not found");
      const initToken = !!this.configs.initAccessToken
        ? this.configs.initAccessToken
        : UNSAFE_initAccessToken;
      const cachedRunnerToken = await initToken(
        this.configs.virtualId ?? -1,
        this.configs.metadata
      );
      const formData = new FormData();
      if (typeof content !== "string") {
        formData.append("audio", content, "recording.webm");
        formData.append("skipTTS", configs?.skipTTS ? "true" : "false");
        formData.append("userName", this.configs.userName ?? "");
        formData.append("botName", this.configs.virtualName ?? "");
      }
      const resp = await fetch(`${this.runnerUrl}/prompts`, {
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
                userName: this.configs.userName,
                botName: this.configs.virtualName,
              })
            : formData,
      });
      // if encountered error, retry after init access token
      if (resp.status !== 200 && (retry ?? 0) < 3) {
        localStorage.removeItem(`runnerToken${this.configs.virtualId}`);
        await this.initSession(this.configs.virtualId);
        return (await this.createPrompt(
          content,
          {
            skipTTS: !!configs?.skipTTS,
          },
          onPromptReceived,
          (retry ?? 0) + 1
        )) as PromptType;
      } else if (resp.status !== 200) {
        this.configs.onPromptError?.(resp);
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
        return (await this.createPrompt(
          content,
          {
            skipTTS: !!configs?.skipTTS,
          },
          onPromptReceived,
          (retry ?? 0) + 1
        )) as PromptType;
      this.configs.onPromptError?.(err);
      return {};
    }
  }

  async getVoiceUrl(content: string, retry?: number): Promise<string> {
    try {
      if (!this.configs.virtualId) throw new Error("Virtual not found");
      const initToken = !!this.configs.initAccessToken
        ? this.configs.initAccessToken
        : UNSAFE_initAccessToken;
      const cachedRunnerToken = await initToken(
        this.configs.virtualId ?? -1,
        this.configs.metadata
      );
      const resp = await fetch(`${this.runnerUrl}/voice`, {
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
        localStorage.removeItem(`runnerToken${this.configs.virtualId}`);
        await this.initSession(this.configs.virtualId);
        return (await this.getVoiceUrl(content, (retry ?? 0) + 1)) as string;
      } else if (resp.status !== 200) {
        this.configs.onPromptError?.(resp);
      }

      const respJson = await resp.json();
      if (!!respJson?.error) {
        throw new Error(respJson.error);
      }
      return (respJson?.audioUid ?? "") as string;
    } catch (err: any) {
      if ((retry ?? 0) < 3)
        return (await this.getVoiceUrl(content, (retry ?? 0) + 1)) as string;
      this.configs.onPromptError?.(err);
      return "";
    }
  }
}

export const defaultVirtualService = new VirtualService({});
