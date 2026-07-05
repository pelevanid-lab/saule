'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Network, Search, Pencil, Trash2, Calendar, ChevronDown, ChevronRight, Globe } from 'lucide-react';

interface RawMemory {
  id: string;
  content: string;
  source: string;
  createdAt: any;
  expiresAt: any;
  workspaceId?: string;
  packageId?: string;
}

interface ContextPackage {
  id: string;
  title: string;
  parentId?: string | null;
  updatedAt: any;
}

interface GraphNode {
  pkg: ContextPackage;
  memories: RawMemory[];
  children: GraphNode[];
}

export default function MemoryHistory({ dict, locale, workspaceId }: { dict: any; locale: string; workspaceId: string }) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<RawMemory[]>([]);
  const [packages, setPackages] = useState<ContextPackage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editNodeTitle, setEditNodeTitle] = useState('');

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories');
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
        
        // Generate mock packages based on the workspaceIds/spaceIds of the loaded memories
        const loadedPackages: ContextPackage[] = [];
        const seenIds = new Set<string>();
        (data.memories || []).forEach((m: RawMemory) => {
          const pid = m.packageId || 'default';
          if (!seenIds.has(pid)) {
            seenIds.add(pid);
            loadedPackages.push({
              id: pid,
              title: pid === 'default' ? (locale === 'tr' ? 'Genel Sohbet' : 'General Chat') : pid,
              updatedAt: new Date(m.createdAt)
            });
          }
        });
        setPackages(loadedPackages);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    }
  };

  useEffect(() => {
    fetchMemories();
    // Poll every 5 seconds to keep it synced with any background extension actions
    const interval = setInterval(fetchMemories, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(dict.delete_confirm)) return;
    try {
      const res = await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMemories();
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const handleSaveNodeTitle = async (id: string) => {
    setEditingNodeId(null);
  };

  const toggleNode = (nodeId: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(nodeId)) newSet.delete(nodeId);
    else newSet.add(nodeId);
    setExpandedNodes(newSet);
  };

  // 1. Filter Memories by Search and Workspace
  const filteredMemories = memories.filter((m) => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWorkspace = workspaceId === 'all' || m.workspaceId === workspaceId;
    return matchesSearch && matchesWorkspace;
  });

  // 2. Build the Graph Tree
  const buildGraph = () => {
    const nodeMap = new Map<string, GraphNode>();
    
    // Initialize nodes
    packages.forEach(pkg => {
      nodeMap.set(pkg.id, { pkg, memories: [], children: [] });
    });

    // Attach memories to nodes
    filteredMemories.forEach(mem => {
      const pid = mem.packageId || 'default';
      if (!nodeMap.has(pid)) {
        nodeMap.set(pid, {
          pkg: { id: pid, title: pid === 'default' ? 'Genel Sohbet' : 'Silinmiş Bağlam', updatedAt: new Date() },
          memories: [], children: []
        });
      }
      nodeMap.get(pid)!.memories.push(mem);
    });

    // Attach children to parents
    const roots: GraphNode[] = [];
    nodeMap.forEach(node => {
      if (node.pkg.parentId && nodeMap.has(node.pkg.parentId)) {
        nodeMap.get(node.pkg.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Filter out roots that have no memories and no children with memories
    const pruneEmpty = (node: GraphNode): boolean => {
      node.children = node.children.filter(pruneEmpty);
      return node.memories.length > 0 || node.children.length > 0;
    };

    return roots.filter(pruneEmpty).sort((a, b) => {
      // Sort roots by most recently updated memory
      const aTime = a.memories[0]?.createdAt && typeof a.memories[0].createdAt === 'object' && a.memories[0].createdAt.toMillis
        ? a.memories[0].createdAt.toMillis()
        : Number(a.memories[0]?.createdAt) || 0;
      const bTime = b.memories[0]?.createdAt && typeof b.memories[0].createdAt === 'object' && b.memories[0].createdAt.toMillis
        ? b.memories[0].createdAt.toMillis()
        : Number(b.memories[0]?.createdAt) || 0;
      return bTime - aTime;
    });
  };

  const graphRoots = buildGraph();

  const renderNode = (node: GraphNode, depth: number = 0) => {
    const isRoot = depth === 0;
    const isExpanded = expandedNodes.has(node.pkg.id) || isRoot; // Roots are expanded by default

    return (
      <div key={node.pkg.id} className={`w-full ${isRoot ? 'mb-6' : 'mt-4 ml-6 pl-4 border-l-2 border-sand-300'}`}>
        
        {/* Node Header */}
        <div 
          onClick={() => toggleNode(node.pkg.id)}
          className={`group flex items-center gap-2 cursor-pointer p-3 rounded-lg transition-colors ${isRoot ? 'bg-white border border-sand-300/60 shadow-sm hover:border-sage-dark/30' : 'bg-sand-50/50 hover:bg-sand-100'}`}
        >
          {node.children.length > 0 || node.memories.length > 0 ? (
             isExpanded ? <ChevronDown size={18} className="text-sage-dark flex-shrink-0" /> : <ChevronRight size={18} className="text-charcoal-muted flex-shrink-0" />
          ) : (
             <Network size={18} className="text-sage opacity-50 flex-shrink-0" />
          )}

          {editingNodeId === node.pkg.id ? (
            <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input 
                autoFocus
                value={editNodeTitle}
                onChange={(e) => setEditNodeTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNodeTitle(node.pkg.id);
                  if (e.key === 'Escape') setEditingNodeId(null);
                }}
                className="flex-1 bg-white border border-sage rounded px-2 py-1 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-sage"
              />
              <button 
                onClick={() => handleSaveNodeTitle(node.pkg.id)}
                className="text-xs bg-sage text-white px-2 py-1 rounded hover:bg-sage-dark"
              >
                {locale === 'tr' ? 'Kaydet' : 'Save'}
              </button>
            </div>
          ) : (
            <>
              <h3 className={`font-sans font-semibold ${isRoot ? 'text-charcoal text-base' : 'text-charcoal-muted text-sm'}`}>
                {node.pkg.title}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingNodeId(node.pkg.id);
                  setEditNodeTitle(node.pkg.title);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-muted hover:text-sage transition-opacity ml-1"
                title={locale === 'tr' ? 'Başlığı Düzenle' : 'Edit Title'}
              >
                <Pencil size={14} />
              </button>
            </>
          )}

          <span className="ml-auto flex-shrink-0 text-[10px] bg-sand-200 text-charcoal-muted px-2 py-0.5 rounded-full font-medium">
            {node.memories.length + node.children.reduce((acc, c) => acc + c.memories.length, 0)} Kavram
          </span>
        </div>

        {/* Node Content (Expanding Contexts) */}
        {isExpanded && (
          <div className={`mt-2 ${isRoot ? 'ml-4' : 'ml-2'}`}>
            {/* Memories of this Node */}
            {node.memories.length > 0 && (
              <div className="space-y-2 mb-4">
                {node.memories.map(mem => (
                  <div key={mem.id} className="flex gap-3 group items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage-dark mt-2 opacity-60 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-sans text-charcoal leading-relaxed">{mem.content}</p>
                      <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-charcoal-muted/70 flex items-center gap-1">
                          <Calendar size={10} />
                          {mem.createdAt?.toDate ? mem.createdAt.toDate().toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US') : new Date(mem.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                        </span>
                        {mem.source && mem.source !== 'saule-terminal' && mem.source !== 'system_auto' && (
                          <span className="text-[10px] text-charcoal-muted/70 flex items-center gap-1 ml-2">
                            <Globe size={10} />
                            {mem.source}
                          </span>
                        )}
                        <button onClick={() => handleDelete(mem.id)} className="text-[10px] text-clay hover:text-red-600 ml-2 flex items-center gap-1 transition-colors">
                          <Trash2 size={10} /> {dict.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Child Nodes (Hooked Contexts) */}
            {node.children.length > 0 && (
              <div className="space-y-2">
                {node.children.map(child => renderNode(child, depth + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Search Filter */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-charcoal-muted" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Bağlamlar ağında ara..."
          className="w-full bg-white border border-sand-300 rounded-lg pl-10 pr-4 py-3 text-sm font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent shadow-sm"
        />
      </div>

      {/* Graph Tree */}
      <div className="space-y-2">
        {graphRoots.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <Network size={48} className="text-sand-300 opacity-50" />
            <p className="text-charcoal-muted text-sm font-sans italic opacity-75">
              Hafıza ağında henüz bir düğüm (Node) bulunmuyor...
            </p>
          </div>
        ) : (
          graphRoots.map(root => renderNode(root, 0))
        )}
      </div>
    </div>
  );
}
