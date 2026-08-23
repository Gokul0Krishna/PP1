const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE = `${BASE_URL}/api`;

async function handleResponse(res) {
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      detail = `Server error (${res.status})`;
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function checkServerStatus() {
  const res = await fetch(`${BASE_URL}/`);
  return handleResponse(res);
}

export async function downloadMusic(title) {
  const res = await fetch(`${API_BASE}/download-music?title=${encodeURIComponent(title)}`);
  return handleResponse(res);
}

export async function getLibrary() {
  const res = await fetch(`${API_BASE}/library`);
  return handleResponse(res);
}

export function getStreamUrl(filename) {
  return `${API_BASE}/stream/${encodeURIComponent(filename)}`;
}

