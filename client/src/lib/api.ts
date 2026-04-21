import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fixit-mocha.vercel.app";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export function assetUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default api;
