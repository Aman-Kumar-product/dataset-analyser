# Phase-Wise Implementation Plan

Based on the system architecture, problem statement, and known edge cases, the development of the **AI-Powered User Feedback Discovery Engine** will be executed in a phased approach. This ensures that foundational data integrity is established before integrating complex LLM synthesis, effectively managing costs and technical risk.

---

## Phase 1: Foundational Infrastructure & Data Ingestion (Weeks 1-2)

**Goal:** Establish the backend infrastructure, database schema, and robust data cleaning pipelines to ensure high-quality data ingestion.

* **Database Setup**: Initialize PostgreSQL/Supabase and enable `pgvector` for vector storage.
* **Schema Design**: Create tables for `conversations`, `metadata`, `clusters`, and `jobs`.
* **Ingestion Worker**: Build the Python worker to handle raw CSV uploads.
* **Edge Case Mitigation (1.1, 1.4)**: 
  * Implement exact-match hashing and near-duplicate detection to prevent redundant/spam feedback.
  * Build a heuristic pre-filter to drop extremely vague, low-information feedback (e.g., "1 star") before it enters the ML pipeline.
* **Web App Skeleton**: Set up the Antigravity frontend and Vercel deployment for the API/Job Manager.

---

## Phase 2: Semantic Pipeline & Theme Discovery (Weeks 3-4)

**Goal:** Transform clean text into semantic embeddings and implement unsupervised clustering to discover emergent themes.

* **Embedding Generation**: Integrate a multilingual embedding model (e.g., `text-embedding-3-large`) to handle slang and non-English text (Mitigates Edge Case 1.3).
* **Chunking Strategy**: Implement hierarchical chunking for extremely long conversations (e.g., Reddit threads) to preserve core intent without dilution (Mitigates Edge Case 1.2).
* **Clustering Engine**: Implement HDBSCAN (or similar density-based clustering) for Theme Discovery.
* **Edge Case Mitigation (2.1, 2.2)**: 
  * Apply the "Research Lens" vector filter *before* clustering to avoid irrelevant dominant themes (e.g., pricing complaints).
  * Configure hierarchical clustering rules to allow researchers to unpack massive "Junk Drawer" or noise clusters.

---

## Phase 3: LLM Classification & Synthesis (Weeks 5-6)

**Goal:** Extract structured multi-dimensional attributes from conversations and safely synthesize insights using generative LLMs.

* **Multi-Dimensional Classification**: Configure the LLM/Classifier to extract structured dimensions (`retrieval_intent`, `remembered_clues`, `failure_mode`). This handles contradictory feedback by allowing multiple tags per conversation (Mitigates Edge Case 2.3).
* **Evidence Retrieval (RAG)**: Build the vector query layer to fetch the most relevant conversations for a given cluster.
* **Cost Management (Mitigates 3.3)**: Ensure expensive LLM extraction is only run on filtered, relevant subsets, utilizing cheaper/faster models where applicable.
* **Context & Hallucination Safeguards (Mitigates 3.1, 3.2)**: 
  * Limit context window overflow by sampling representative embeddings (e.g., 20 closest to centroid + 5 outliers) rather than entire clusters.
  * Enforce strict grounding prompts for LLM synthesis.

---

## Phase 4: Web Dashboard & Researcher Experience (Weeks 7-8)

**Goal:** Build the frontend interface that allows researchers to interact with the data, view themes, and inspect evidence.

* **Dataset Overview UI**: Display total conversations, sources, and top-level theme counts.
* **Theme Exploration UI**: Visualize clusters, their sizes, and the extracted multi-dimensional statistics (e.g., % of users who forgot the exact date).
* **Evidence Store UI**: Build the side-by-side view where LLM summaries are heavily cross-referenced with top verbatim quotes. This allows researchers to immediately spot hallucinations.
* **Graceful Failures (Mitigates 4.1)**: Build UI states for "Empty" custom research lenses, instantly informing the user when zero vectors match their query thresholds.

---

## Phase 5: Post-MVP & Advanced Capabilities (Ongoing)

**Goal:** Expand the system into a generalized AI research infrastructure layer.

* **Automated Ingestion**: Integrate `n8n` to build scheduled scraping pipelines (App Store, Reddit, Forums) to replace manual CSV uploads.
* **Exporting**: Allow researchers to export structured results and quantitative evidence into formats suitable for presentations or further statistical software.
* **Lens Expansion**: Configure new templates for additional research lenses beyond "Photo Search & Retrieval" (e.g., "Photo Organization", "Face/People Discovery").
