-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table to store imported feedback/conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(255) UNIQUE, -- ID from the original platform to prevent duplicates
    source VARCHAR(50), -- e.g., 'app_store', 'reddit'
    text_content TEXT NOT NULL,
    text_hash VARCHAR(64) UNIQUE, -- SHA-256 hash of the normalized text to prevent semantic duplicates
    created_date TIMESTAMP,
    rating NUMERIC(3,1),
    embedding vector(3072), -- text-embedding-3-large dimension size
    is_processed BOOLEAN DEFAULT FALSE,
    cluster_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store structured classification dimensions per conversation
CREATE TABLE metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    dimension_name VARCHAR(100), -- e.g., 'retrieval_intent', 'failure_mode'
    dimension_value VARCHAR(255),
    confidence_score NUMERIC(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (conversation_id, dimension_name, dimension_value)
);

-- Table to store discovered clusters
CREATE TABLE clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    description TEXT,
    centroid vector(3072),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key for conversations -> clusters
ALTER TABLE conversations ADD CONSTRAINT fk_cluster FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL;

-- Table to track background processing jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50), -- e.g., 'csv_ingest', 'embedding_generation'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    progress INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
