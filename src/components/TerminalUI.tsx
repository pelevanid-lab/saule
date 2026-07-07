'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

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
  const [activePackageId, setActivePackageId] = useState<string>('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [isLocalHost, setIsLocalHost] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLocalHost(
      typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    );
  }, []);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const textToSend = input.trim();
    
    // Add user message to local state immediately
    const newUserMsg: Message = { id: Date.now().toString(), content: textToSend, source: 'user', createdAt: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    
    setInput('');
    setIsSending(true);

    // Prepare history to send to backend (excluding the message we just added, as backend expects sessionHistory + current text)
    const sessionHistory = messages.map(m => ({ role: m.source === 'user' ? 'user' : 'model', content: m.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid: 'local-dev', 
          text: textToSend, 
          sessionHistory,
          locale, 
          mode: 'auto', 
          workspaceId, 
          provider: selectedProvider,
          forcePackageId: activePackageId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', errorData.message || 'Unknown server error', errorData);
      } else {
        const data = await response.json();
        if (data.packageId && !activePackageId) {
          setActivePackageId(data.packageId);
        }
        
        if (data.reply) {
          setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: data.reply, source: 'saule', createdAt: new Date() }]);
        }

        if (data.contextToRemember && user) {
          // Write directly to Firestore, bypassing local SML!
          try {
            const { db } = await import('@/lib/firebase');
            if (db) {
              const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
              await addDoc(collection(db, 'memories'), {
                content: data.contextToRemember,
                category: 'Knowledge',
                spaceId: workspaceId || 'default',
                spaceType: 'personal',
                source: 'saule-terminal',
                userId: user.uid,
                createdAt: serverTimestamp()
              });
              console.log("Memory saved to Firebase successfully!");
            }
          } catch (err) {
            console.error("Failed to save memory to Firebase:", err);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    setActivePackageId('');
    setMessages([]);
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
          <div className="text-[10px] text-charcoal-muted mt-1 flex items-center gap-2">
            <span className="font-mono bg-sand-200 px-1 py-0.5 rounded text-sage-dark">Terminal 2.0 (Firebase Sync Enabled)</span>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm text-charcoal">
          {/* CRM Integration Button (Only visible if a specific workspace is selected) */}
          {workspaceId && workspaceId !== 'all' && (
            <button
              onClick={() => setShowEmbedModal(true)}
              className="text-[10px] font-bold bg-charcoal text-white px-2 py-1.5 rounded-md hover:bg-charcoal-muted transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              Embed (CRM)
            </button>
          )}

          {/* AI Provider */}
          <div className="flex items-center space-x-2">
            <label htmlFor="ai-provider" className="font-medium text-xs text-charcoal-muted">AI:</label>
            <select 
              id="ai-provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as ProviderType)}
              className="bg-white border border-sand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sage cursor-pointer mr-2"
            >
              <option value="gemini">Gemini 2.5 Flash</option>
              <option value="claude">Claude 3.5 Sonnet</option>
              <option value="openai">OpenAI GPT-4o (Coming)</option>
            </select>
            
            <button 
              onClick={() => setShowExtensionModal(true)}
              className="bg-sand-200 hover:bg-sand-300 text-charcoal text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1 ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {locale === 'tr' ? "Beiwe'yi İndir" : "Download Beiwe"}
            </button>

            <button 
              onClick={handleNewChat}
              className="ml-2 bg-sage-dark hover:bg-sage text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Yeni Sohbet
            </button>
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

      {/* Embed CRM Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-sand-200">
            <h3 className="text-lg font-bold text-charcoal mb-2">Kurumsal CRM Entegrasyonu</h3>
            <p className="text-xs text-charcoal-muted mb-4 font-medium leading-relaxed">
              Bu Workspace'e (Çalışma Alanı) bağlı SML Karar Motorunu kendi web sitenize entegre etmek için aşağıdaki script kodunu sitenizin <code className="bg-sand-100 text-charcoal px-1 py-0.5 rounded">&lt;head&gt;</code> etiketleri arasına yerleştirin.
            </p>
            <div className="bg-sand-50 border border-sand-300 rounded p-3 mb-4 font-mono text-[10px] text-sage-dark whitespace-pre-wrap break-all select-all">
              {`<script src="https://saule.ai/sdk.js" data-workspace="${workspaceId}"></script>`}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowEmbedModal(false)}
                className="bg-sand-200 hover:bg-sand-300 text-charcoal font-bold text-xs px-4 py-2 rounded transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full border border-sand-200">
            <h3 className="text-lg font-bold text-charcoal mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {locale === 'tr' ? "Beiwe Tarayıcısını İndir (Beta)" : "Download Beiwe Browser (Beta)"}
            </h3>
            
            <div className="bg-sand-50 border border-sand-200 rounded-lg p-4 mb-5 text-sm text-charcoal font-medium leading-relaxed overflow-y-auto max-h-[300px]">
              {locale === 'tr' ? (
                <>
                  <p className="mb-3 font-semibold text-charcoal">
                    Saule Anlamsal Bellek Katmanı (SML) ilk sürümünde yalnızca Beiwe bilişsel web tarayıcısı içinde çalışacak şekilde geliştirilmiştir.
                  </p>
                  <p className="mb-3">Beiwe tarayıcısını kurmak için aşağıdaki 3 basit adımı izleyin:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-charcoal-muted mb-4">
                    <li><strong className="text-charcoal">Aşağıdaki butondan Beiwe kurulum paketini (ZIP) indirin</strong> ve bilgisayarınızda bir klasöre çıkartın.</li>
                    <li>Kurulum kılavuzundaki adımları izleyerek Beiwe tarayıcısını kurun.</li>
                    <li>Beiwe'yi açın ve sol taraftaki Saule Merkeze Bağlan panelinden <code className="bg-sand-200 px-1 py-0.5 rounded text-sage-dark font-mono select-all">{user?.uid}</code> token bağlantı kodunuzu girerek bilişsel hafızanızı anında aktifleştirin.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="mb-3 font-semibold text-charcoal">
                    In its initial release, Saule Semantic Memory Layer (SML) is built to run exclusively inside the Beiwe cognitive web browser.
                  </p>
                  <p className="mb-3">To set up the Beiwe browser, follow these 3 simple steps:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-charcoal-muted mb-4">
                    <li><strong className="text-charcoal">Download the Beiwe setup package (ZIP)</strong> from the button below and extract it to a folder.</li>
                    <li>Follow the setup guide instructions to install the Beiwe browser.</li>
                    <li>Launch Beiwe, and enter your SML Connection Token <code className="bg-sand-200 px-1 py-0.5 rounded text-sage-dark font-mono select-all">{user?.uid}</code> to activate your cognitive memory immediately.</li>
                  </ol>
                </>
              )}
            </div>

            <div className="flex justify-between items-center">
              <a 
                href="/beiwe-setup.zip" 
                download="beiwe-setup.zip"
                className="bg-sage-dark hover:bg-sage text-white font-bold text-sm px-5 py-2.5 rounded shadow-md transition-colors flex items-center gap-2"
                onClick={() => setTimeout(() => setShowExtensionModal(false), 500)}
              >
                📥 {locale === 'tr' ? "Beiwe Kurulumunu İndir" : "Download Beiwe Setup"}
              </a>
              <button 
                onClick={() => setShowExtensionModal(false)}
                className="bg-sand-100 hover:bg-sand-200 text-charcoal-muted hover:text-charcoal font-bold text-sm px-4 py-2 rounded transition-colors"
              >
                {locale === 'tr' ? "Kapat" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
