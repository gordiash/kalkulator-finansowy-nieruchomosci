'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title?: string; url?: string }>;
  timestamp: Date;
}

export default function RagChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [allow, setAllow] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cookieConsent');
      if (!raw) { setAllow(true); return; }
      const parsed = JSON.parse(raw);
      // Jeżeli chcesz ukrywać bez zgody – ustaw na analytics
      setAllow(parsed.analytics !== false);
    } catch { setAllow(true); }
  }, []);

  // Auto-scroll do najnowszej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const ask = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // GA: event wysłania pytania
      try {
        if (typeof window !== 'undefined' && (window as any).gtag && allow) {
          (window as any).gtag('event', 'rag_chat_submit', {
            event_category: 'RAG',
            event_label: 'chat_submit',
            value: input.trim().length,
          });
        }
      } catch {}

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Błąd');
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: json.answer || '',
        sources: Array.isArray(json.sources) ? json.sources : [],
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // GA: event otrzymania odpowiedzi
      try {
        if (typeof window !== 'undefined' && (window as any).gtag && allow) {
          (window as any).gtag('event', 'rag_chat_response', {
            event_category: 'RAG',
            event_label: 'chat_response',
            value: (json.sources?.length || 0),
          });
        }
      } catch {}
    } catch (e) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: e instanceof Error ? e.message : 'Nieznany błąd',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // GA: event błędu
      try {
        if (typeof window !== 'undefined' && (window as any).gtag && allow) {
          (window as any).gtag('event', 'rag_chat_error', {
            event_category: 'RAG',
            event_label: 'chat_error',
          });
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  if (!allow) return null;
  return (
    <div>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          // GA: otwarcie/zamknięcie widżetu
          try {
            if (typeof window !== 'undefined' && (window as any).gtag && allow) {
              (window as any).gtag('event', next ? 'rag_chat_open' : 'rag_chat_close', {
                event_category: 'RAG',
                event_label: next ? 'open' : 'close',
              });
            }
          } catch {}
        }}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 transition"
        aria-label={open ? 'Zamknij czat' : 'Otwórz czat'}
      >
        <MessageCircle className="h-6 w-6 mx-auto" aria-hidden="true" />
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] max-h-[70vh] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-gray-900">Viggo</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              aria-label="Zamknij"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Historia wiadomości */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <div className="font-medium mb-2">👋 Cześć! Jestem Viggo, asystentem nieruchomości.</div>
                <div className="space-y-1 text-xs">
                  <div>• Pomogę w wycenie nieruchomości</div>
                  <div>• Obliczę koszty zakupu i wynajmu</div>
                  <div>• Odpowiem na pytania o prawie nieruchomości</div>
                  <div>• Wyjaśnię procesy kredytowe</div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="text-xs font-medium mb-1">Źródła:</div>
                      <ul className="text-xs space-y-1">
                        {message.sources.slice(0, 3).map((s, i) => (
                          <li key={i}>
                            <a 
                              className="text-blue-600 hover:underline" 
                              href={s.url || '#'} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              {s.title || s.url || 'Link'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Viggo pisze...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Pole input na dole */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), ask())}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Zadaj pytanie..."
                disabled={loading}
              />
              <button
                onClick={ask}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">Zasilane przez kontekst serwisu</div>
          </div>
        </div>
      )}
    </div>
  );
}


