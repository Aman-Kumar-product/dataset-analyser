"use client";

import React, { useState } from 'react';
import initialData from '@/data/synthesis_results.json';
import { ThemeCard } from './ThemeCard';
import ChatWidget from './ChatWidget';
import { BarChart3, Database, Lightbulb, Users, UploadCloud, Loader2 } from 'lucide-react';

export function Dashboard() {
  const [data, setData] = useState<any>({});
  const [isClustering, setIsClustering] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [clusterReady, setClusterReady] = useState(false);
  const [intent, setIntent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const clusters = Object.entries(data).map(([id, info]: [string, any]) => ({
    id,
    ...info
  }));
  
  const totalConversations = clusters.reduce((acc, curr) => acc + curr.size, 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRunAnalysis = async () => {
    if (files.length === 0) return;

    setIsClustering(true);
    setClusterReady(false);
    setError("");
    setStatusMsg("Step 1: Hybrid Filtering & Clustering... (Usually 10-30s)");
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    formData.append('intent', intent);
    formData.append('keywords', keywords);

    try {
      const res = await fetch('/api/cluster', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze files");
      }

      setClusterReady(true);
      setIsClustering(false);
      
      // Automatically proceed to synthesis
      handleSynthesize();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsClustering(false);
    }
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setError("");
    setStatusMsg("Step 2: Synthesizing Insights with Groq LLM... (Please wait)");
    
    try {
      const res = await fetch('/api/synthesize', { method: 'POST' });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to synthesize");
      }

      const responseData = await res.json();
      setData(responseData.data);
      setStatusMsg("Analysis Complete!");
      setTimeout(() => {
        setIsSynthesizing(false);
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Upload Zone */}
      <div className="glass rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]">
        {isClustering ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h3 className="text-xl font-bold text-white">{statusMsg}</h3>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        ) : clusterReady ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <h3 className="text-2xl font-bold text-white text-emerald-400">✅ Filtering & Clustering Successful!</h3>
            <p className="text-muted-foreground mb-2">The raw data has been semantically filtered for search intent, and grouped into themes.</p>
            <div className="flex gap-4 mb-4">
              <a href="/api/download_filtered" className="bg-slate-800 text-white border border-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                Download Filtered Dataset
              </a>
              <a href="/api/download" className="bg-slate-800 text-white border border-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                Download Clustered Dataset
              </a>
            </div>
            
            {isSynthesizing ? (
              <div className="flex flex-col items-center gap-3 mt-4 p-4 border border-primary/20 bg-primary/5 rounded-2xl w-full max-w-lg">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <h4 className="font-semibold text-white">{statusMsg}</h4>
              </div>
            ) : (
              <div className="text-emerald-400 font-bold mt-4">AI Summaries Generated Below! 👇</div>
            )}
            
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 w-full max-w-2xl mx-auto">
            <div className="p-4 bg-primary/20 rounded-full border border-primary/30">
               <UploadCloud className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">Upload Datasets & Configure</h3>
            
            <div className="w-full text-left mt-4 mb-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Keywords (Exact Regex Match)
              </label>
              <input 
                type="text" 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. search, find, retrieve, gemini"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="w-full text-left mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Intents (Semantic AI Match)
              </label>
              <input 
                type="text" 
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g. users complaining about AI, searching for albums"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-slate-500 mt-2">Leave blank to use the built-in defaults for Google Photos search/retrieval.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4 w-full">
              <label className="cursor-pointer bg-slate-800 text-white border border-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                Select CSV Files {files.length > 0 && `(${files.length} selected)`}
                <input type="file" multiple accept=".csv" className="hidden" onChange={handleFileSelect} />
              </label>

              {files.length > 0 && (
                <button 
                  onClick={handleRunAnalysis}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity w-full max-w-xs text-center text-lg shadow-[0_0_20px_rgba(100,100,255,0.3)] mt-2"
                >
                  Run Intelligent Analysis
                </button>
              )}
            </div>

            {error && <p className="text-rose-400 mt-2 text-sm">{error}</p>}
          </div>
        )}
      </div>

      {clusters.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Database className="w-6 h-6 text-blue-400" />} title="Total Feedback" value={totalConversations.toLocaleString()} />
            <StatCard icon={<Lightbulb className="w-6 h-6 text-yellow-400" />} title="Themes Discovered" value={clusters.length} />
            <StatCard 
              icon={<Users className="w-6 h-6 text-purple-400" />} 
              title="Dataset" 
              value={files.length > 0 ? files.map(f => f.name).join(', ') : "master_dataset.csv"} 
              isTruncated={true}
            />
            <StatCard icon={<BarChart3 className="w-6 h-6 text-emerald-400" />} title="Processing Engine" value="Tfidf + HDBSCAN" />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight border-b border-white/10 pb-4">
              Synthesized Themes
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {clusters.map((cluster) => (
                <ThemeCard key={cluster.id} cluster={cluster} />
              ))}
            </div>
          </div>
        </>
      )}
      
      <ChatWidget filesUploaded={clusterReady || clusters.length > 0} />
    </div>
  );
}

function StatCard({ icon, title, value, isTruncated }: { icon: React.ReactNode, title: string, value: string | number, isTruncated?: boolean }) {
  return (
    <div className="glass glass-hover p-6 rounded-2xl flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className={`text-2xl font-bold tracking-tight text-white ${isTruncated ? 'truncate' : ''}`} title={isTruncated ? String(value) : undefined}>{value}</p>
      </div>
    </div>
  );
}
