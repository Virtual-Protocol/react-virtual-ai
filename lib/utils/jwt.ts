import { jwtDecode } from "jwt-decode";

/**
 * Helper function to validate JWT token expiry
 * @param token JWT token
 * @returns false if token is invalid, else true
 */
export const validateJwt = (token: string) => {
  if (!token) return false;

  let decodedToken = jwtDecode(token);
  let currentDate = new Date();

  if (!decodedToken) return false;

  // JWT exp is in seconds
  if ((decodedToken?.exp ?? 0) * 1000 < currentDate.getTime()) {
    return false;
  }

  return true;
};

/**
 * Helper function to retrieve runner URL via JWT token issued by Virtual Protocol server
 * @param token JWT token
 * @returns Runner URL associated with the JWT token
 */
export const getVirtualRunnerUrl = (token: string) => {
  if (!token) return "";

  let decodedToken = jwtDecode(token);

  return (decodedToken as any)?.runner ?? "";
};
