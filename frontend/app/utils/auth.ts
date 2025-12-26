import { jwtDecode } from "jwt-decode";

export type LoggedInUser = {
  userId: string;
  username: string;
};

type CognitoClaims = {
  sub: string;
  email?: string;
  "cognito:username"?: string;
};

export function getLoggedInUser(): LoggedInUser | null {
  const idToken = localStorage.getItem("idToken");
  if (!idToken) return null;

  const decoded = jwtDecode<CognitoClaims>(idToken);

  return {
    userId: decoded.sub,
    username: decoded.email || "user",
  };
}
