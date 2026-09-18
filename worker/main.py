from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import uuid

import ingest
import filter as filter_module
import embed
import cluster
import synthesis
import rag_chat

app = FastAPI(title="Dataset Analyser API")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/cluster")
async def run_clustering(
    file: List[UploadFile] = File(...),
    intent: Optional[str] = Form(""),
    keywords: Optional[str] = Form("")
):
    try:
        filenames = []
        for f in file:
            # Save uploaded files temporarily
            filename = f"{uuid.uuid4()}_{f.filename}"
            with open(filename, "wb") as buffer:
                buffer.write(await f.read())
            filenames.append(filename)

        print(f"Running pipeline on files: {filenames}")

        # 1. Ingest
        ingest.ingest_csv(filenames)
        
        # Cleanup uploaded raw files immediately to save space
        for f in filenames:
            if os.path.exists(f):
                os.remove(f)
                
        # 2. Filter
        filter_module.filter_dataset(intent, keywords)
        
        # 3. Embed
        embed.generate_embeddings()
        
        # 4. Cluster
        cluster.cluster_embeddings()
        
        return {"success": True, "message": "Clustering completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/synthesize")
async def run_synthesis():
    try:
        synthesis.main()
        if not os.path.exists("synthesis_results.json"):
            raise HTTPException(status_code=500, detail="Synthesis failed to produce results.")
            
        with open("synthesis_results.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    query: str

@app.post("/api/chat")
async def run_chat(request: ChatRequest):
    try:
        result = rag_chat.chat(request.query)
        if result and "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
