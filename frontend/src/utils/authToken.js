const AUTH_TOKEN_KEY = "flettoToken";

export const getAuthToken = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token && token !== "undefined" && token !== "null" ? token : null;
};

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const isValidJwtFormat = (token) => {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  return parts.length === 3 && parts.every(Boolean);
};

export const isJwtExpired = (token) => {
  if (!isValidJwtFormat(token)) return true;

  try {
    const base64 = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(paddedBase64));
    if (!payload.exp) return false;

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const clearAuthStorage = () => {
  clearAuthToken();
  localStorage.removeItem("persist:root");
};

export { AUTH_TOKEN_KEY };
