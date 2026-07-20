import axios from "axios";
import { BASE_URL } from "./constants";
import appStore from "./appStore";
import { removeUser } from "./userSlice";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE_URL}/refresh`, {}, { withCredentials: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthEndpoint = ["/refresh", "/login", "/signup"].some((path) =>
      originalRequest?.url?.includes(path)
    );

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        appStore.dispatch(removeUser());
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;