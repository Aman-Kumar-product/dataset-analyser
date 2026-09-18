import pandas as pd
import numpy as np
import umap
from sklearn.cluster import HDBSCAN
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

def filter_by_lens(df, lens_query, threshold=0.0):
    """
    Applies the Research Lens. We embed the query and compute cosine similarity 
    against all conversation embeddings. If it's too low, we drop it before clustering.
    """
    print(f"Applying Research Lens: '{lens_query}'")
    
    with open("vectorizer.pkl", "rb") as f:
        vectorizer, svd = pickle.load(f)
        
    query_tfidf = vectorizer.transform([lens_query])
    lens_embedding = svd.transform(query_tfidf)[0]
    
    embeddings_matrix = np.vstack(df['embedding'].values)
    
    # Calculate cosine similarity
    similarities = cosine_similarity(embeddings_matrix, [lens_embedding]).flatten()
    df['lens_similarity'] = similarities
    
    filtered_df = df[df['lens_similarity'] >= threshold].copy()
    print(f"Filtered dataset from {len(df)} to {len(filtered_df)} based on lens similarity >= {threshold}")
    
    return filtered_df

def cluster_embeddings():
    emb_file = "embeddings.pkl"
    if not os.path.exists(emb_file):
        print(f"Error: {emb_file} not found. Run embed.py first.")
        return
        
    print("Loading embeddings...")
    df = pd.read_pickle(emb_file)
    
    if len(df) < 10:
        print("Not enough data to cluster after filtering.")
        return

    embeddings = np.vstack(df['embedding'].values)
    
    print("Reducing dimensions with UMAP...")
    # Reduce dimensions for HDBSCAN. UMAP helps HDBSCAN find dense regions.
    n_neighbors = min(15, len(df) - 1)
    reducer = umap.UMAP(n_neighbors=n_neighbors, n_components=5, metric='cosine', random_state=42)
    reduced_embeddings = reducer.fit_transform(embeddings)
    
    print("Clustering with HDBSCAN...")
    min_cluster_size = max(3, min(15, len(df) // 30))
    clusterer = HDBSCAN(min_cluster_size=min_cluster_size, metric='euclidean')
    labels = clusterer.fit_predict(reduced_embeddings)
    
    df['cluster_label'] = labels
    
    num_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    num_noise = list(labels).count(-1)
    print(f"Found {num_clusters} clusters.")
    print(f"Noise points (-1): {num_noise} out of {len(df)}")
    
    # Show cluster sizes
    print("\nCluster Sizes:")
    print(df['cluster_label'].value_counts())
    
    print("\nSample records from the largest valid cluster:")
    valid_clusters = [l for l in set(labels) if l != -1]
    if valid_clusters:
        # Find largest cluster
        largest_cluster = df[df['cluster_label'] != -1]['cluster_label'].value_counts().idxmax()
        sample_texts = df[df['cluster_label'] == largest_cluster]['text_content'].head(3)
        for i, text in enumerate(sample_texts):
            safe_text = text[:150].encode('ascii', 'ignore').decode('ascii')
            print(f"- {safe_text}...")
    
    # Save the final results
    df.to_pickle("clustered_dataset.pkl")
    print("\nSaved clustered results to clustered_dataset.pkl")

if __name__ == "__main__":
    cluster_embeddings()
