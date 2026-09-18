# System Architecture: AI-Powered User Feedback Discovery Engine

Based on the product vision and problem statement, the system architecture is designed to support a modular, scalable pipeline that structures and clusters qualitative feedback before passing selective context to Generative AI models. This prevents the pitfalls of context-window limitations and ensures complete traceability to user evidence.

## 1. High-Level Architecture

The system operates using a decoupled backend architecture where an API coordinates intensive data processing background workers, vector databases, and LLMs. 

```text
Frontend
   │
   ▼
Web Application
   │
   ▼
API / Job Manager
   │
   ├───────────────┐
   ▼               ▼
Python Worker    LLM APIs
   │               │
   ├───────┐       │
   ▼       ▼       ▼
Embeddings  DB   Structured Analysis
   │       │
   └───────┤
           ▼
      Theme Discovery
           │
           ▼
      Evidence Store
           │
           ▼
       Web Dashboard
```

## 2. Technology Stack (Proposed MVP)

* **Antigravity** — Application development
* **Python (pandas)** — Data ingestion, cleaning, deduplication, and statistical analysis
* **PostgreSQL / Supabase** — Relational database for persistent storage of metadata, labels, and job state
* **pgvector (or equivalent)** — Vector storage for semantic retrieval and embedding storage
* **LLM API** — Structured metadata extraction, multi-label classification, and evidence synthesis
* **Vercel** — Web application deployment
* **Background Worker / Job System** — Robust queue processing for large CSV dataset ingestion and long-running AI pipelines
* **n8n (Future Extension)** — Integration for scheduled ingestions, scraping pipelines, notifications, or multi-service orchestration

## 3. Processing Pipeline

The core of the system is the data processing pipeline which transforms raw feedback into an evidence-backed theme map.

```text
                RAW CSV
                   │
                   ▼
        Data Cleaning & Validation
                   │
                   ▼
        Deduplication / Normalization
                   │
                   ▼
          Conversation Processing
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    Metadata    Semantic    Research
    extraction  embeddings    labels
        │          │          │
        └──────────┼──────────┘
                   ▼
            Theme Discovery
                   │
                   ▼
          Cluster Analysis
                   │
                   ▼
       Aggregate & Compare Themes
                   │
                   ▼
          Evidence Selection
                   │
                   ▼
          LLM-assisted Synthesis
                   │
                   ▼
        Opportunity Exploration
```

## 4. Sub-System Roles

### Data Processing
The initial ingestion layer. Handles heavy lifting associated with cleaning user data, dropping invalid rows, text normalization, deduplication, and baseline statistical analysis before data touches any ML models.

### Semantic Representation & Embeddings
Models convert conversation text into vectors. This numerical representation powers downstream tasks:
- Identifying semantically similar records (even if distinct vocabularies are used)
- Meaning-based search
- Emergent clustering

### Multi-Dimensional Classification
Instead of holistic summarization, an LLM/semantic classifier extracts precise, structured dimensions from text (e.g., `retrieval_intent`, `remembered_clues`, `search_strategy`, `failure_mode`, `sentiment`). This ensures that one piece of feedback can map to multiple problems or user states simultaneously.

### Theme Discovery (Clustering)
Unsupervised or semi-supervised clustering groups the semantic embeddings. This uncovers emergent themes—patterns that the researcher might not have explicitly defined in the initial "Research Lens". 

### LLM Synthesis
The generative LLM is positioned at the *end* of the pipeline. Rather than analyzing thousands of raw conversations, the LLM is fed a curated prompt containing:
- Aggregated statistics
- Cluster descriptions
- Representative evidence (and counterexamples)
This reduces token costs, ensures consistency, and keeps the LLM grounded in quantitative facts.

## 5. RAG's Architectural Role

The system does not use a traditional naïve RAG (Retrieval-Augmented Generation) foundation for everything. Vector retrieval acts specifically as an **evidence retrieval layer**.

- **Embeddings + structured analysis + clustering** = *Discovery*
- **Vector retrieval / RAG** = *Evidence investigation*
- **LLM** = *Interpretation and synthesis*

When a researcher investigates an emergent theme, the vector database retrieves the underlying conversations, enabling the LLM to summarize and interpret the exact supporting evidence without losing traceability.
