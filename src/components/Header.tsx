import React from 'react';
import { Video, Key } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}

export default function Header({ apiKey, onApiKeyChange }: HeaderProps) {
  const isKeyValid = apiKey.length > 20;

  return (
    <header className="w-full py-6 px-12 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)]">
          <Video size={20} className="text-white" fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-light tracking-[0.2em] text-white uppercase">AI Video</span>
          <span className="text-[10px] font-bold tracking-[0.4em] text-orange-500 uppercase -mt-1 ml-0.5">Flow</span>
        </div>
      </div>

      <div className="flex-1 max-w-md ml-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-orange-500 transition-colors">
            <Key size={14} />
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Nhập Gemini API Key của bạn..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all shadow-inner"
          />
          {apiKey && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                isKeyValid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}>
                <div className={cn("w-1 h-1 rounded-full", isKeyValid ? "bg-green-500" : "bg-red-500")} />
                {isKeyValid ? "Sẵn sàng" : "Chưa hợp lệ"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-12">
        <a 
          href="https://labs.google/fx/vi/tools/flow" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.1em] text-white/60 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex items-center gap-2 uppercase"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          Kết nối với FLOW
        </a>
        <div className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase whitespace-nowrap">
          Chế độ: API Key trực tiếp
        </div>
      </div>
    </header>
  );
}
