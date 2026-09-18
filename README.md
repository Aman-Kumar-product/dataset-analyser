# AI Dataset Analyser

An intelligent, full-stack Machine Learning application designed to cluster, synthesize, and analyze unstructured user feedback datasets using NLP and LLMs.

## Features
- **Semantic Clustering:** Uses SentenceTransformers (`all-MiniLM-L6-v2`), UMAP, and HDBSCAN to group raw user feedback into distinct semantic themes.
- **AI Synthesis:** Leverages Groq (with a Gemini fallback) to automatically synthesize themes and extract actionable insights.
- **RAG Chatbot:** Ask questions directly to your dataset and get precise answers backed by exact citations using Retrieval-Augmented Generation.
- **Microservice Architecture:** A Next.js (React) frontend completely decoupled from a robust FastAPI Python backend.

## Tech Stack
- **Frontend:** Next.js, React, TailwindCSS, TypeScript
- **Backend:** Python, FastAPI, Uvicorn
- **AI/ML:** PyTorch, SentenceTransformers, UMAP, HDBSCAN, Groq, Google Generative AI

## Local Development Setup

### 1. Start the Backend (FastAPI)
The backend requires a Python virtual environment with the necessary ML dependencies installed.

```bash
cd worker
# Activate your virtual environment (Windows)
venv\Scripts\activate
# Start the server
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend (Next.js)
Open a separate terminal to run the frontend.

```bash
cd frontend
npm install
npm run dev
```

## Deployment Note (Ngrok)
Because this application uses heavy Machine Learning libraries, standard free-tier hosting limits (512MB RAM) are usually insufficient for the backend. To host the frontend on **Vercel** for free while running the backend locally:

1. Start your local backend on port 8000.
2. Run Ngrok to tunnel the port: `ngrok http 8000`
3. Copy the secure `https` Ngrok URL.
4. In your Vercel project settings, set `NEXT_PUBLIC_API_URL` to your Ngrok URL.
