import pandas as pd
import numpy as np
import tiktoken
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
import pickle
import os

# Initialize tokenizer for chunking estimates
encoding = tiktoken.get_encoding("cl100k_base")

def truncate_text(text, max_tokens=256):
    """Simple chunking/truncation using tiktoken"""
    if pd.isna(text) or not isinstance(text, str):
        return ""
    tokens = encoding.encode(text)
    if len(tokens) > max_tokens:
        tokens = tokens[:max_tokens]
    return encoding.decode(tokens)

def generate_embeddings():
    cleaned_file = "filtered_intent_dataset.csv"
    if not os.path.exists(cleaned_file):
        print(f"Error: {cleaned_file} not found. Run filter.py first.")
        return

    print(f"Loading {cleaned_file}...")
    df = pd.read_csv(cleaned_file)
    
    # Process the entire dataset
    print(f"Loaded {len(df)} rows for embedding.")

    print("Truncating/Chunking text...")
    df['chunked_text'] = df['text_content'].apply(lambda x: truncate_text(x))
    
    print("Generating TF-IDF + SVD embeddings (Fallback to avoid PyTorch DLL issues)...")
    # Using LSA (Latent Semantic Analysis) to generate 384d embeddings natively without torch
    vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
    tfidf_matrix = vectorizer.fit_transform(df['chunked_text'])
    
    svd = TruncatedSVD(n_components=min(384, len(df)-1), random_state=42)
    embeddings = svd.fit_transform(tfidf_matrix)
    
    print("Embeddings generated. Saving to embeddings.pkl...")
    df['embedding'] = list(embeddings)
    
    with open("vectorizer.pkl", "wb") as f:
        pickle.dump((vectorizer, svd), f)
        
    df.to_pickle("embeddings.pkl")
    print("Saved successfully to embeddings.pkl")

if __name__ == "__main__":
    generate_embeddings()
