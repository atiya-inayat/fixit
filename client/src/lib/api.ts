import axios from "axios";

export const API_URL = "";

const api = axios.create({
  baseURL: `/api`,
  withCredentials: true,
});

export function assetUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default api;
