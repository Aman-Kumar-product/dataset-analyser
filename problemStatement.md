# AI-Powered User Feedback Discovery Engine

## 1. Problem Overview

Product teams often have access to thousands of user reviews, support conversations, Reddit discussions, app-store reviews, YouTube comments, and other forms of qualitative feedback.

The problem is not a lack of feedback.

The problem is that **large-scale qualitative feedback is difficult to systematically analyze, compare, and turn into evidence-backed product opportunities.**

A dataset containing 10,000+ conversations may contain hundreds of distinct user problems, behaviours, workarounds, unmet needs, and recurring patterns. However, manually reading and analysing every conversation is slow and difficult to scale.

At the same time, simply uploading the entire dataset to a generative AI model is not a reliable solution because of context-window limitations, cost, processing time, and the tendency of LLMs to summarize rather than systematically discover and quantify patterns across large datasets.

The goal is therefore to build an **AI-powered qualitative research and discovery engine** that can process large datasets of user conversations, identify meaningful patterns and themes, preserve the evidence behind those findings, and help researchers investigate specific product opportunity areas.

---

# 2. Initial Research Domain

The initial dataset consists of publicly available conversations related to **Google Photos**, including:

* Google Play Store reviews
* Apple App Store reviews
* Reddit discussions
* Google Photos Help/Community discussions
* YouTube comments
* Public forums
* Other publicly available discussions and comments

The initial research focus is:

> **Photo search and retrieval**

Specifically, the system should help uncover how people attempt to find photos, what they remember about those photos, what information they have forgotten, what search strategies they use, where current retrieval experiences fail, and what unmet needs or opportunities emerge from these behaviours.

The architecture, however, should not be so tightly coupled to Google Photos that it becomes unusable for other qualitative datasets.

The underlying analysis engine should remain **domain-agnostic**, while allowing researchers to apply a specific **research lens** such as:

> Photo Search & Retrieval

---

# 3. Core Problem

Given a large qualitative dataset, a researcher needs to move from:

**Raw conversations**

to:

**Structured observations**

to:

**Emergent themes**

to:

**Evidence-backed user problems**

to:

**Potential product opportunities**

without requiring an LLM to process the entire dataset simultaneously.

The system must therefore solve the following problem:

> **How can large-scale qualitative feedback be computationally processed, structured, clustered, filtered, investigated, and synthesized so that researchers can discover meaningful user problems and product opportunities while retaining traceability to the original user evidence?**

---

# 4. Why Existing Approaches Are Insufficient

## 4.1 Manual analysis

A researcher can manually read 10,000 conversations and tag them.

However:

* It is extremely time-consuming.
* Researchers may become inconsistent over time.
* Rare but important patterns can be missed.
* Comparing hundreds of themes becomes difficult.
* Quantifying the prevalence of qualitative patterns is difficult.
* Maintaining a connection between themes and supporting evidence becomes cumbersome.

Manual research remains valuable, but it should be supported by computational analysis rather than being the only mechanism.

---

## 4.2 Sending the entire CSV to an LLM

A generative AI model can produce useful summaries from a dataset, but asking it to analyze thousands of raw conversations in one context creates several problems:

* Context-window limitations
* High token consumption
* High cost
* Slow processing
* Difficulty maintaining consistent classification across thousands of records
* Potential loss of low-frequency but meaningful patterns
* Weak quantitative grounding
* Difficulty tracing conclusions back to the full dataset

The system should therefore **reduce and structure the dataset before asking an LLM to perform higher-level synthesis.**

---

## 4.3 Basic sentiment analysis

Sentiment analysis can identify whether conversations are positive, negative, or neutral.

However:

> Sentiment does not explain the user's problem.

For example, two negative comments may describe completely different problems:

* "Search can't find the photo I need."
* "My photos are duplicated."
* "Face grouping keeps putting my children together."
* "I can't remember where I saved an old screenshot."

All may be negative, but they represent different user needs and product opportunities.

Therefore sentiment should be treated as **supporting metadata**, not the primary discovery mechanism.

---

## 4.4 Keyword or regex-based categorization

Keyword matching can identify obvious mentions such as:

* search
* album
* face
* photo
* date

However, users describe the same problem in many different ways.

For example:

> "I remember the picture from our Goa trip but can't locate it."

may never contain words such as "retrieval" or "search."

Semantic analysis is therefore required to identify conceptually similar conversations even when users use different vocabulary.

---

# 5. Product Vision

Build an AI-powered **Qualitative Feedback Discovery Engine** that allows a researcher to upload a large dataset and progressively transform it into an evidence-backed map of user problems and opportunities.

The system should function as:

> **A research engine, not merely a summarization tool.**

The engine should support two complementary capabilities:

### A. Structured analysis

Extract consistent attributes from individual conversations.

### B. Emergent discovery

Discover patterns and themes that were not explicitly defined beforehand.

This combination is critical.

If everything is predefined, the system can only confirm what the researcher already expects.

If everything is completely unsupervised, the results may be difficult to interpret or connect to the research question.

The system should therefore combine:

**Researcher-defined dimensions + AI-generated/emergent themes.**

---

# 6. Research Lens

The initial research lens is:

## Photo Search & Retrieval

The research lens should guide what the system looks for without forcing every conversation into a predefined category.

The lens should investigate dimensions such as:

### 6.1 Retrieval intent

What is the user trying to find?

Possible examples:

* A person
* A group of people
* An event
* A place
* An object
* A document
* A screenshot
* A particular time period
* A visually remembered photo
* A photo associated with a relationship
* An unknown or unusual retrieval target

---

### 6.2 Remembered information

What information does the user remember about the desired photo?

Examples:

* Person
* Relationship
* Location
* Event
* Approximate date
* Season
* Object
* Visual appearance
* Text appearing in the image
* Circumstances surrounding the photo
* Story or context

---

### 6.3 Forgotten information

What information does the user not remember?

Examples:

* Exact date
* Filename
* Album
* Location
* Person's name
* Search keywords
* Folder
* Context
* Where the photo was originally stored

---

### 6.4 Search strategy

How does the user attempt to retrieve the photo?

Examples:

* Keyword search
* Natural-language description
* Person search
* Location search
* Date filtering
* Browsing
* Scrolling through timeline
* Opening albums
* Searching repeatedly with different queries
* Asking another person
* Using another application
* Giving up

---

### 6.5 Retrieval failure

Where does the process break?

Examples:

* User cannot formulate an effective query
* Search returns no results
* Search returns too many results
* Search returns incorrect results
* Relevant photo is not surfaced
* User cannot remember sufficient metadata
* System does not understand contextual intent
* Face/person identification fails
* Location/date information is unavailable
* User resorts to manual browsing
* User abandons the search

---

### 6.6 Desired outcome

What does the user ultimately want?

Examples:

* Find one specific photo
* Find all photos matching a memory
* Find photos of a particular person
* Find photos from an event
* Find a forgotten document/screenshot
* Rediscover an old photo
* Confirm whether a photo exists
* Organize photos after finding them

---

# 7. Key Design Principle: Multi-Dimensional Analysis

A single conversation should not necessarily receive one category.

For example:

> "I know I have a photo of my daughter from our 2019 Paris trip, but I can't find it."

This conversation contains multiple signals:

```text
Retrieval target:
Person

Additional context:
Location

Time:
Approximate year

Memory:
Person + trip + location + approximate time

Failure:
Unable to retrieve

Potential problem:
Combining multiple weak contextual clues
```

Therefore the system should support **multi-label and multi-dimensional classification** rather than forcing every conversation into one category.

---

# 8. Emergent Theme Discovery

In addition to predefined research dimensions, the system should identify clusters of semantically similar conversations.

For example, the system may discover a cluster such as:

### Event-based retrieval

Users remember:

* The event
* The people involved
* The location
* The circumstances

But frequently do not remember:

* Exact date
* Filename
* Album
* Search terms

This may reveal a broader user need:

> Users may remember the story surrounding a photo more reliably than the metadata associated with the photo.

This insight should emerge from the data rather than being hard-coded into the system.

---

# 9. Evidence-First Research

Every discovered theme or opportunity should remain connected to the original evidence.

The system should never produce an important conclusion without allowing the researcher to inspect the conversations that support it.

For every theme, the researcher should be able to see:

* Number of conversations
* Percentage of relevant conversations
* Sources
* Representative examples
* Contradictory examples
* Common remembered clues
* Common missing information
* Search behaviours
* Failure modes
* Relevant sentiment
* Related themes
* Confidence or evidence strength

This creates an important principle:

> **AI-generated synthesis must remain traceable to user evidence.**

---

# 10. Proposed Processing Pipeline

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

---

# 11. Technical Approach

The system should use different technologies for different jobs.

## Data processing

Python and pandas can handle:

* CSV ingestion
* Cleaning
* Deduplication
* Filtering
* Aggregation
* Statistical analysis

---

## Semantic representation

Embedding models can convert conversations into numerical representations that allow the system to:

* Identify semantically similar conversations
* Search conversations by meaning
* Cluster conversations
* Compare themes
* Retrieve relevant evidence

---

## Classification

An LLM and/or semantic classifier can extract structured information such as:

```text
retrieval_intent
remembered_clues
forgotten_clues
search_strategy
failure_mode
desired_outcome
source
sentiment
```

---

## Theme discovery

Clustering should be used to identify groups of semantically similar conversations.

The system should allow researchers to investigate:

* Large clusters
* Small but distinctive clusters
* Emerging clusters
* Overlapping themes
* Related clusters

The objective is not simply to maximize the number of clusters.

The objective is to identify **meaningful behavioural or problem patterns.**

---

## LLM synthesis

The LLM should operate primarily on:

* Aggregated statistics
* Cluster descriptions
* Structured observations
* Representative evidence
* Contradictory evidence
* Related themes

rather than the entire raw dataset.

This dramatically reduces context requirements while improving traceability and consistency.

---

# 12. RAG's Role

RAG should not be the foundation of the entire system.

Instead, vector retrieval can become an **evidence retrieval layer**.

For example, after discovering:

> Event-based retrieval

the researcher can ask:

> "Show me the conversations supporting this theme."

The system retrieves the most relevant original conversations.

The researcher can then ask:

> "What are the different ways users describe this problem?"

The system retrieves the relevant evidence and asks the LLM to synthesize it.

Therefore:

**Embeddings + structured analysis + clustering = discovery**

**Vector retrieval/RAG = evidence investigation**

**LLM = interpretation and synthesis**

---

# 13. Researcher Experience

The application should provide a workflow similar to:

```text
Upload Dataset
      ↓
Choose Research Lens
      ↓
Run Analysis
      ↓
Dataset Overview
      ↓
Discovered Themes
      ↓
Filter / Compare Themes
      ↓
Inspect Evidence
      ↓
Investigate Theme
      ↓
Generate Opportunity Hypothesis
```

---

# 14. Example Dashboard

## Dataset Overview

```text
Google Photos Research

10,247 conversations

Sources
Reddit              3,421
Google Play Store   4,122
YouTube             1,830
Forums                874

Retrieval-related
conversations: 2,841

Themes discovered: 37
```

---

# 15. Theme Exploration

Example:

```text
EVENT-BASED RETRIEVAL

614 conversations
21.6% of retrieval conversations

Remembered:
• People              71%
• Event               63%
• Location            44%
• Approximate time    28%

Forgotten:
• Exact date          67%
• Filename            91%
• Album               38%

Common search behaviour:
• Natural language
• Keyword search
• Manual browsing
```

The researcher should then be able to inspect the underlying evidence.

---

# 16. Opportunity Exploration

The system may generate an evidence-backed research hypothesis such as:

### Potential opportunity

Users frequently describe desired photos through the **event, people, relationships, and circumstances surrounding the photo**, rather than through traditional metadata.

### Evidence

* 614 related conversations
* Common references to events and people
* Frequent absence of exact dates
* Repeated manual browsing/search attempts

### Current behaviour

Users attempt to combine keywords, people, dates, and locations.

### Failure

The available search interaction may not fully accommodate situations where users remember the **context of a photo but not its metadata**.

### Further investigation

Researcher should inspect:

* High-confidence examples
* Low-confidence examples
* Counterexamples
* Differences between sources
* Differences between successful and failed retrieval attempts

The system should present this as a **research finding/hypothesis**, not as proof that a particular product feature should be built.

---

# 17. Important Non-Goals

The first version should NOT attempt to:

* Automatically determine the single "best" product opportunity
* Replace human researchers
* Automatically prescribe product solutions
* Treat sentiment as a proxy for importance
* Assume frequency equals importance
* Force all conversations into predefined categories
* Produce unsupported conclusions
* Hide the underlying evidence
* Require an LLM to process the entire dataset at once

The system should assist researchers in discovering and investigating opportunities.

---

# 18. Frequency Is Not the Same as Opportunity

A critical principle of the system is:

> **A frequently mentioned problem is not automatically the most valuable product opportunity.**

A theme may be:

* Frequently mentioned
* Rare but severe
* Growing
* Highly specific to a particular user segment
* Poorly solved by current workflows
* Associated with significant workarounds
* Associated with strong unmet needs

Therefore the system should provide multiple dimensions of evidence rather than rank themes using a single score.

Researchers should be able to compare themes using factual attributes such as:

* Frequency
* Source distribution
* Recency, where available
* Number of distinct users/conversations
* Failure frequency
* Workaround frequency
* Retrieval difficulty
* Evidence strength

The researcher makes the final judgment about opportunity.

---

# 19. Initial MVP

The first version should focus on proving the analysis pipeline rather than building a sophisticated autonomous agent.

### MVP capabilities

1. Upload CSV
2. Detect relevant text columns
3. Clean and normalize data
4. Generate embeddings
5. Extract structured retrieval attributes
6. Support multi-label classification
7. Discover semantic clusters
8. Display cluster sizes
9. Generate cluster descriptions
10. Show representative evidence
11. Filter by research dimensions
12. Apply the Photo Search & Retrieval lens
13. Generate evidence-backed theme summaries
14. Export structured results

---

# 20. Suggested Architecture

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

A practical prototype stack could be:

* **Antigravity** — application development
* **Python** — data processing and analysis
* **PostgreSQL/Supabase** — persistent storage
* **pgvector or equivalent vector storage** — semantic retrieval
* **LLM API** — structured extraction and synthesis
* **Vercel** — web application deployment
* **Background worker/job system** — large dataset processing

n8n can be added later if external workflows, scheduled ingestion, notifications, scraping pipelines, or multi-service orchestration become important.

---

# 21. Key Product Principle

The system should not simply answer:

> "What are people saying?"

It should help answer:

> **"What are people trying to do, what do they remember, what do they not remember, how do they currently solve the problem, where does the current experience break, what patterns repeatedly appear across users, and what evidence supports those observations?"**

This distinction defines the product.

---

# 22. Success Criteria

The system should be considered successful if a researcher can take a previously unmanageable dataset of approximately 10,000+ qualitative observations and, without manually reading every row:

1. Understand the major themes in the dataset.
2. Apply a specific research lens.
3. Discover themes that were not explicitly predefined.
4. Identify different types of search and retrieval problems.
5. Understand what users remember about desired photos.
6. Understand what information users commonly lack.
7. Identify common retrieval strategies.
8. Identify common failure modes.
9. Compare themes using quantitative evidence.
10. Inspect the original conversations behind any important finding.
11. Generate evidence-backed research hypotheses.
12. Continue investigating a theme without reprocessing the entire dataset.

---

# 23. Long-Term Vision

The long-term system should become a reusable **AI research infrastructure layer** for large-scale qualitative feedback.

The initial use case is:

> **Google Photos → Search & Retrieval**

But the architecture should support:

```text
Research Lens
     │
     ├── Photo Search & Retrieval
     ├── Photo Organization
     ├── Memories & Rediscovery
     ├── Face / People Discovery
     ├── Custom Lens
     └── Future Product Domains
```

The fundamental engine remains the same.

Only the research questions and analytical lens change.

---

# 24. Final Problem Definition

### Problem

Researchers have large volumes of qualitative user feedback but lack an efficient, evidence-preserving way to systematically transform that data into meaningful user problems, behavioural patterns, and product opportunity hypotheses.

Traditional manual analysis does not scale, while naive LLM-based analysis struggles with context limits and tends to produce summaries rather than systematic discovery.

### Proposed Solution

Build an AI-powered qualitative feedback discovery engine that combines:

* Large-scale data processing
* Semantic embeddings
* Multi-dimensional classification
* Emergent clustering
* Evidence retrieval
* Statistical aggregation
* LLM-assisted synthesis

The system should use a **generic analytical foundation with configurable research lenses**, initially focused on **photo search and retrieval**.

Its primary purpose is not to summarize what users said.

Its purpose is to help researchers **discover, compare, investigate, and substantiate patterns in how users behave and where their current experience fails.**

The central principle is:

> **Discover broadly. Filter intelligently. Synthesize selectively. Always preserve the evidence.**
