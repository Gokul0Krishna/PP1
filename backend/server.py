import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
import librosa
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
load_dotenv()   

DOWNLOAD_DIR = os.getenv("music_dir") or "./downloads"
XYZ_DIR = os.path.join(DOWNLOAD_DIR,"XYZ")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(XYZ_DIR, exist_ok=True)

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


def convert_mp3_to_xyz(mp3_path: str, xyz_path: str, sample_step: int = 100):
    """
    Loads an MP3, extracts (Time, Amplitude, Frequency), 
    and writes spatial coordinates to an .xyz file.
    """
    # Load audio file (y = audio time series, sr = sampling rate)
    y, sr = librosa.load(mp3_path, sr=None)
    duration = librosa.get_duration(y=y, sr=sr)
    hop_length = int(sr * segment_duration)
    spectral_centroids = librosa.feature.spectral_centroid(
                            y=y, sr=sr, hop_length=hop_length
                            )[0]
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    zcr = librosa.feature.zero_crossing_rate(y=y, hop_length=hop_length)[0]
    with open(xyz_path, "w") as f:
        for i in range(len(rms)):
            f.write(f"{spectral_centroids[i]:.2f} {rms[i]:.6f} {zcr[i]:.4f}\n")
@app.get("/api/scan")
@app.post("/api/scan")
async def scan():
    if not os.path.exists(DOWNLOAD_DIR):
        raise HTTPException(status_code=404, detail="Download directory does not exist")

    processed_files = []

    # Get all mp3 files from DOWNLOAD_DIR
    mp3_files = [f for f in os.listdir(DOWNLOAD_DIR) if f.endswith(".mp3")]

    if not mp3_files:
        return {
            "status": "ok",
            "message": "No MP3 files found to process",
            "files": []
        }

    # Offload CPU-heavy audio parsing to thread execution
    def process_all_files():
        generated = []
        for filename in mp3_files:
            mp3_path = os.path.join(DOWNLOAD_DIR, filename)
            base_name = os.path.splitext(filename)[0]
            xyz_filename = f"{base_name}.xyz"
            xyz_path = os.path.join(XYZ_DIR, xyz_filename)

            # Convert if not already processed
            if not os.path.exists(xyz_path):
                convert_mp3_to_xyz(mp3_path, xyz_path)
            
            generated.append(xyz_filename)
        return generated

    processed_files = await asyncio.to_thread(process_all_files)

    return {    
        "status": "ok",
        "processed_count": len(processed_files),
        "xyz_dir": XYZ_DIR,
        "files": processed_files
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)