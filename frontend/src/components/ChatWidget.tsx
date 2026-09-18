"use client";

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatWidgetProps {
  filesUploaded: boolean;
}

export default function ChatWidget({ filesUploaded }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I am your AI Research Assistant. You can ask me questions about your uploaded feedback dataset, and I will search through thousands of comments to find the exact answer.'
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!filesUploaded) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }]);

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans">
      {!isOpen && (
        <div className="relative flex items-center justify-end">
          <div className="absolute right-[80px] bg-indigo-900/95 text-white px-5 py-3 rounded-2xl shadow-xl border border-indigo-500/50 backdrop-blur-md animate-bounce w-max pointer-events-none">
            <div className="font-bold text-sm mb-1 flex items-center gap-2">
              ✨ Ask AI About Your Data
            </div>
            <div className="text-xs text-indigo-200">
              Powered by RAG & Gemini API.<br />
              Ask deep-dive questions instantly!
            </div>
            <div className="absolute top-1/2 -right-2 -mt-2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-indigo-900/95 border-b-[8px] border-b-transparent"></div>
          </div>
          
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white p-5 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all transform hover:scale-110 flex items-center justify-center group relative z-10"
          >
            <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="bg-[#1a1b2e]/90 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[420px] h-[650px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-indigo-500/20 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">AI Research Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-white/90 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm' : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed font-light">{msg.content}</p>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 ml-2 max-w-[85%]">
                    <p className="text-xs text-indigo-300/80 font-medium mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Sources Cited
                    </p>
                    <div className="space-y-2">
                      {msg.sources.map((src, i) => (
                        <div key={i} className="text-xs text-white/60 bg-black/30 p-3 rounded-xl border border-white/5 line-clamp-3 italic font-light">"{src}"</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 flex gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-colors flex items-center justify-center shadow-lg"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
