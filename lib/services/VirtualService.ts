import { ConfigType } from "../types/ConfigType";
import { PromptType } from "../types/PromptType";
import { getVirtualRunnerUrl } from "../utils/jwt";

export enum Core {
  VISUAL,
  VOICE,
  COGNITIVE,
}

/**
 * VirtualService configurations
 */
export type VirtualServiceConfigs = {
  /**
   * Unique virtualId, this ID will be used as the reference when creating memory for users
   */
  virtualId?: number | string;
  /**
   * User's name to address when VIRTUAL replies
   */
  userName?: string;
  /**
   * Virtual's name that user addresses
   */
  virtualName?: string;
  /**
   * Function that returns runner access token.
   * @param virtualId virtualId that decides virtual's memory
   * @param metadata additional metadata when requesting access token
   * @returns runner access token
   */
  initAccessToken?: (
    virtualId: number | string,
    forceRefetchToken?: boolean,
    metadata?: { [id: string]: any }
  ) => Promise<string>;
  /**
   * Additional metadata to pass to initAccessToken function
   */
  metadata?: { [id: string]: any };
  /**
   * Callback when init is completed
   * @param cores array of supported cores
   * @returns void
   */
  onInitCompleted?: (cores: Core[]) => void;
  onPromptError?: (err: any) => void;
};

/**
 * VirtualService contains all operations required to send prompt to the VIRTUAL.
 * If you are using React, consider using the {@link useVirtual} hook to automatically switch between VIRTUALs.
 */
export class VirtualService {
  /**
   * Configurations for VirtualService prompting
   */
  configs: VirtualServiceConfigs;
  /**
   * 3D Model URL
   */
  modelUrl: string;
  /**
   * Runner URL
   */
  runnerUrl: string;
  /**
   * Runner supported cores
   */
  cores: string[];

  constructor(configs: VirtualServiceConfigs) {
    this.configs = configs;
    this.modelUrl = "";
    this.runnerUrl = "";
    this.cores = [];
    // console.log("VirtualService is initialized.");
  }

  /**
   * Function to initialize modelUrl and runnerUrl.
   */
  async initVirtual() {
    // console.log("initVirtual is invoked");
    let cachedRunnerToken =
      localStorage.getItem(`runnerToken${this.configs.virtualId}`) ?? "";

    const runnerUrl = getVirtualRunnerUrl(cachedRunnerToken);
    if (!runnerUrl) throw new Error("Runner URL not found");
    this.runnerUrl = runnerUrl;
    const coresResp = await fetch(`${runnerUrl}/cores`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cachedRunnerToken}`,
      },
    });
    if (coresResp.status !== 200) throw new Error("Fetch cores failed");
    const coresRespJson = await coresResp.json();
    this.cores = coresRespJson?.data ?? [];
    try {
      // initialize model url
      const modelResp = await fetch(`${runnerUrl}/model`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cachedRunnerToken}`,
        },
      });
      if (modelResp.status !== 200) throw new Error("Fetch model failed");
      const modelRespJson = await modelResp.json();
      this.modelUrl = modelRespJson?.data?.model ?? "";
    } catch (err: any) {
      this.modelUrl = "";
    }
    this.initComplete();
  }

  /**
   * Function when init completed
   */
  async initComplete() {
    const supportedCores: Core[] = [];

    if (this.modelUrl) {
      supportedCores.push(Core.VISUAL);
    }

    if (this.cores.includes("tts")) {
      supportedCores.push(Core.VOICE);
    }

    if (this.cores.includes("llm")) {
      supportedCores.push(Core.COGNITIVE);
    }

    this.configs.onInitCompleted?.(supportedCores);
  }

  /**
   * Function to initialize user session by virtual id
   * @param vid virtualId
   * @param retry function will retry for 3 times, to prevent this behavior, set to a number above 3
   */
  async initSession(vid: number | string, retry: number = 0) {
    // console.log("initSession is invoked", vid, retry);
    try {
      if (!!vid) {
        if (!this.configs.initAccessToken)
          throw new Error("initAccessToken function is not implemented.");
        const token = await this.configs.initAccessToken(
          vid,
          retry > 0,
          this.configs.metadata
        );
        localStorage.setItem(`runnerToken${vid}`, token);
      }
      await this.initVirtual();
    } catch (err: any) {
      // console.log("Error fetching data", err);
      if (retry >= 3) {
        throw err;
      }
      localStorage.removeItem(`runnerToken${vid}`);
      await this.initSession(vid, retry + 1);
    }
  }

  /**
   * Function to send prompt to the runner service and get Virtual response.
   * @param content text / audio blob contents
   * @param configs additional configuration during prompting
   * @param onPromptReceived callback when prompt is received from the runner service
   * @param retry function will retry for 3 times, to prevent this behavior, set to a number above 3
   * @returns Prompt object
   */
  async createPrompt(
    content: string | Blob,
    configs?: ConfigType,
    onPromptReceived?: (prompt: PromptType) => void,
    retry?: number
  ): Promise<PromptType> {
    try {
      if (!this.configs.virtualId) throw new Error("Virtual not found");
      if (!this.configs.initAccessToken)
        throw new Error("initAccessToken function is not implemented.");
      const cachedRunnerToken = await this.configs.initAccessToken(
        this.configs.virtualId ?? -1,
        (retry ?? 0) > 0,
        this.configs.metadata
      );
      const formData = new FormData();
      if (typeof content !== "string") {
        formData.append("audio", content, "recording.webm");
        formData.append("skipTTS", configs?.skipTTS ? "true" : "false");
        formData.append("userName", this.configs.userName ?? "");
        formData.append("botName", this.configs.virtualName ?? "");
      }
      const jsonBody: { [id: string]: any } = {
        text: content,
        skipTTS: configs?.skipTTS,
        userName: this.configs.userName,
        botName: this.configs.virtualName,
      };
      if (!!configs?.overrides) {
        Object.keys(configs.overrides).forEach((key) => {
          formData.append(key, configs.overrides?.[key] ?? "");
          jsonBody[key] = configs.overrides?.[key] ?? "";
        });
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
        body: typeof content === "string" ? JSON.stringify(jsonBody) : formData,
      });
      // if encountered error, retry after init access token
      if (resp.status !== 200 && (retry ?? 0) < 3) {
        localStorage.removeItem(`runnerToken${this.configs.virtualId}`);
        await this.initSession(this.configs.virtualId);
        return (await this.createPrompt(
          content,
          {
            skipTTS: !!configs?.skipTTS,
            speakOnResponse: !!configs?.speakOnResponse,
          },
          onPromptReceived,
          (retry ?? 0) + 1
        )) as PromptType;
      } else if (resp.status !== 200) {
        throw new Error("Failed to fetch prompt");
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
            speakOnResponse: !!configs?.speakOnResponse,
          },
          onPromptReceived,
          (retry ?? 0) + 1
        )) as PromptType;
      this.configs.onPromptError?.(err);
      return {};
    }
  }

  /**
   * Text-to-speech function
   * @param content text content
   * @returns audio in URL
   */
  async getTTSResponse(content: string): Promise<string> {
    try {
      if (!this.configs.virtualId) throw new Error("Virtual not found");
      if (!this.configs.initAccessToken)
        throw new Error("initAccessToken function is not implemented.");
      const cachedRunnerToken = await this.configs.initAccessToken(
        this.configs.virtualId ?? -1,
        false,
        this.configs.metadata
      );
      const resp = await fetch(`${this.runnerUrl}/prompts/voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cachedRunnerToken}`,
        },
        body: JSON.stringify({
          text: content,
        }),
      });
      const respJson = await resp.json();
      if (!!respJson?.error) {
        throw new Error(respJson.error);
      }
      if (resp.status !== 200) {
        return "";
      }
      return (respJson?.audioUid ?? "") as string;
    } catch (err: any) {
      // console.log("Audio error", err);
      if (!!this.configs.onPromptError) this.configs.onPromptError(err);
      return "";
    }
  }
}

export const defaultVirtualService = new VirtualService({});
