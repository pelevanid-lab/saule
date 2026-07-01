'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

interface Message {
  id: string;
  content: string;
  source: 'user' | 'saule';
  createdAt: any;
}

export default function TerminalUI({ dict, locale }: { dict: any; locale: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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
        body: JSON.stringify({ uid: user.uid, text: textToSend, locale }),
      });

      if (!response.ok) {
        console.error('Failed to send message');
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
      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto mb-6 bg-white/50 backdrop-blur-sm rounded-lg border border-sand-300/30 p-6 flex flex-col space-y-4 shadow-inner">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-charcoal-muted text-sm font-sans italic opacity-70">
            {dict.empty_state}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-lg p-4 font-sans text-sm shadow-sm ${
                msg.source === 'user'
                  ? 'bg-sage-dark text-white self-end rounded-br-none'
                  : 'bg-white border border-sand-300 text-charcoal self-start rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          ))
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
