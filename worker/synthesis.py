import os
import json
import pandas as pd
from groq import Groq
from dotenv import load_dotenv
import time

load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    print("Error: GROQ_API_KEY not found in .env")
    exit(1)

client = Groq(api_key=API_KEY)

def synthesize_cluster(cluster_id, texts):
    print(f"Synthesizing Cluster {cluster_id} with {len(texts)} samples...")
    
    evidence = "\n".join([f"- {t}" for t in texts])
    
    prompt = f"""
    You are a UX Researcher. Analyze the following user feedback related to photo search and retrieval.
    
    Summarize the core theme objectively and structure your response as valid JSON with the following schema:
    {{
        "theme_name": "A short, descriptive name for this cluster of feedback",
        "summary": "A 2-3 sentence objective summary of what users are saying in this cluster"
    }}
    
    User Feedback:
    {evidence}
    
    Output ONLY valid JSON, no markdown formatting.
    """
    
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise Exception("GROQ_API_KEY not found")
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="groq/compound",
            response_format={"type": "json_object"},
            temperature=0.2
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Failed to synthesize cluster {cluster_id} with Groq: {str(e)}")
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                print(f"Falling back to Gemini API for cluster {cluster_id}...")
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-3.5-flash', generation_config={"response_mime_type": "application/json"})
                resp = model.generate_content(prompt)
                return json.loads(resp.text)
            except Exception as gemini_e:
                print(f"Gemini fallback failed for cluster {cluster_id}: {str(gemini_e)}")
        
        return None

def main():
    if not os.path.exists("clustered_dataset.pkl"):
        print("Error: clustered_dataset.pkl not found. Run cluster.py first.")
        return
        
    df = pd.read_pickle("clustered_dataset.pkl")
    valid_clusters = [c for c in df['cluster_label'].unique() if c != -1]
    
    if not valid_clusters:
        print("No valid clusters found to synthesize.")
        return
        
    # Export filtered clustered data to CSV
    filtered_df = df[df['cluster_label'] != -1].copy()
    if 'embedding' in filtered_df.columns:
        filtered_df = filtered_df.drop(columns=['embedding'])
    filtered_df.to_csv("filtered_clusters.csv", index=False)
    print("Exported filtered clustered data to filtered_clusters.csv")
        
    results = {}
    
    for cluster_id in valid_clusters:
        cluster_data = df[df['cluster_label'] == cluster_id]
        
        # Save individual cluster data to CSV for download
        cluster_data.drop(columns=['embedding'], errors='ignore').to_csv(f"cluster_{cluster_id}.csv", index=False)
        
        # Sample up to 20 conversations to avoid token limits
        sample_size = min(20, len(cluster_data))
        sampled_texts = cluster_data['text_content'].sample(sample_size, random_state=42).tolist()
        
        synthesis = synthesize_cluster(cluster_id, sampled_texts)
        if synthesis:
            results[int(cluster_id)] = {
                "size": len(cluster_data),
                "analysis": synthesis,
                "evidence_samples": sampled_texts[:5] # save 5 quotes for evidence trace
            }
        
        # Rate limit protection (prevent aggressive dropping of clusters)
        time.sleep(1.5)
            
    with open("synthesis_results.json", "w") as f:
        json.dump(results, f, indent=4)
        
    print("\nSynthesis complete! Results saved to synthesis_results.json")

if __name__ == "__main__":
    main()
