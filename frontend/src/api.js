const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`;

async function handleResponse(res) {
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function searchSongs(query) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return handleResponse(res);
}

export async function downloadSong(song) {
  const res = await fetch(`${API_BASE}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(song),
  });
  return handleResponse(res);
}

export async function getLibrary() {
  const res = await fetch(`${API_BASE}/library`);
  return handleResponse(res);
}

export async function removeSong(id) {
  const res = await fetch(`${API_BASE}/library/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
