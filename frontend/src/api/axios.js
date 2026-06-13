import axios from "axios";
import { serverUrl } from "../config";
import {
  clearAuthStorage,
  getAuthToken,
  isJwtExpired,
  isValidJwtFormat,
} from "../utils/authToken";

const api = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token && isValidJwtFormat(token) && !isJwtExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    clearAuthStorage();

    if (window.location.pathname !== "/signin") {
      window.location.assign("/signin");
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthStorage();

      if (window.location.pathname !== "/signin") {
        window.location.assign("/signin");
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Request failed";

    return Promise.reject({ ...error, message });
  }
);

export default api;
