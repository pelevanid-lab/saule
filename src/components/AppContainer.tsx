'use client';

import { useState, useEffect } from 'react';
import TerminalUI from './TerminalUI';
import MemoryHistory from './MemoryHistory';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: any;
}

export default function AppContainer({ dict, locale }: { dict: any; locale: string }) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('all');
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);

  // Fetch workspaces locally
  const fetchWorkspaces = () => {
    try {
      const stored = localStorage.getItem('saule_local_workspaces');
      if (stored) {
        setWorkspaces(JSON.parse(stored));
      } else {
        const defaults = [{ id: 'default', name: 'Default Space', createdAt: Date.now() }];
        localStorage.setItem('saule_local_workspaces', JSON.stringify(defaults));
        setWorkspaces(defaults);
      }
    } catch (error) {
      console.error('Error fetching local workspaces:', error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim() || isCreatingWs) return;
    setIsCreatingWs(true);

    try {
      const newId = newWsName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newWs: Workspace = {
        id: newId,
        name: newWsName.trim(),
        createdAt: Date.now(),
      };
      
      const updated = [...workspaces, newWs];
      localStorage.setItem('saule_local_workspaces', JSON.stringify(updated));
      setWorkspaces(updated);
      setNewWsName('');
      setShowCreateWs(false);
      setActiveWorkspaceId(newId);
    } catch (error) {
      console.error('Error creating local workspace:', error);
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
        
        <div className="flex items-center space-x-3 bg-white border border-sand-300/60 py-1.5 px-3 rounded-full shadow-sm">
          <div className="w-5 h-5 rounded-full bg-sage-dark text-white flex items-center justify-center font-bold text-[10px]">
            L
          </div>
          <span className="text-xs font-sans font-semibold text-charcoal-muted">Local Developer</span>
        </div>
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
