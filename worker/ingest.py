import os
import hashlib
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# PostgreSQL Database URL
# e.g., postgresql://user:password@localhost:5432/dataset_analyzer
DB_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/postgres")

def get_db_engine():
    return create_engine(DB_URL)

def normalize_text(text_str):
    if pd.isna(text_str) or not isinstance(text_str, str):
        return ""
    # Basic normalization: strip whitespace and lowercase for hashing
    return " ".join(text_str.strip().lower().split())

def hash_text(text_str):
    return hashlib.sha256(text_str.encode('utf-8')).hexdigest()

def is_valid_feedback(text_str):
    """Heuristic pre-filter: Drop rows with less than 3 words (e.g. '1 star')"""
    if pd.isna(text_str):
        return False
    words = text_str.split()
    if len(words) < 3:
        return False
    return True

def ingest_csv(file_paths):
    if isinstance(file_paths, str):
        file_paths = [file_paths]
    print(f"Loading {len(file_paths)} dataset(s)...")
    
    dfs = []
    for f in file_paths:
        print(f"- {f}")
        df_part = pd.read_csv(f)
        dfs.append(df_part)
        
    df = pd.concat(dfs, ignore_index=True)
    
    # Intelligent Column Detection
    possible_cols = ['unified_text', 'text_content', 'review', 'comment', 'text', 'feedback', 'content', 'description']
    text_col = None
    for col in possible_cols:
        # Case insensitive match
        matching_cols = [c for c in df.columns if c.lower() == col.lower()]
        if matching_cols:
            text_col = matching_cols[0]
            break
            
    if not text_col:
        # Fallback: Find the column with the longest average string length (most likely to be the feedback text)
        string_cols = df.select_dtypes(include=['object', 'string']).columns
        if len(string_cols) > 0:
            text_col = max(string_cols, key=lambda c: df[c].fillna("").astype(str).str.len().mean())
            print(f"Auto-detected text column based on content length: '{text_col}'")
        else:
            print("Error: Could not find any suitable text columns in CSV.")
            return
    else:
        print(f"Matched text column: '{text_col}'")

    initial_count = len(df)
    
    # 1. Drop rows with empty text
    df = df.dropna(subset=[text_col])
    
    # 2. Heuristic Filter (length >= 3 words)
    df = df[df[text_col].apply(is_valid_feedback)]
    
    # 3. Deduplication (Exact Match Hashing)
    df['normalized_text'] = df[text_col].apply(normalize_text)
    df['text_hash'] = df['normalized_text'].apply(hash_text)
    
    df = df.drop_duplicates(subset=['text_hash'])
    
    filtered_count = len(df)
    print(f"Filtered {initial_count - filtered_count} redundant or invalid rows.")
    print(f"{filtered_count} valid rows remaining for ingestion.")
    
    # Prepare DataFrame to match `conversations` table
    insert_df = pd.DataFrame({
        'source_id': df['record_id'].astype(str) if 'record_id' in df.columns else df.index.astype(str),
        'source': df['source'] if 'source' in df.columns else 'unknown',
        'text_content': df[text_col],
        'text_hash': df['text_hash'],
        'rating': df['rating'] if 'rating' in df.columns else None
    })
    
    # Save the cleaned dataset to CSV for Phase 2 pipeline
    cleaned_csv_path = "cleaned_dataset.csv"
    insert_df.to_csv(cleaned_csv_path, index=False)
    print(f"Cleaned dataset saved locally to {cleaned_csv_path} for embedding and clustering.")
    
    # If DB is configured, we can insert (mocked for now unless DB_URL is active)
    try:
        engine = get_db_engine()
        # Test connection
        with engine.connect() as conn:
            pass
        
        print("Inserting records into database...")
        # For a real insertion, we would use to_sql or raw queries with ON CONFLICT DO NOTHING
        # Example:
        # insert_df.to_sql('conversations', engine, if_exists='append', index=False)
        print("Mock Insertion Complete. (Set proper DB_URL and uncomment to_sql for actual insert)")
        
    except Exception as e:
        print(f"Database connection skipped or failed: {e}")
        print("Continuing with dry-run...")

if __name__ == "__main__":
    import sys
    input_files = sys.argv[1:] if len(sys.argv) > 1 else ["master_dataset.csv"]
    ingest_csv(input_files)
