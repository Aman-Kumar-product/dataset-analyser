import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
import os
import sys
import re

def filter_dataset(intent_arg="", keyword_arg=""):
    input_file = "cleaned_dataset.csv"
    output_file = "filtered_intent_dataset.csv"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return
        
    print(f"Loading {input_file} for intent filtering...")
    df = pd.read_csv(input_file)
    
    if df.empty:
        print("Dataset is empty. Skipping filtering.")
        return
        
    # If called from CLI, override with sys.argv
    if len(sys.argv) > 1:
        intent_arg = sys.argv[1]
    if len(sys.argv) > 2:
        keyword_arg = sys.argv[2]
    
    # Apply defaults if blank
    if not intent_arg or intent_arg.strip() == "":
        intent_arg = "using the new ask feature, gemini gave me the wrong photo, ai search is too slow, AI hallucinated photos, prompt to find pictures"
        print(f"No intent provided. Using defaults: {intent_arg}")
        
    if not keyword_arg or keyword_arg.strip() == "":
        keyword_arg = "gemini, ai, artificial intelligence, ask, prompt"
        print(f"No keywords provided. Using defaults: {keyword_arg}")
        
    keywords = [k.strip().lower() for k in keyword_arg.split(',') if k.strip()]
    intents = [i.strip() for i in intent_arg.split(',') if i.strip()]
    
    print(f"Filtering dataset against {len(keywords)} keywords and {len(intents)} semantic intents.")
    
    # 1. Exact Keyword Filtering (Regex)
    if keywords:
        pattern = '|'.join([r'\b' + re.escape(k) + r'\b' for k in keywords])
        df['has_keyword'] = df['text_content'].fillna("").astype(str).str.contains(pattern, case=False, regex=True)
    else:
        df['has_keyword'] = False
        
    print(f"Regex Keyword matches: {df['has_keyword'].sum()} rows.")
    
    # 2. Semantic Filtering and RAG Knowledge Base Generation
    print(f"Loading SentenceTransformer model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print(f"Encoding {len(df)} entire dataset comments for RAG Knowledge Base...")
    texts = df['text_content'].astype(str).tolist()
    corpus_embeddings = model.encode(texts, convert_to_tensor=True, show_progress_bar=True)
    
    # Save the full corpus embeddings for RAG
    import pickle
    with open("corpus_knowledge_base.pkl", "wb") as f:
        pickle.dump({"texts": texts, "embeddings": corpus_embeddings.cpu().numpy()}, f)
    print("Saved full corpus embeddings to corpus_knowledge_base.pkl for RAG chat.")
    
    if intents:
        print("Encoding target intents...")
        intent_embeddings = model.encode(intents, convert_to_tensor=True)
        
        print("Calculating cosine similarity scores...")
        cosine_scores = util.cos_sim(corpus_embeddings, intent_embeddings)
        max_scores, _ = cosine_scores.max(dim=1)
        df['intent_score'] = max_scores.cpu().numpy()
        
        # 0.35 threshold 
        THRESHOLD = 0.35
        # Only rows that didn't match keyword need to be checked for semantic threshold (technically it's an OR)
        semantic_matches = df[df['intent_score'] >= THRESHOLD]
        print(f"Semantic AI matches (score >= {THRESHOLD}): {len(semantic_matches)} rows.")
        
        # Combine keyword matches and semantic matches
        final_df = df[df['has_keyword'] | (df['intent_score'] >= THRESHOLD)].copy()
    else:
        final_df = df[df['has_keyword']].copy()
    
    print(f"Filtered dataset from {len(df)} rows down to {len(final_df)} search-related rows.")
    
    # Drop the score columns to keep the CSV clean
    for col in ['has_keyword', 'intent_score']:
        if col in final_df.columns:
            final_df = final_df.drop(columns=[col])
            
    final_df.to_csv(output_file, index=False)
    print(f"Saved filtered dataset to {output_file}")

if __name__ == "__main__":
    filter_dataset()
