# Edge Cases & Mitigation Strategy

This document outlines potential edge cases and challenges that may arise in the **AI-Powered User Feedback Discovery Engine** based on its architecture and problem domain. Addressing these edge cases ensures the system remains scalable, reliable, and strictly tied to evidence-backed insights.

## 1. Data Ingestion & Quality Edge Cases

### 1.1 Vague or Non-Actionable Feedback
* **Edge Case**: Feedback such as "It doesn't work," "1 star," or "I hate the new update" contains no actionable context for the "Photo Search & Retrieval" lens.
* **Mitigation**: The system must have a pre-filtering mechanism during the Data Processing and Metadata Extraction phase to discard or flag low-information-density text before it incurs LLM API costs.

### 1.2 Extreme Variability in Conversation Length
* **Edge Case**: A Google Play Store review might be a single sentence (10 words), while a Reddit discussion might involve 50 back-and-forth comments (10,000 words).
* **Mitigation**: The processing pipeline must support chunking or hierarchical summarization for long threads, ensuring that the semantic embeddings correctly capture the core intent without getting diluted by the noise of a long thread.

### 1.3 Multi-Lingual and Slang-Heavy Text
* **Edge Case**: Users might use heavy internet slang, misspellings, or submit feedback in non-English languages.
* **Mitigation**: The embedding model must be highly multilingual (e.g., OpenAI's `text-embedding-3-large` or a robust multilingual open-source model). The structured analysis step should include a normalization instruction.

### 1.4 Redundant or Spam Feedback
* **Edge Case**: Users spamming the exact same review, cross-posting across platforms, or bot-generated noise.
* **Mitigation**: The Deduplication / Normalization phase must use exact-match hashing and near-duplicate detection (e.g., MinHash or cosine similarity thresholding) to prevent frequency stats from being artificially inflated.

## 2. Classification & Discovery Edge Cases

### 2.1 Irrelevant Dominant Themes
* **Edge Case**: The dataset contains 80% feedback about a recent pricing change, drowning out the 20% related to the specific research lens ("Photo Search & Retrieval").
* **Mitigation**: The "Research Lens" parameter must act as a strict vector filter or initial prompt gatekeeper so the clustering step focuses *only* on relevant embeddings, rather than attempting to cluster the entire noisy dataset.

### 2.2 The "Junk Drawer" Cluster
* **Edge Case**: The clustering algorithm (e.g., HDBSCAN) dumps a massive percentage of semantically ambiguous conversations into a single noisy outlier cluster (or "noise" label).
* **Mitigation**: Allow hierarchical clustering so researchers can zoom into large, dense clusters. Provide UI mechanisms to hide or de-prioritize the noise cluster.

### 2.3 Contradictory Feedback Within a Single Record
* **Edge Case**: A user writes, "I love the face search, it finds my daughter perfectly, but it completely fails to find pictures of my dog."
* **Mitigation**: The Multi-Dimensional Classification design solves this by allowing multiple `retrieval_intent` and `failure_mode` labels to be tagged to the same conversation.

## 3. LLM Synthesis & Evidence Edge Cases

### 3.1 LLM Hallucination and Loss of Traceability
* **Edge Case**: During the LLM-assisted synthesis, the generative model makes sweeping generalizations about a cluster that aren't actually supported by the raw evidence.
* **Mitigation**: The prompt to the LLM must enforce strict grounding. The UI must *always* present the generated summary side-by-side with the top 5-10 verbatim quotes from that cluster (Evidence Store). If the quote doesn't match the summary, the researcher can immediately spot the hallucination.

### 3.2 Context Window Overflow During Synthesis
* **Edge Case**: A researcher selects a massive cluster (e.g., 2,000 conversations) and asks the LLM to synthesize the "Common Search Behaviours." Passing all 2,000 conversations exceeds the context window.
* **Mitigation**: Use RAG strategically. Instead of passing the whole cluster, retrieve a statistically representative sample (e.g., the 20 embeddings closest to the cluster's centroid, plus 5 outliers for contrast) to feed into the synthesis prompt.

### 3.3 Runaway LLM API Costs
* **Edge Case**: Ingesting a dataset of 500,000 rows and running a complex LLM extraction prompt on every single row results in a massive API bill.
* **Mitigation**: Rely heavily on cheap semantic embeddings for the initial sorting and clustering. Only run expensive LLM extraction prompts on the subsets of data that fall into relevant clusters, or use a cheaper/faster model (e.g., GPT-4o-mini or Claude 3 Haiku) for the bulk classification tasks.

## 4. UI/UX Edge Cases

### 4.1 "Empty" Research Lenses
* **Edge Case**: A researcher applies a highly specific custom lens (e.g., "Searching for photos of vintage cars from 1980s") and the dataset contains zero relevant conversations.
* **Mitigation**: The UI should fail gracefully, instantly informing the user that no vectors match the semantic threshold, rather than passing an empty context to the LLM and generating a hallucinated response.
