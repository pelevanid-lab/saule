import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useState, useEffect } from "react"
import { Sparkles, X, Plus, ExternalLink } from "lucide-react"
import { useStorage } from "@plasmohq/storage/hook"

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
  const [input, setInput] = useState("")
  const [provider, setProvider] = useState("gemini")
  
  const [activePackageId, setActivePackageId] = useStorage("sml-active-package-id", "")
  const [activePackageTitle, setActivePackageTitle] = useStorage("sml-active-package-title", "Yeni Sohbet")

  const isBlacklisted = blacklist.some(domain => window.location.hostname.includes(domain))

  // Fetch history on load if we have an active package
  useEffect(() => {
    if (token && activePackageId && messages.length === 0) {
      fetch(`http://localhost:3000/api/chat?packageId=${activePackageId}&uid=${token}`)
        .then(r => r.json())
        .then(data => {
           if (data.success && data.messages) {
             setMessages(data.messages)
           }
        })
        .catch(console.error)
    }
  }, [token, activePackageId])

  if (isBlacklisted) return null;

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleNewChat = () => {
    setMessages([])
    setActivePackageId("")
    setActivePackageTitle("Yeni Sohbet")
  }

  const handleSend = async () => {
    if(!input.trim() || !token) {
      if (!token) alert("Lütfen eklenti menüsünden (Popup) SML Token kodunuzu girerek bağlanın.");
      return;
    }
    const userMsg = input.trim();
    setMessages(prev => [...prev, {role: 'user', text: userMsg}])
    setInput("")

    try {
      const pageContext = `Title: ${document.title}\nURL: ${window.location.href}\nContent Snippet: ${document.body.innerText.substring(0, 1500)}`;

      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          uid: token, 
          text: userMsg,
          locale: "en",
          provider: provider,
          pageContext: pageContext,
          forcePackageId: activePackageId // Lock into current package if it exists
        })
      });

      const data = await res.json()
      if(data.success) {
        // If we didn't have a package, save the one VectorService decided on
        if (!activePackageId && data.packageId) {
           setActivePackageId(data.packageId);
           setActivePackageTitle(data.packageTitle);
        }
        
        setMessages(prev => [...prev, {role: 'saule', text: data.reply}]);
      }
    } catch(e) {
      console.error("Saule Ext Error:", e)
      setMessages(prev => [...prev, {role: 'saule', text: 'Merkez (Headquarters) ile bağlantı kurulamadı.'}])
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[2147483647] font-sans text-charcoal">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-sand-50 rounded-2xl shadow-2xl border border-sand-300 overflow-hidden flex flex-col h-[450px] transition-all duration-300 ease-out">
          
          <div className="bg-sage-dark text-white px-4 py-3 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="font-medium flex items-center gap-1.5 text-xs truncate max-w-[130px]" title={activePackageTitle}>
                <Sparkles size={14} className="shrink-0" /> {activePackageTitle}
              </span>
              <a href="http://localhost:3000/tr/app" target="_blank" rel="noreferrer" className="text-[10px] text-sand-200 hover:text-white flex items-center gap-1 w-max">
                Terminal'i Aç <ExternalLink size={10} />
              </a>
            </div>
            
            <div className="flex items-center gap-1.5">
              <select 
                value={provider} 
                onChange={e => setProvider(e.target.value)}
                className="bg-sage text-white text-[10px] px-1 py-0.5 rounded border border-sage outline-none cursor-pointer"
              >
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
              </select>
              <button onClick={handleNewChat} className="hover:bg-sage/50 p-1.5 rounded transition-colors" title="Yeni Sohbet (Konu Değiştir)">
                <Plus size={14} />
              </button>
              <button onClick={toggleOpen} className="hover:bg-sage/50 p-1.5 rounded transition-colors" title="Kapat">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-sand-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-muted italic opacity-70">
                SML is listening silently.
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-xl text-sm max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-sage-dark text-white self-end rounded-br-none' : 'bg-white border border-sand-200 self-start rounded-bl-none'}`}>
                  {m.text}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-white border-t border-sand-200">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Recall or save to memory..."
                className="w-full bg-sand-50 border border-sand-300 rounded-full pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sage"
              />
              <button onClick={handleSend} className="absolute right-2 p-1.5 text-sage hover:text-sage-dark transition-colors">
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button 
          onClick={toggleOpen}
          className="bg-sage-dark hover:bg-sage text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <Sparkles size={24} />
        </button>
      )}
    </div>
  )
}
