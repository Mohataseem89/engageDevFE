// export const BASE_URL = "http://localhost:3000";
export const BASE_URL = "/api";
// export const SOCKET_URL = "http://localhost:3000";
export const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : window.location.origin;



