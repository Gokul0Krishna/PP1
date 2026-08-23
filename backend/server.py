import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import glob
from dotenv import load_dotenv

load_dotenv()   
MD = os.getenv("music")

app = FastAPI(title="PP1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Music Library API is running"}

@app.get("/api/download-music")
async def download_music(title: str):
    cmd = [
        "spotdl",
        "download",
        title,
        "--output", f"{DOWNLOAD_DIR}/{{artists}} - {{title}}.{{output-ext}}",
        "--format", "mp3"
    ]
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        raise HTTPException(
            status_code=500, 
            detail=f"spotDL failed: {stderr.decode()}"
        )
        
    return {"status": "success", "query": title, "message": "Download completed."}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="[IP_ADDRESS]", port=8000, reload=True)
