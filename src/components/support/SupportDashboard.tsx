import { SupportTicket } from '../AppContainer';
import { ClockIcon, TicketIcon, CheckCircleIcon, ArrowRightIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function SupportDashboard({ 
  tickets, 
  loading, 
  onOpenTicket 
}: { 
  tickets: SupportTicket[]; 
  loading: boolean;
  onOpenTicket: (ticket: SupportTicket) => void;
}) {
  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kuyruk Özeti</h1>
        <p className="text-slate-500 mt-2">Canlı destek sistemindeki bekleyen ve devam eden işlemler.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <TicketIcon size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Bekleyen</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{openTickets.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <ClockIcon size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">İşlemde</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{inProgressTickets.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Çözüldü (Bugün)</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{resolvedTickets.length}</p>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Aktif Talepler</h2>
        </div>
        
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <CheckCircleIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Kuyruk Boş</h3>
            <p className="text-slate-500 mt-2">Şu anda bekleyen hiçbir destek talebi yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.filter(t => t.status !== 'resolved').map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => onOpenTicket(ticket)}
                className="p-4 md:p-6 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center gap-4 md:gap-8 group"
              >
                {/* Status Indicator */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className={`w-3 h-3 rounded-full ${ticket.status === 'open' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-mono text-sm font-bold text-slate-400">{ticket.ticketNumber}</span>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900">{ticket.userEmail}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {ticket.source.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatDistanceToNow(ticket.createdAt, { addSuffix: true, locale: tr })} açıldı
                    </span>
                  </div>
                </div>

                {/* Action Arrow */}
                <div className="shrink-0 text-slate-300 group-hover:text-indigo-600 transition-colors hidden md:block">
                  <ArrowRightIcon size={24} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
