import { jwtDecode } from "jwt-decode";

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

export const getVirtualUid = (token: string) => {
  if (!token) return "";

  let decodedToken = jwtDecode(token);

  return (decodedToken as any)?.virtual ?? "";
};
