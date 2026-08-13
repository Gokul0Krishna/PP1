"""
FastAPI backend for the Music Library learning project.

Everything below is a DUMMY implementation:
- No real audio files are downloaded.
- No real database is used — just an in-memory Python list.
- Restarting the server wipes the "library" back to empty.

When you're ready to go further, swap DUMMY_CATALOG / library_db for a real
music API and a real database (e.g. Postgres via Supabase or Vercel Postgres).
"""

import asyncio
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Music Library API (Dummy)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for a learning project; restrict this in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class Song(BaseModel):
    id: str
    title: str
    artist: str
    duration: str
    cover: Optional[str] = None


# ---------- Dummy data ----------

DUMMY_CATALOG: List[dict] = [
    {"id": "1", "title": "Sunset Drive", "artist": "Neon Wave", "duration": "3:24", "cover": "https://picsum.photos/seed/1/300"},
    {"id": "2", "title": "Midnight Echoes", "artist": "Lunar Tide", "duration": "4:02", "cover": "https://picsum.photos/seed/2/300"},
    {"id": "3", "title": "Golden Hour", "artist": "Paper Skies", "duration": "3:47", "cover": "https://picsum.photos/seed/3/300"},
    {"id": "4", "title": "Electric Bloom", "artist": "Neon Wave", "duration": "2:58", "cover": "https://picsum.photos/seed/4/300"},
    {"id": "5", "title": "Slow Static", "artist": "Velvet Room", "duration": "3:15", "cover": "https://picsum.photos/seed/5/300"},
    {"id": "6", "title": "Coastal Drift", "artist": "Paper Skies", "duration": "4:20", "cover": "https://picsum.photos/seed/6/300"},
    {"id": "7", "title": "Glass Horizon", "artist": "Lunar Tide", "duration": "3:33", "cover": "https://picsum.photos/seed/7/300"},
    {"id": "8", "title": "Afterglow", "artist": "Velvet Room", "duration": "3:09", "cover": "https://picsum.photos/seed/8/300"},
    {"id": "9", "title": "Northern Lights", "artist": "Echo Valley", "duration": "4:45", "cover": "https://picsum.photos/seed/9/300"},
    {"id": "10", "title": "Quiet Static", "artist": "Echo Valley", "duration": "2:50", "cover": "https://picsum.photos/seed/10/300"},
]

# In-memory "database" of downloaded songs. Resets whenever the server restarts.
library_db: List[dict] = []


# ---------- Routes ----------

@app.get("/")
def root():
    return {"status": "ok", "message": "Music Library API is running"}


@app.get("/api/search", response_model=List[Song])
def search_songs(q: str = ""):
    """Dummy search — filters an in-memory catalog instead of calling a real music API."""
    if not q.strip():
        return []
    q_lower = q.lower()
    return [
        s for s in DUMMY_CATALOG
        if q_lower in s["title"].lower() or q_lower in s["artist"].lower()
    ]


@app.post("/api/download", response_model=Song)
async def download_song(song: Song):
    """Dummy download — simulates fetching a file, then saves metadata to the 'database'."""
    if any(s["id"] == song.id for s in library_db):
        raise HTTPException(status_code=400, detail=f'"{song.title}" is already in your library')

    await asyncio.sleep(1)  # pretend this takes a moment, like a real download

    library_db.append(song.dict())
    return song


@app.get("/api/library", response_model=List[Song])
def get_library():
    """Dummy DB read — returns everything 'downloaded' so far."""
    return library_db


@app.delete("/api/library/{song_id}")
def remove_from_library(song_id: str):
    """Dummy DB delete — removes a song from the in-memory library."""
    global library_db
    before = len(library_db)
    library_db = [s for s in library_db if s["id"] != song_id]
    if len(library_db) == before:
        raise HTTPException(status_code=404, detail="Song not found in library")
    return {"message": "Removed from library"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
