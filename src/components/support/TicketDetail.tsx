import { useState, useEffect } from 'react';
import { SupportTicket } from '../AppContainer';
import { ArrowLeftIcon, UserIcon, MonitorIcon, MessageSquareIcon, SendIcon, CheckCircle2Icon, BriefcaseIcon, ClockIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function TicketDetail({ 
  ticket, 
  onBack,
  agentUser 
}: { 
  ticket: SupportTicket; 
  onBack: () => void;
  agentUser: any;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mark as in progress if it was open
  useEffect(() => {
    if (ticket.status === 'open' && agentUser) {
      updateDoc(doc(db, 'saule_support_tickets', ticket.id), {
        status: 'in_progress',
        pickedUpAt: Date.now(),
        assignedAgentId: agentUser.uid
      });
    }
  }, [ticket.id, ticket.status, agentUser]);

  // Listen to messages
  useEffect(() => {
    const q = query(
      collection(db, `saule_support_tickets/${ticket.id}/messages`),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((d) => msgs.push({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [ticket.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, `saule_support_tickets/${ticket.id}/messages`), {
        text: newMessage.trim(),
        sender: 'agent',
        senderId: agentUser?.uid || 'unknown',
        senderName: agentUser?.displayName || 'Destek Ekibi',
        createdAt: serverTimestamp() // Uses Firebase server timestamp
      });
      
      // Update ticket updatedAt
      await updateDoc(doc(db, 'saule_support_tickets', ticket.id), {
        updatedAt: serverTimestamp()
      });
      
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveTicket = async () => {
    if (confirm("Bu biletin çözüldüğünü onaylıyor musunuz?")) {
      await updateDoc(doc(db, 'saule_support_tickets', ticket.id), {
        status: 'resolved',
        closedAt: Date.now()
      });
      onBack();
    }
  };

  const handleSimulatedAction = async (actionName: string, message: string) => {
    try {
      await addDoc(collection(db, `saule_support_tickets/${ticket.id}/messages`), {
        text: `[SİSTEM: ${message}]`,
        sender: 'system',
        senderId: 'system',
        senderName: 'Sistem Aksiyonu',
        createdAt: serverTimestamp()
      });
      alert(`Simülasyon: ${actionName} işlemi gerçekleştirildi ve loglara yazıldı.`);
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  const contextData = ticket.contextSnapshot;
  const historyData = ticket.preHandoffHistory || [];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 shrink-0 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              {ticket.ticketNumber}
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                ticket.status === 'open' ? 'bg-rose-100 text-rose-600' :
                ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {ticket.status === 'in_progress' ? 'İşlemde' : ticket.status === 'resolved' ? 'Çözüldü' : 'Bekliyor'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">{ticket.source.toUpperCase()} üzerinden geldi</p>
          </div>
        </div>
        
        {ticket.status !== 'resolved' && (
          <button 
            onClick={handleResolveTicket}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-sm rounded-lg transition-colors border border-emerald-200"
          >
            <CheckCircle2Icon size={18} />
            Bileti Kapat (Çözüldü)
          </button>
        )}
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Column: User & Context Info */}
        <aside className="w-full lg:w-80 border-r border-slate-200 bg-white overflow-y-auto shrink-0 flex flex-col divide-y divide-slate-100">
          
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserIcon size={14} /> Müşteri Bilgileri
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">E-posta</p>
                <p className="text-sm font-semibold text-slate-800">{ticket.userEmail || 'Belirtilmedi'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Kullanıcı ID</p>
                <p className="text-xs font-mono text-slate-400 truncate">{ticket.userId}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MonitorIcon size={14} /> Clarity Context
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Kullanıcı canlı desteğe bağlandığında şu ekrana bakıyordu:
            </p>
            {contextData ? (
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Modül: {contextData.module}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">{contextData.title}</h4>
                <pre className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded overflow-x-auto border border-slate-100">
                  {JSON.stringify(contextData.data, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Bağlam verisi bulunamadı.</p>
            )}
          </div>

          {/* Pre-Handoff History Summary */}
          <div className="p-6 flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquareIcon size={14} /> Yapay Zeka Geçmişi
            </h3>
            {historyData.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {historyData.map((msg, i) => (
                  <div key={i} className="relative flex items-start justify-between">
                    <div className="flex flex-col w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <span className={`text-[10px] font-bold uppercase ${msg.role === 'user' ? 'text-indigo-500' : 'text-amber-500'} mb-1`}>
                        {msg.role === 'user' ? 'Müşteri' : 'AI Asistan'}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-3" title={msg.content}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Geçmiş konuşma kaydı yok.</p>
            )}
          </div>
        </aside>

        {/* Center Column: Live Chat */}
        <section className="flex-1 flex flex-col bg-[#F8FAFC]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center">
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
                Canlı Destek Başladı
              </span>
            </div>
            
            {messages.map(msg => {
              const isAgent = msg.sender === 'agent';
              return (
                <div key={msg.id} className={`flex w-full ${isAgent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                    isAgent 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                  }`}>
                    {!isAgent && <p className="text-[10px] font-bold text-slate-400 mb-1">Müşteri</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-2 text-right ${isAgent ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Müşteriye yanıt yazın..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 min-h-[50px]"
                rows={1}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="h-[50px] w-[50px] shrink-0 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <SendIcon size={20} className={isSending ? 'animate-pulse' : ''} />
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Actions */}
        <aside className="w-full lg:w-72 border-l border-slate-200 bg-white shrink-0 p-6 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BriefcaseIcon size={14} /> Asistan İşlemleri
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Müşteri adına işlem yapmak için aşağıdaki aksiyonları kullanabilirsiniz. (Not: Aksiyonlar simülasyondur).
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => handleSimulatedAction('Randevu Oluştur', 'Destek ekibi müşteri için randevu oluşturdu.')}
              className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group">
              <span className="block text-sm font-bold text-slate-700 group-hover:text-indigo-700 mb-1">Randevu Oluştur</span>
              <span className="block text-xs text-slate-500 group-hover:text-indigo-500">Müşterinin takvimine etkinlik ekle.</span>
            </button>
            
            <button 
              onClick={() => handleSimulatedAction('Müşteri Kartı Düzenle', 'Destek ekibi müşteri kartını güncelledi.')}
              className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group">
              <span className="block text-sm font-bold text-slate-700 group-hover:text-indigo-700 mb-1">Müşteri Kartı Düzenle</span>
              <span className="block text-xs text-slate-500 group-hover:text-indigo-500">Eksik bilgileri tamamla.</span>
            </button>

            <button 
              onClick={() => handleSimulatedAction('Şifre Sıfırlama Gönder', 'Destek ekibi şifre sıfırlama bağlantısı gönderdi.')}
              className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group">
              <span className="block text-sm font-bold text-slate-700 group-hover:text-indigo-700 mb-1">Şifre Sıfırlama Gönder</span>
              <span className="block text-xs text-slate-500 group-hover:text-indigo-500">Müşterinin e-postasına bağlantı at.</span>
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
