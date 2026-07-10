'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { TicketIcon, LayoutDashboardIcon, LogOutIcon, UsersIcon, CheckCircleIcon, ClockIcon, SearchIcon, MessageSquareIcon } from 'lucide-react';
import SupportDashboard from './support/SupportDashboard';
import TicketDetail from './support/TicketDetail';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  status: 'open' | 'in_progress' | 'resolved';
  userId: string;
  userEmail: string;
  userPhone?: string;
  createdAt: number;
  pickedUpAt?: number;
  closedAt?: number;
  assignedAgentId?: string;
  contextSnapshot?: any;
  preHandoffHistory?: any[];
  source: string; // e.g., 'beiwe'
}

export default function AppContainer({ dict, locale }: { dict: any; locale: string }) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active_ticket'>('dashboard');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  
  // Real-time tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to tickets
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'saule_support_tickets'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData: SupportTicket[] = [];
      snapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() } as SupportTicket);
      });
      setTickets(ticketsData);
      setLoading(false);
      
      // Update active ticket if it changes
      if (activeTicket) {
        const updated = ticketsData.find(t => t.id === activeTicket.id);
        if (updated) {
          setActiveTicket(updated);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenTicket = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    setActiveTab('active_ticket');
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setActiveTicket(null);
  };

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const isAdmin = user?.email && adminEmails.includes(user.email);

  if (user && !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Erişim Reddedildi</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Bu destek paneline sadece yetkili yöneticiler erişebilir. Lütfen yetkili bir hesapla giriş yapın.</p>
          <button 
            onClick={() => signOut()} 
            className="w-full px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-20">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold tracking-tighter shadow-lg shadow-indigo-500/20">S</div>
          <span className="hidden md:block ml-3 font-semibold text-white tracking-wide">Saule Concierge</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          <NavItem 
            icon={LayoutDashboardIcon} 
            label="Kuyruk (Queue)" 
            active={activeTab === 'dashboard'} 
            onClick={handleBackToDashboard} 
          />
          <NavItem 
            icon={TicketIcon} 
            label="Aktif Ticket" 
            active={activeTab === 'active_ticket'} 
            onClick={() => activeTicket && setActiveTab('active_ticket')}
            disabled={!activeTicket}
          />
          <NavItem icon={UsersIcon} label="Müşteriler" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          {user && (
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                {user.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block overflow-hidden">
                <p className="text-sm font-medium text-slate-200 truncate">{user.displayName || 'Agent'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => signOut()}
            className="mt-4 w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOutIcon size={18} />
            <span className="hidden md:inline text-sm font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50">
        {activeTab === 'dashboard' ? (
          <SupportDashboard tickets={tickets} loading={loading} onOpenTicket={handleOpenTicket} />
        ) : (
          activeTicket && <TicketDetail ticket={activeTicket} onBack={handleBackToDashboard} agentUser={user} />
        )}
      </main>
      
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, disabled }: { icon: any, label: string, active?: boolean, onClick?: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'} ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-slate-300' : ''}`}
    >
      <Icon size={20} className={active ? 'text-white' : ''} />
      <span className="hidden md:inline text-sm font-medium">{label}</span>
    </button>
  );
}
