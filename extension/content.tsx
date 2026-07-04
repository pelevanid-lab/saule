import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useState, useEffect, useRef } from "react"
import { X, Plus, ExternalLink, CircleDot } from "lucide-react"
import { useStorage } from "@plasmohq/storage/hook"
import logoUrl from "url:~assets/saule-logo.webp"
import { t } from "./i18n"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function FloatingBubble() {
  const [token] = useStorage("sml-auth-token", "")
  const [blacklist] = useStorage<string[]>("sml-blacklist", [])
  
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useStorage<{role: string, text: string}[]>("sml-messages", [])
  const [position, setPosition] = useStorage("sml-bubble-pos", { right: 24, bottom: 24 })
  const [input, setInput] = useState("")
  const [provider, setProvider] = useState("gemini")
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordedEvents, setRecordedEvents] = useState<string[]>([])
  const [maxScrollDepth, setMaxScrollDepth] = useState(0)
  const [proactiveNotification, setProactiveNotification] = useState<{message: string, type: 'info' | 'warning'} | null>(null)
  
  const [activePackageId, setActivePackageId] = useStorage("sml-active-package-id", "")
  const [activePackageTitle, setActivePackageTitle] = useStorage("sml-active-package-title", t("content.new_chat"))

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  useEffect(() => {
    if (!isRecording) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let text = target.innerText || target.getAttribute('aria-label') || target.getAttribute('alt') || '';
      
      // Resim tespiti (Doğrudan resme veya resim içeren bir butona tıklandıysa)
      const img = target.tagName === 'IMG' ? (target as HTMLImageElement) : target.querySelector('img');
      let imageContext = '';
      if (img && img.src) {
        const imgSrc = img.src.substring(0, 150); // Çok uzun data:image URL'lerini kesmek için
        const imgAlt = img.alt || 'Resim';
        imageContext = ` (Görsel incelendi: ${imgAlt} - URL: ${imgSrc})`;
        if (!text) text = imgAlt; // Metin yoksa resmin alt etiketini kullan
      }

      if ((text && text.trim().length > 2 && text.trim().length < 80) || imageContext) {
        setRecordedEvents(prev => [...prev, `[${t("content.click_event")}]: ${text.trim().replace(/\n/g, ' ')}${imageContext}`]);
      }
    };

    const handleSelection = () => {
      const text = window.getSelection()?.toString();
      if (text && text.trim().length > 5 && text.trim().length < 200) {
        setRecordedEvents(prev => {
           // Aynı metni defalarca seçmesini engellemek için
           if(prev.length > 0 && prev[prev.length - 1].includes(text.trim().substring(0, 20))) return prev;
           return [...prev, `[${t("content.read_event")}]: ${text.trim().substring(0, 100)}...`];
        });
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.round((scrollTop / docHeight) * 100);
        setMaxScrollDepth(prev => Math.max(prev, depth));
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    document.addEventListener('mouseup', handleSelection);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      document.removeEventListener('mouseup', handleSelection);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isRecording]);

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleNewChat = () => {
    setMessages([])
    setActivePackageId("")
    setActivePackageTitle(t("content.new_chat"))
  }

  const handleSend = async (isAutoTrigger: boolean | React.MouseEvent = false) => {
    const triggerMode = isAutoTrigger === true;
    const isAutoSummary = triggerMode || (!input.trim() && recordedEvents.length > 0);
    
    if(!input.trim() && !isAutoSummary) {
      return;
    }
    if (!token) {
      alert(t("content.error_token"));
      return;
    }
    
    let userMsg = input.trim();
    if (isAutoSummary) {
      userMsg = t("content.auto_summary_prompt");
    }
    
    // Prepare session history excluding current message
    const sessionHistory = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.text }));
    
    setMessages(prev => [...prev, {role: 'user', text: input.trim() || "(Kayıt Oturumu Özeti)"}])
    setInput("")

    try {
      let pageContext = `Title: ${document.title}\nURL: ${window.location.href}\nContent Snippet: ${document.body.innerText.substring(0, 1500)}`;
      
      if (recordedEvents.length > 0) {
        pageContext += `\n\n--- RECORDED USER ACTIONS ---\n${recordedEvents.join('\n')}`;
      }
      
      setRecordedEvents([]); // Gönderdikten sonra temizle

      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          uid: token, 
          text: userMsg,
          sessionHistory,
          locale: navigator.language.startsWith('tr') ? 'tr' : 'en',
          provider: provider,
          pageContext: pageContext,
          forcePackageId: activePackageId // Lock into current package if it exists
        })
      });

      const data = await res.json()
      if(data.success) {
        // If we didn't have a package OR the backend detected a topic drift and changed it
        if (data.packageId && activePackageId !== data.packageId) {
           setActivePackageId(data.packageId);
           setActivePackageTitle(data.packageTitle);
        }
        
        setMessages(prev => [...prev, {role: 'saule', text: data.reply}]);
      }
    } catch(e) {
      console.error("Saule Ext Error:", e)
      setMessages(prev => [...prev, {role: 'saule', text: t("content.error_connection")}])
    }
  }

  // Ref pattern to guarantee handleSend executes with the absolute latest state
  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  // --- DRAG & DROP LOGIC ---
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startRight: 0, startBottom: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOpen) return; // Sadece logoyken sürüklenebilir
    setIsDragging(true);
    setHasDragged(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setHasDragged(true);
    }
    
    setPosition({
      right: Math.max(0, Math.min(window.innerWidth - 60, dragRef.current.startRight - dx)),
      bottom: Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.startBottom - dy))
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      setHasDragged(false);
      return;
    }
    isRecording ? toggleRecording() : toggleOpen();
  };
  // -------------------------

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsOpen(true); // Kayıt durunca chat'i aç
      
      // Kayıtları garantili olarak fırlat
      if (recordedEvents.length > 0 || maxScrollDepth > 10) {
        // Scroll datasını en sona ekle
        setRecordedEvents(prev => {
          const finalEvents = [...prev];
          if (maxScrollDepth > 10) {
            finalEvents.push(`[${t("content.scroll_event")}]: %${maxScrollDepth}`);
          }
          return finalEvents;
        });

        setTimeout(() => {
          handleSendRef.current(true);
          setMaxScrollDepth(0); // Sıfırla
        }, 50);
      }
    } else {
      setIsRecording(true);
      setMaxScrollDepth(0);
      setIsOpen(false); // Kayıt başlayınca chat'i kapat ki kullanıcı sörf yapsın
    }
  }

  return (
    <div 
      className="fixed z-[2147483647] font-sans text-charcoal" 
      style={isOpen ? { bottom: 24, right: 24 } : { right: position.right, bottom: position.bottom }}
    >
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-sand-50/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col h-[450px] transition-all duration-300 ease-out">
          
          <div className="bg-white/80 backdrop-blur-md text-charcoal border-b border-sand-200 px-4 py-3 flex justify-between items-center shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="font-semibold flex items-center gap-2 text-xs truncate max-w-[130px]" title={activePackageTitle}>
                <img src={logoUrl} alt="Saule" className="w-5 h-5 shrink-0 object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display='none'; }} /> {activePackageTitle}
              </span>
              <a href="http://localhost:3000/tr/app" target="_blank" rel="noreferrer" className="text-[10px] text-sage-dark hover:text-sage flex items-center gap-1 w-max font-medium">
                {t("content.open_terminal")} <ExternalLink size={10} />
              </a>
            </div>
            
            <div className="flex items-center gap-1.5">
              <select 
                value={provider} 
                onChange={e => setProvider(e.target.value)}
                className="bg-sand-100 text-charcoal font-medium text-[10px] px-1.5 py-1 rounded border border-sand-300 outline-none cursor-pointer focus:ring-1 focus:ring-sage"
              >
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
              </select>
              <button onClick={toggleRecording} className={`p-1.5 rounded-md transition-colors ${isRecording ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' : 'text-sage-dark hover:bg-sand-200'}`} title={t("content.record_start_stop")}>
                <CircleDot size={14} strokeWidth={2.5} />
              </button>
              <button onClick={handleNewChat} className="hover:bg-sand-200 text-sage-dark p-1.5 rounded-md transition-colors" title={t("content.new_chat_tooltip")}>
                <Plus size={14} strokeWidth={2.5} />
              </button>
              <button onClick={toggleOpen} className="hover:bg-sand-200 text-charcoal-muted p-1.5 rounded-md transition-colors" title={t("content.close")}>
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-muted italic opacity-70">
                {t("content.listening")}
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-sage-dark text-white self-end rounded-br-sm' : 'bg-white border border-sand-200 self-start rounded-bl-sm'}`}>
                  {m.text}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {recordedEvents.length > 0 && (
            <div className="px-4 py-2 bg-sand-50/90 text-[10px] text-sage-dark border-t border-sand-200 flex justify-between items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
               <span className="font-medium">📍 {recordedEvents.length} {t("content.recorded_events")}</span>
               <button onClick={() => setRecordedEvents([])} className="text-red-400 hover:text-red-600 font-medium">{t("content.cancel")}</button>
            </div>
          )}

          <div className="p-3 bg-white/90 backdrop-blur-md border-t border-sand-200">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t("content.placeholder")}
                className="w-full bg-sand-50/50 border border-sand-300 rounded-full pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sage focus:bg-white transition-colors"
              />
              <button onClick={handleSend} className="absolute right-2 p-1.5 transition-transform hover:scale-110 active:scale-95">
                <img src={logoUrl} alt="Send" className="w-4 h-4 opacity-70 hover:opacity-100 object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display='none'; }} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <div className="relative flex items-center gap-3">
          {/* Proactive Notification Bubble */}
          {proactiveNotification && (
            <div className="bg-white/95 backdrop-blur-md border border-sage-dark/20 shadow-xl rounded-2xl p-3 pr-8 max-w-[240px] animate-in slide-in-from-right-4 fade-in duration-300 relative">
               <button onClick={() => setProactiveNotification(null)} className="absolute right-2 top-2 text-charcoal-muted hover:text-charcoal">
                 <X size={12} />
               </button>
               <div className="flex items-start gap-2">
                 <div className="text-sage-dark mt-0.5">💡</div>
                 <p className="text-xs font-sans text-charcoal leading-snug font-medium">
                   {proactiveNotification.message}
                 </p>
               </div>
            </div>
          )}

          <button 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={handleLogoClick}
            className="p-2 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group focus:outline-none relative cursor-grab active:cursor-grabbing"
            title={isRecording ? t("content.stop_recording") : t("content.drag_tooltip")}
          >
            {isRecording && <div className="absolute inset-0 border-[3px] border-red-500/60 rounded-full animate-ping pointer-events-none"></div>}
            <img src={logoUrl} alt="Saule" className={`w-12 h-12 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform duration-[3000ms] ease-linear pointer-events-none ${isRecording ? 'rotate-[360deg] repeat-infinite' : 'group-hover:rotate-12'}`} style={isRecording ? { animation: 'spin 3s linear infinite' } : {}} onError={(e) => { e.currentTarget.style.display='none'; }} />
          </button>
        </div>
      )}
    </div>
  )
}
