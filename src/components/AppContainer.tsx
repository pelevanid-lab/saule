'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import TerminalUI from './TerminalUI';
import MemoryHistory from './MemoryHistory';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: any;
}

export default function AppContainer({ dict, locale }: { dict: any; locale: string }) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('all');
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/workspaces?uid=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim() || !user || isCreatingWs) return;
    setIsCreatingWs(true);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          name: newWsName.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setNewWsName('');
        setShowCreateWs(false);
        await fetchWorkspaces();
        setActiveWorkspaceId(result.id); // Switch to the newly created workspace
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsCreatingWs(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-[80vh] flex flex-col">
      {/* Header with user info & logout */}
      <header className="mb-8 border-b border-sand-300/40 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">{dict.app.title}</h1>
          <p className="font-sans text-sm text-charcoal-muted mt-1">{dict.app.subtitle}</p>
        </div>
        
        {user && (
          <div className="flex items-center space-x-3 bg-white border border-sand-300/60 p-2 rounded-full shadow-sm">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-8 h-8 rounded-full border border-sand-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sage-dark text-white flex items-center justify-center font-bold text-xs">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left text-xs font-sans">
              <p className="font-semibold text-charcoal truncate max-w-[120px]">
                {user.displayName || user.email?.split('@')[0]}
              </p>
            </div>
            <button
              onClick={signOut}
              className="text-xs font-sans text-clay hover:text-red-600 font-bold px-3 py-1 rounded-full hover:bg-sand-50 transition-colors"
            >
              {dict.auth.sign_out || 'Çıkış Yap'}
            </button>
          </div>
        )}
      </header>

      {/* Workspace Selector & Manager */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-sand-50/50 rounded-xl border border-sand-300/30">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-sans font-bold text-charcoal-muted uppercase tracking-wider">
            Workspace:
          </label>
          <select
            value={activeWorkspaceId}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="bg-white border border-sand-300 rounded-lg px-3 py-1.5 text-xs font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent shadow-sm"
          >
            <option value="all">📁 All (Hepsi)</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                📁 {ws.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Workspace trigger */}
        <div className="flex items-center space-x-2">
          {showCreateWs ? (
            <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-sand-300 shadow-sm">
              <input
                type="text"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                placeholder="Workspace Name..."
                className="px-2.5 py-1 text-xs font-sans focus:outline-none w-36 text-charcoal"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              />
              <button
                onClick={handleCreateWorkspace}
                disabled={isCreatingWs || !newWsName.trim()}
                className="bg-sage-dark text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-sage disabled:opacity-50"
              >
                +
              </button>
              <button
                onClick={() => setShowCreateWs(false)}
                className="text-xs text-charcoal-muted px-2 py-1 hover:text-charcoal"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateWs(true)}
              className="text-xs font-sans font-semibold text-sage-dark hover:text-sage transition-colors"
            >
              + Create Workspace
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex space-x-1 border-b border-sand-300/40 mb-6">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`pb-3 px-4 text-sm font-sans font-semibold border-b-2 transition-all ${
            activeTab === 'terminal'
              ? 'border-sage-dark text-sage-dark'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          {dict.app.title || 'SML Terminal'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-sans font-semibold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-sage-dark text-sage-dark'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          {dict.history.title || 'Hafıza Arşivi'}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'terminal' ? (
          <TerminalUI dict={dict.app} locale={locale} workspaceId={activeWorkspaceId} />
        ) : (
          <MemoryHistory dict={dict.history} locale={locale} workspaceId={activeWorkspaceId} />
        )}
      </div>
    </div>
  );
}
