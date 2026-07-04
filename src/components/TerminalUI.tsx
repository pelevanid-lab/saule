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
  const [activePackageId, setActivePackageId] = useState<string>('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || isSending) return;

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
          uid: user.uid, 
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
          {user && (
            <div className="text-[10px] text-charcoal-muted mt-1 flex items-center gap-1">
              Extension Bağlantı Kodu (Token): <span className="font-mono bg-sand-200 px-1 py-0.5 rounded select-all">{user.uid}</span>
            </div>
          )}
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
              className="bg-white border border-sand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sage cursor-pointer"
            >
              <option value="gemini">Gemini 2.5 Flash</option>
              <option value="claude">Claude 3.5 Sonnet</option>
              <option value="openai">OpenAI GPT-4o (Coming)</option>
            </select>
            
            <button 
              onClick={() => setShowExtensionModal(true)}
              className="ml-4 bg-sand-200 hover:bg-sand-300 text-charcoal text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Eklenti İndir
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
              Eklentiyi İndir ve Kur (Beta)
            </h3>
            
            <div className="bg-sand-50 border border-sand-200 rounded-lg p-4 mb-5 text-sm text-charcoal font-medium leading-relaxed overflow-y-auto max-h-[300px]">
              <p className="mb-3">Bu sürüm henüz Web Mağazasına yüklenmemiştir. Eklentiyi kurmak için şu 3 basit adımı izleyin:</p>
              <ol className="list-decimal pl-5 space-y-2 text-charcoal-muted mb-4">
                <li><strong className="text-charcoal">Aşağıdaki butondan ZIP dosyasını indirin</strong> ve masaüstünde bir klasöre çıkartın.</li>
                <li>Chrome adres çubuğuna <code className="bg-sand-200 px-1 py-0.5 rounded text-sage-dark select-all">chrome://extensions/</code> yazıp Enter'a basın.</li>
                <li>Sağ üstteki <strong>"Geliştirici modunu" (Developer mode)</strong> açın, sol üstteki <strong>"Paketlenmemiş öğe yükle" (Load unpacked)</strong> butonuna tıklayıp ZIP'ten çıkardığınız klasörü seçin.</li>
              </ol>
              <div className="bg-sand-200/50 p-3 rounded border border-sand-300 text-xs text-charcoal-muted">
                <strong className="text-sage-dark block mb-1">🔄 Güncelleme Yapacaklar İçin Not:</strong>
                Eğer eklentiyi daha önce kurduysanız; yeni indirdiğiniz klasörü eskisinin üzerine yazdırın ve eklentiler (<code className="bg-sand-200 px-1 rounded">chrome://extensions/</code>) sayfasındaki Saule eklentisi kartından <strong>Yenile (Refresh)</strong> butonuna basın.
              </div>
            </div>

            <div className="flex justify-between items-center">
              <a 
                href="/saule-extension.zip" 
                download="saule-extension.zip"
                className="bg-sage-dark hover:bg-sage text-white font-bold text-sm px-5 py-2.5 rounded shadow-md transition-colors flex items-center gap-2"
                onClick={() => setTimeout(() => setShowExtensionModal(false), 500)}
              >
                📥 ZIP Olarak İndir (v1.0.0)
              </a>
              <button 
                onClick={() => setShowExtensionModal(false)}
                className="bg-sand-100 hover:bg-sand-200 text-charcoal-muted hover:text-charcoal font-bold text-sm px-4 py-2 rounded transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
