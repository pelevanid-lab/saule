'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

interface RawMemory {
  id: string;
  content: string;
  source: string;
  createdAt: any;
  expiresAt: any;
}

export default function MemoryHistory({ dict, locale, workspaceId }: { dict: any; locale: string; workspaceId: string }) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<RawMemory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editExpiration, setEditExpiration] = useState<string>('forever');
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !db) return;

    // Load only user-generated memories (source: 'user')
    // We load all and filter by workspace on client-side to avoid composite indexing issues
    const q = query(
      collection(db, 'memories'),
      where('userId', '==', user.uid),
      where('source', '==', 'user'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: RawMemory[] = [];
      snapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() } as RawMemory);
      });
      setMemories(loaded);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEditStart = (memory: RawMemory) => {
    setEditingId(memory.id);
    setEditContent(memory.content);
    
    // Determine expiration select value
    if (!memory.expiresAt) {
      setEditExpiration('forever');
    } else {
      const created = memory.createdAt?.toDate ? memory.createdAt.toDate().getTime() : new Date(memory.createdAt).getTime();
      const expires = memory.expiresAt?.toDate ? memory.expiresAt.toDate().getTime() : new Date(memory.expiresAt).getTime();
      const diffDays = Math.round((expires - created) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) setEditExpiration('1day');
      else if (diffDays <= 7) setEditExpiration('7days');
      else if (diffDays <= 30) setEditExpiration('30days');
      else setEditExpiration('1year');
    }
  };

  const handleSave = async (id: string, originalCreatedAt: any) => {
    if (!editContent.trim() || !user || isSaving) return;
    setIsSaving(true);

    // Calculate expiresAt date
    const createdDate = originalCreatedAt?.toDate ? originalCreatedAt.toDate() : new Date(originalCreatedAt);
    let expiresAtDate: Date | null = null;
    
    if (editExpiration === '1day') {
      expiresAtDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
    } else if (editExpiration === '7days') {
      expiresAtDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (editExpiration === '30days') {
      expiresAtDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (editExpiration === '1year') {
      expiresAtDate = new Date(createdDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    }

    try {
      const response = await fetch('/api/memories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          uid: user.uid,
          content: editContent.trim(),
          expiresAt: expiresAtDate ? expiresAtDate.toISOString() : null,
        }),
      });

      if (response.ok) {
        setEditingId(null);
      } else {
        console.error('Failed to update memory');
      }
    } catch (error) {
      console.error('Error updating memory:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm(dict.delete_confirm)) return;

    try {
      const response = await fetch(`/api/memories?id=${id}&uid=${user.uid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to delete memory');
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWorkspace = workspaceId === 'all' || m.workspaceId === workspaceId;
    return matchesSearch && matchesWorkspace;
  });

  return (
    <div className="space-y-6">
      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict.search_placeholder}
          className="w-full bg-white border border-sand-300 rounded-lg px-4 py-2.5 text-sm font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent shadow-sm"
        />
      </div>

      {/* Memory List */}
      <div className="space-y-4">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-charcoal-muted text-sm font-sans italic opacity-75">
            {dict.no_memories}
          </div>
        ) : (
          filteredMemories.map((memory) => {
            const date = memory.createdAt?.toDate ? memory.createdAt.toDate() : new Date(memory.createdAt);
            const dateString = date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const isEditing = editingId === memory.id;

            return (
              <div
                key={memory.id}
                className="bg-white border border-sand-300/60 rounded-xl p-5 shadow-sm space-y-3 hover:border-sand-300 transition-colors"
              >
                <div className="flex justify-between items-center text-[10px] text-charcoal-muted font-sans font-medium tracking-wide">
                  <span>{dateString}</span>
                  {memory.expiresAt && (
                    <span className="text-clay font-bold">
                      {locale === 'tr' ? 'Unutulacak' : 'Expires'}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border border-sand-300 rounded-lg p-3 text-sm font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none h-20"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-sans font-semibold text-charcoal-muted">
                          {dict.expiration}:
                        </label>
                        <select
                          value={editExpiration}
                          onChange={(e) => setEditExpiration(e.target.value)}
                          className="bg-sand-50 border border-sand-300 rounded px-2 py-1 text-xs font-sans text-charcoal focus:outline-none focus:ring-1 focus:ring-sage"
                        >
                          <option value="forever">{dict.exp_forever}</option>
                          <option value="1day">{dict.exp_1day}</option>
                          <option value="7days">{dict.exp_7days}</option>
                          <option value="30days">{dict.exp_30days}</option>
                          <option value="1year">{dict.exp_1year}</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 border border-sand-300 rounded text-xs font-semibold text-charcoal hover:bg-sand-50 transition-colors"
                        >
                          {dict.cancel}
                        </button>
                        <button
                          onClick={() => handleSave(memory.id, memory.createdAt)}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-sage-dark text-white rounded text-xs font-semibold hover:bg-sage transition-colors disabled:opacity-50"
                        >
                          {isSaving ? dict.saving : dict.save}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-sans text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
                      {memory.content}
                    </p>
                    <div className="flex justify-end space-x-2 pt-2 border-t border-sand-300/20">
                      <button
                        onClick={() => handleEditStart(memory)}
                        className="text-xs font-semibold text-sage-dark hover:text-sage transition-colors"
                      >
                        {dict.edit}
                      </button>
                      <button
                        onClick={() => handleDelete(memory.id)}
                        className="text-xs font-semibold text-clay hover:text-red-600 transition-colors"
                      >
                        {dict.delete}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
