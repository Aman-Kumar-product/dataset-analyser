"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, MessageSquare, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ThemeCard({ cluster }: { cluster: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const analysis = cluster.analysis;

  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/10 transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(100,100,255,0.1)] group">
      <div className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary/20 text-primary-foreground border border-primary/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Cluster {cluster.id}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {cluster.size} Conversations
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              {analysis.theme_name}
            </h3>
          </div>
          
          <div className="flex-shrink-0">
             <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
               <Zap className="text-white w-8 h-8" />
             </div>
          </div>
        </div>

        <div className="glass bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl mb-8 relative overflow-hidden">
          <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2 relative z-10">
            <Target className="w-5 h-5" /> Cluster Summary
          </h4>
          <p className="text-lg text-blue-50/90 leading-relaxed relative z-10">
            {analysis.summary}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-between p-4 rounded-xl glass glass-hover text-left"
          >
            <span className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" /> 
              View Raw Evidence ({cluster.evidence_samples.length} Samples)
            </span>
            <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isExpanded && "rotate-180")} />
          </button>
          
          <a 
            href={`/api/download_cluster?id=${cluster.id}`}
            className="flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-xl glass glass-hover font-semibold text-white transition-colors"
          >
            <Target className="w-5 h-5 text-emerald-400" />
            Download Cluster
          </a>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-6 grid gap-3">
                {cluster.evidence_samples.map((sample: string, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-black/40 border border-white/5 text-sm text-slate-300 leading-relaxed italic border-l-2 border-l-indigo-500">
                    "{sample}"
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
