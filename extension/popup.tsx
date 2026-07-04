import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Shield, Trash2 } from "lucide-react"
import logoUrl from "url:~assets/saule-logo.webp"
import "./style.css" // Import Tailwind styles for the popup

export default function PopupUI() {
  const [token, setToken] = useStorage("sml-auth-token", "")
  const [blacklist, setBlacklist] = useStorage<string[]>("sml-blacklist", [])
  
  const [loginId, setLoginId] = useState("")
  const [newDomain, setNewDomain] = useState("")

  const handleLogin = () => {
    if (loginId.trim()) {
      setToken(loginId.trim())
    }
  }

  const handleLogout = () => {
    setToken("")
  }

  const addBlacklist = () => {
    if (newDomain.trim() && !blacklist.includes(newDomain.trim())) {
      setBlacklist([...blacklist, newDomain.trim().toLowerCase()])
      setNewDomain("")
    }
  }

  const removeBlacklist = (domain: string) => {
    setBlacklist(blacklist.filter(d => d !== domain))
  }

  return (
    <div className="w-80 min-h-[400px] bg-sand-50 font-sans text-charcoal flex flex-col">
      <div className="bg-white/90 backdrop-blur-md border-b border-sand-200 text-charcoal p-4 flex items-center justify-center gap-2 shadow-sm">
        <img src={logoUrl} alt="Saule" className="w-6 h-6 object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display='none'; }} />
        <h1 className="text-lg font-bold">Saule Headquarters</h1>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-6">
        {!token ? (
          <div className="flex flex-col gap-3 mt-10">
            <h2 className="text-center font-medium">Connect to Headquarters</h2>
            <p className="text-xs text-charcoal-muted text-center mb-2">
              Lütfen SML Terminal'deki "Extension Bağlantı Kodu"nu buraya yapıştırın.
            </p>
            <input 
              type="text" 
              placeholder="Bağlantı Kodu (Token)"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              className="w-full border border-sand-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sage"
            />
            <button 
              onClick={handleLogin}
              className="bg-sage hover:bg-sage-dark text-white font-medium py-2 rounded-md transition-colors"
            >
              Bağlan
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-3 rounded-lg border border-sand-200 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium truncate max-w-[120px]" title={token}>Bağlı: {token.substring(0,6)}...</span>
              </div>
              <button onClick={handleLogout} className="text-xs text-red-500 hover:underline font-medium">
                Disconnect
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-charcoal-muted border-b border-sand-200 pb-2">
                <Shield size={16} />
                <h3 className="font-medium text-sm">Privacy (Blacklist)</h3>
              </div>
              <p className="text-xs text-charcoal-muted">
                Saule actively listens to provide context. Add domains here to disable Auto-Memory.
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. bank.com"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addBlacklist()}
                  className="flex-1 border border-sand-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage"
                />
                <button 
                  onClick={addBlacklist}
                  className="bg-sage text-white px-3 py-1.5 rounded-md text-sm hover:bg-sage-dark transition-colors"
                >
                  Add
                </button>
              </div>

              <ul className="flex flex-col gap-2 mt-2 max-h-[150px] overflow-y-auto">
                {blacklist.length === 0 ? (
                  <li className="text-xs italic text-center text-sand-300 py-2">No blacklisted domains</li>
                ) : (
                  blacklist.map(domain => (
                    <li key={domain} className="flex justify-between items-center bg-white p-2 rounded-md border border-sand-200 text-sm">
                      <span className="truncate">{domain}</span>
                      <button onClick={() => removeBlacklist(domain)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
