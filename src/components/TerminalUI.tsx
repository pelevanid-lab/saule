'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

interface Message {
  id: string;
  content: string;
  source: 'user' | 'saule' | 'query';
  createdAt: any;
}

export type ProviderType = 'gemini' | 'claude' | 'openai';

export default function TerminalUI({ dict, locale, workspaceId }: { dict: any; locale: string; workspaceId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('gemini');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !db) return;

    const q = query(
      collection(db, 'memories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        loadedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || isSending) return;

    const textToSend = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, text: textToSend, locale, mode: 'auto', workspaceId, provider: selectedProvider }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', errorData.message || 'Unknown server error', errorData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      
      {/* Top Bar with Provider Selector and Proactivity Control */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
            SML Headquarters
          </h2>
          {user && (
            <div className="text-[10px] text-charcoal-muted mt-1 flex items-center gap-1">
              Extension Bağlantı Kodu (Token): <span className="font-mono bg-sand-200 px-1 py-0.5 rounded select-all">{user.uid}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-6 text-sm text-charcoal">
          {/* Proactivity Level */}
          <div className="flex items-center space-x-2">
            <label htmlFor="proactivity-level" className="font-medium text-xs text-charcoal-muted">Proactivity:</label>
            <select 
              id="proactivity-level"
              className="bg-transparent border-none font-medium px-1 focus:outline-none focus:ring-0 cursor-pointer"
              defaultValue="calm"
            >
              <option value="passive">Passive (Silent)</option>
              <option value="calm">Calm (Personal)</option>
              <option value="active">Active (CRM Mode)</option>
            </select>
          </div>

          {/* AI Provider */}
          <div className="flex items-center space-x-2">
            <label htmlFor="ai-provider" className="font-medium text-xs text-charcoal-muted">AI:</label>
            <select 
              id="ai-provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as ProviderType)}
              className="bg-white border border-sand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sage cursor-pointer"
            >
              <option value="gemini">Gemini 2.5 Flash</option>
              <option value="claude">Claude 3.5 Sonnet</option>
              <option value="openai">OpenAI GPT-4o (Coming)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto mb-6 bg-white/50 backdrop-blur-sm rounded-lg border border-sand-300/30 p-6 flex flex-col space-y-4 shadow-inner">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-charcoal-muted text-sm font-sans italic opacity-70">
            {dict.empty_state}
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.source === 'user' || msg.source === 'query';
            return (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-lg p-4 font-sans text-sm shadow-sm ${
                  isUser
                    ? 'bg-sage-dark text-white self-end rounded-br-none'
                    : 'bg-white border border-sand-300 text-charcoal self-start rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            );
          })
        )}
        {isSending && (
          <div className="bg-white border border-sand-300 text-charcoal-muted self-start rounded-lg rounded-bl-none p-4 font-sans text-sm shadow-sm flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className="w-full bg-white border border-sand-300 rounded-lg pl-4 pr-24 py-4 text-sm font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none h-24 shadow-sm disabled:opacity-50"
          placeholder={dict.input_placeholder}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !input.trim()}
          className="absolute right-3 bottom-3 bg-sage-dark text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {dict.send}
        </button>
      </div>
    </div>
  );
}
