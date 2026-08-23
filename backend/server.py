import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import glob
from dotenv import load_dotenv

load_dotenv()   
DOWNLOAD_DIR = os.getenv("music_dir") or os.getenv("music") or "./downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

app = FastAPI(title="PP1 Music API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DownloadRequest(BaseModel):
    title: str

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Music Library API is running",
        "download_dir": DOWNLOAD_DIR
    }

@app.get("/api/download-music")
@app.post("/api/download-music")
async def download_music(title: Optional[str] = Query(None), body: Optional[DownloadRequest] = None):
    query_title = title or (body.title if body else None)
    
    if not query_title or not query_title.strip():
        raise HTTPException(
            status_code=400,
            detail="Song title or search query is required."
        )

    clean_title = query_title.strip()
    cmd = [
        "spotdl",
        "download",
        clean_title,
        "--output", f"{DOWNLOAD_DIR}/{{artists}} - {{title}}.{{output-ext}}",
        "--format", "mp3"
    ]
    
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            err_msg = stderr.decode().strip() or stdout.decode().strip()
            raise HTTPException(
                status_code=500, 
                detail=f"spotDL execution failed: {err_msg}"
            )
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="spotDL command line tool is not installed or not in PATH."
        )
        
    return {
        "status": "success",
        "query": clean_title,
        "message": f"Download completed for '{clean_title}'.",
        "download_dir": DOWNLOAD_DIR
    }

@app.get("/api/library")
def get_library():
    """List all downloaded MP3 songs in the download directory."""
    if not os.path.exists(DOWNLOAD_DIR):
        return []
    
    files = glob.glob(os.path.join(DOWNLOAD_DIR, "*.mp3"))
    songs = []
    for f in files:
        filename = os.path.basename(f)
        stat = os.stat(f)
        songs.append({
            "id": filename,
            "filename": filename,
            "title": os.path.splitext(filename)[0],
            "size_bytes": stat.st_size,
            "created_at": stat.st_mtime
        })
    return songs

@app.get("/api/stream/{filename}")
def stream_song(filename: str):
    """Stream or download a specific audio file."""
    file_path = os.path.join(DOWNLOAD_DIR, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="audio/mpeg", filename=filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

