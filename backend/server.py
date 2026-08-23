import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
load_dotenv()   

DOWNLOAD_DIR = os.getenv("music_dir") or "./downloads"
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
    

    output_template = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")
    
    cmd = [
        "yt-dlp",
        f"ytsearch1:{clean_title}",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",  # Best quality
        "--output", output_template,
        "--embed-thumbnail",
        "--add-metadata",
        "--no-playlist"
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
            logger.error(f"yt-dlp failed for '{clean_title}': {err_msg}")
            raise HTTPException(
                status_code=500, 
                detail=f"yt-dlp execution failed: {err_msg}"
            )
            
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="yt-dlp executable is not installed or not found in PATH."
        )
        
    return {
        "status": "success",
        "query": clean_title,
        "message": f"Download completed for '{clean_title}'.",
        "download_dir": DOWNLOAD_DIR
    }

async def process_batch_downloads(songs: List[str]):
    for song_title in songs:
        try:
            logger.info(f"Downloading {song_title}")
            await download_music(title=song_title)
        except Exception as e:
            logger.error(f"Failed to download {song_title}: {e}")

@app.get("/api/temp")
@app.post("/api/temp")
async def temp(background_tasks: BackgroundTasks):
    popular_songs = [
        "I Just Might",
        "The Fate of Ophelia",
        "Golden",
        "Ordinary",
        "Choosin' Texas",
        "Die with a Smile",
        "End of Beginning",
        "Aperture",
        "Drop Dead",
        "Stateside"
    ]
    background_tasks.add_task(process_batch_downloads, popular_songs)
    return {
        "status": "success",
        "message": "Batch download started in background for 10 popular songs."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)