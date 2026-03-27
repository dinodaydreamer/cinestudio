import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useDropzone } from 'react-dropzone';
import { 
  Video, 
  Image as ImageIcon, 
  Type, 
  Play, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  Download,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Extend Window for AI Studio API
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

type GenerationMode = 'text' | 'image' | 'start-end';

interface VideoResult {
  url: string;
  prompt: string;
  timestamp: number;
}

interface VideoGeneratorProps {
  externalApiKey?: string;
}

export default function VideoGenerator({ externalApiKey }: VideoGeneratorProps) {
  const [mode, setMode] = useState<GenerationMode>('text');
  const [prompt, setPrompt] = useState('');
  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // New options
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');

  const onDropStart = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setStartImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const onDropEnd = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEndImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getStartProps, getInputProps: getStartInput } = useDropzone({
    onDrop: onDropStart,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const { getRootProps: getEndProps, getInputProps: getEndInput } = useDropzone({
    onDrop: onDropEnd,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const generateVideo = async () => {
    const apiKey = externalApiKey || process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      setError('Vui lòng nhập API Key ở menu phía trên.');
      return;
    }

    if (mode === 'text' && !prompt) {
      setError('Vui lòng nhập mô tả video.');
      return;
    }

    if ((mode === 'image' || mode === 'start-end') && !startImage) {
      setError('Vui lòng tải lên hình ảnh bắt đầu.');
      return;
    }

    if (mode === 'start-end' && !endImage) {
      setError('Vui lòng tải lên hình ảnh kết thúc.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusMessage('Đang khởi tạo Veo AI...');

    try {
      const ai = new GoogleGenAI({ apiKey });

      const config: any = {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio
      };

      let payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'A cinematic video',
        config
      };

      if (startImage) {
        payload.image = {
          imageBytes: startImage.split(',')[1],
          mimeType: startImage.split(';')[0].split(':')[1]
        };
      }

      if (endImage && mode === 'start-end') {
        payload.config.lastFrame = {
          imageBytes: endImage.split(',')[1],
          mimeType: endImage.split(';')[0].split(':')[1]
        };
      }

      setStatusMessage('Đang gửi yêu cầu tạo video...');
      let operation = await ai.models.generateVideos(payload);

      const messages = [
        'Đang phân tích ý tưởng của bạn...',
        'Đang dựng khung hình điện ảnh...',
        'Đang tối ưu hóa ánh sáng và chuyển động...',
        'Gần xong rồi, đang hoàn thiện video...',
        'Đang xử lý các chi tiết cuối cùng...'
      ];

      let messageIndex = 0;
      const interval = setInterval(() => {
        setStatusMessage(messages[messageIndex % messages.length]);
        messageIndex++;
      }, 10000);

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      clearInterval(interval);
      setStatusMessage('Đã tạo video thành công!');

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey,
          },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoResult({
          url,
          prompt: prompt || 'Video được tạo từ hình ảnh',
          timestamp: Date.now()
        });
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Requested entity was not found')) {
        setError('API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.');
      } else {
        setError('Có lỗi xảy ra trong quá trình tạo video. Vui lòng thử lại.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Controls */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-tight text-white/90">Tạo Video AI</h2>
            <button 
              onClick={() => setShowGuide(true)}
              className="p-2 rounded-full hover:bg-orange-500/10 transition-colors text-white/60 hover:text-orange-500"
            >
              <HelpCircle size={20} />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {[
              { id: 'text', icon: Type, label: 'Văn bản' },
              { id: 'image', icon: ImageIcon, label: 'Hình ảnh' },
              { id: 'start-end', icon: Video, label: 'Bắt đầu-Kết thúc' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as GenerationMode)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                  mode === m.id 
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Mô tả video</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Một con mèo robot đang lái ván trượt neon với tốc độ cao..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
              />
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Tỷ lệ khung hình</label>
                <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
                  {[
                    { id: '16:9', label: '16:9' },
                    { id: '9:16', label: '9:16' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setAspectRatio(r.id as any)}
                      className={cn(
                        "flex-1 py-1.5 rounded text-[10px] font-bold transition-all",
                        aspectRatio === r.id ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Độ phân giải</label>
                <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
                  {[
                    { id: '720p', label: '720p' },
                    { id: '1080p', label: '1080p' }
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setResolution(res.id as any)}
                      className={cn(
                        "flex-1 py-1.5 rounded text-[10px] font-bold transition-all",
                        resolution === res.id ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                      )}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Uploads */}
            {(mode === 'image' || mode === 'start-end') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Hình ảnh bắt đầu</label>
                  <div 
                    {...getStartProps()} 
                    className={cn(
                      "aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative",
                      startImage ? "border-orange-500/30" : "border-white/10 hover:border-orange-500/20 bg-white/5"
                    )}
                  >
                    <input {...getStartInput()} />
                    {startImage ? (
                      <img src={startImage} alt="Start" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="text-white/20 mb-2" size={24} />
                        <span className="text-xs text-white/40">Tải ảnh lên</span>
                      </>
                    )}
                  </div>
                </div>

                {mode === 'start-end' && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Hình ảnh kết thúc</label>
                    <div 
                      {...getEndProps()} 
                      className={cn(
                        "aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative",
                        endImage ? "border-orange-500/30" : "border-white/10 hover:border-orange-500/20 bg-white/5"
                      )}
                    >
                      <input {...getEndInput()} />
                      {endImage ? (
                        <img src={endImage} alt="End" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="text-white/20 mb-2" size={24} />
                          <span className="text-xs text-white/40">Tải ảnh lên</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-200/80 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateVideo}
              disabled={isGenerating}
              className={cn(
                "w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-3",
                isGenerating 
                  ? "bg-white/5 text-white/40 cursor-not-allowed" 
                  : "bg-orange-600 text-white hover:bg-orange-500 active:scale-[0.98] shadow-lg shadow-orange-900/20"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang tạo video...
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" />
                  Bắt đầu tạo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="relative">
          <div className="sticky top-12 space-y-6">
            <div className="aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center relative group">
              {videoResult ? (
                <>
                  <video 
                    src={videoResult.url} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={videoResult.url} 
                      download="flow-video.mp4"
                      className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-orange-600 transition-colors inline-block"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </>
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-4 px-8 text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-orange-500 animate-spin" />
                  <div className="space-y-2">
                    <p className="text-white/90 font-medium">{statusMessage}</p>
                    <p className="text-xs text-white/40">Quá trình này có thể mất vài phút. Vui lòng không đóng trình duyệt.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/20">
                  <Video size={64} strokeWidth={1} />
                  <p className="text-sm font-light tracking-wide">Video của bạn sẽ xuất hiện tại đây</p>
                </div>
              )}
            </div>

            {videoResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4"
              >
                <div className="flex items-center gap-2 text-orange-500">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Hoàn thành</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed italic">
                  "{videoResult.prompt}"
                </p>
                <div className="text-[10px] text-white/20 uppercase tracking-widest">
                  {new Date(videoResult.timestamp).toLocaleString('vi-VN')}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowGuide(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-light text-white">Hướng dẫn sử dụng</h3>
                <button onClick={() => setShowGuide(false)} className="text-white/40 hover:text-white">Đóng</button>
              </div>

              <div className="space-y-8">
                <section className="space-y-4">
                  <h4 className="text-white/90 font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">1</div>
                    Nhập API Key
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Nhập Gemini API Key của bạn vào ô văn bản ở thanh menu phía trên. Bạn có thể lấy key tại <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-orange-500 underline">Google AI Studio</a>.
                  </p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-white/90 font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">2</div>
                    Chọn chế độ tạo
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="text-white/90 text-xs font-bold">Văn bản</div>
                      <p className="text-[10px] text-white/40">Tạo video hoàn toàn từ mô tả chữ.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="text-white/90 text-xs font-bold">Hình ảnh</div>
                      <p className="text-[10px] text-white/40">Dùng ảnh làm khung hình bắt đầu.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="text-white/90 text-xs font-bold">Bắt đầu-Kết thúc</div>
                      <p className="text-[10px] text-white/40">Tạo chuyển động giữa 2 tấm ảnh.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-white/90 font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">3</div>
                    Mẹo viết Prompt
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Hãy mô tả chi tiết về ánh sáng, phong cách điện ảnh và chuyển động. Ví dụ: "Góc quay từ trên cao, ánh sáng hoàng hôn ấm áp, chuyển động mượt mà..."
                  </p>
                </section>
              </div>

              <button 
                onClick={() => setShowGuide(false)}
                className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold uppercase text-sm"
              >
                Đã hiểu
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
