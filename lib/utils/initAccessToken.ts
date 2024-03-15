import { validateJwt } from "./jwt";

/**
 * This function is just an example implementation to get runner access token via Virtual Protocol backend.
 * In production, you would not want to expose API key and secret to the client-side applications.
 * It is mandatory to pass in apiKey, apiSecret, userName, userUid as part of metadata
 *
 * @param virtualId unique identifiers for virtuals. It can be any number / string. Different virtualId will result in separate memory.
 * @param metadata additional metadata to put as part of the runner access token claims.
 * @returns runner access token
 */
export const UNSAFE_initAccessToken = async (
  virtualId: number | string,
  metadata?: { [id: string]: any }
): Promise<string> => {
  if (!virtualId) return "";
  if (!metadata?.apiKey) throw new Error("apiKey not found.");
  if (!metadata?.apiSecret) throw new Error("apiSecret not found.");
  if (!metadata?.userName) throw new Error("userName not found.");
  if (!metadata?.userUid) throw new Error("userUid not found.");
  const apiKey = metadata?.apiKey;
  const apiSecret = metadata?.apiSecret;
  const metadataClone = JSON.parse(JSON.stringify(metadata));
  metadataClone.apiKey = undefined;
  metadataClone.apiSecret = undefined;

  // runner token by bot is saved as runnerToken<virtualId> in localStorage
  let cachedRunnerToken = localStorage.getItem(`runnerToken${virtualId}`) ?? "";
  // Fetch a new runner token if expired
  if (!cachedRunnerToken || !validateJwt(cachedRunnerToken)) {
    // Get runner token via protocol server
    const resp = await fetch(
      `${import.meta.env.VITE_PROTOCOL_API_URL}/api/access/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          !!metadataClone
            ? {
                metadata: {
                  virtualId: virtualId,
                  ...metadataClone,
                },
                apiKey,
                apiSecret,
              }
            : {
                metadata: {
                  virtualId: virtualId,
                },
                apiKey,
                apiSecret,
              }
        ),
      }
    );
    const respJson = await resp.json();

    if (!!respJson.error) throw new Error(respJson.error.message);

    cachedRunnerToken = respJson.accessToken ?? "";
    localStorage.setItem(`runnerToken${virtualId}`, cachedRunnerToken);
  }
  return cachedRunnerToken;
};
