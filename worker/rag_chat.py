import os
import sys
import pickle
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util
from groq import Groq
from dotenv import load_dotenv

def chat(query=None):
    if query is None:
        if len(sys.argv) < 2:
            return {"error": "No query provided"}
        query = sys.argv[1]
    
    if not os.path.exists("corpus_knowledge_base.pkl"):
        return {"error": "corpus_knowledge_base.pkl not found. Please upload and run a dataset first."}
        
    try:
        # 1. Load the full knowledge base
        with open("corpus_knowledge_base.pkl", "rb") as f:
            data = pickle.load(f)
            corpus_texts = data["texts"]
            corpus_embeddings = data["embeddings"]
            
        # 2. Embed the user's question
        # Suppress symlink warnings
        os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
        model = SentenceTransformer('all-MiniLM-L6-v2')
        query_embedding = model.encode([query], convert_to_tensor=True)
        
        # 3. Calculate similarity (Vector Search)
        import torch
        corpus_embeddings_tensor = torch.tensor(corpus_embeddings)
        cosine_scores = util.cos_sim(query_embedding, corpus_embeddings_tensor)[0]
        
        # 4. Retrieve Top 25 most relevant comments
        top_k = min(25, len(corpus_texts))
        top_results = torch.topk(cosine_scores, k=top_k)
        
        relevant_comments = []
        for score, idx in zip(top_results[0], top_results[1]):
            relevant_comments.append(corpus_texts[idx])
            
        evidence = "\n".join([f"- {t}" for t in relevant_comments])
        
        # 5. Query the LLM
        load_dotenv()
        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        
        prompt = f"""
        You are an expert UX Researcher and Product Assistant.
        A Product Manager is asking you a question about their user feedback dataset.
        
        Use ONLY the following retrieved feedback comments to answer their question. 
        If the comments don't contain enough information to answer the question, state that clearly.
        Be concise, analytical, and cite specific examples from the feedback.
        
        Retrieved Feedback:
        {evidence}
        
        Product Manager Question: {query}
        """
        
        answer = None
        try:
            if not GROQ_API_KEY:
                raise Exception("GROQ_API_KEY not found in .env")
                
            client = Groq(api_key=GROQ_API_KEY)
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="groq/compound",
                temperature=0.3
            )
            answer = response.choices[0].message.content
        except Exception as e:
            if GEMINI_API_KEY:
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=GEMINI_API_KEY)
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    resp = model.generate_content(prompt)
                    answer = resp.text
                except Exception as gemini_e:
                    return {"error": f"Groq and Gemini both failed. Groq: {str(e)} | Gemini: {str(gemini_e)}"}
            else:
                return {"error": f"Groq failed and no GEMINI_API_KEY found: {str(e)}"}
        
        # Return the AI answer and the top 3 source quotes for transparency
        result = {
            "answer": answer,
            "sources": relevant_comments[:3]
        }
        
        return result
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    res = chat()
    print(json.dumps(res))
