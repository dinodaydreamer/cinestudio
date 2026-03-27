import React, { useState } from 'react';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';

export default function App() {
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500 selection:text-black font-sans">
      {/* Subtle background gradient with orange/red tones */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header apiKey={apiKey} onApiKeyChange={setApiKey} />
        
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-12 py-20 text-center space-y-8">
            <h1 className="text-7xl md:text-9xl font-light tracking-[-0.04em] text-white leading-[0.9] uppercase">
              AI VIDEO <br />
              <span className="text-orange-500 italic font-serif lowercase">FLOW</span>
            </h1>
            <p className="text-lg md:text-xl text-white/40 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Biến ý tưởng của bạn thành những thước phim chuyên nghiệp chỉ trong vài phút với công nghệ AI tiên tiến nhất từ Google.
            </p>
          </div>

          <VideoGenerator externalApiKey={apiKey} />
        </main>

        <footer className="w-full py-12 px-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full" />
            </div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase">AI VIDEO FLOW 2026</span>
          </div>

          <div className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
            Sức mạnh bởi Google Veo AI
          </div>
        </footer>
      </div>
    </div>
  );
}
