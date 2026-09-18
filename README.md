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
