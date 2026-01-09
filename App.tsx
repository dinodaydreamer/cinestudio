
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  CameraBody, LensType, FocalLength, AspectRatio, ImageSize, 
  GeneratedImage, RefImage, CameraAngle 
} from './types';
import { CAMERAS, LENSES, ANGLES, FOCAL_LENGTHS, RATIOS, SIZES, CAMERA_SPECS, LENS_SPECS, ANGLE_SPECS } from './constants';

// --- Tooltip Component ---
const InfoTooltip: React.FC<{ title: string; desc: string; detail: string; usage: string }> = ({ title, desc, detail, usage }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 glass-card rounded-2xl border border-[#D4AF37]/30 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[60] scale-95 group-hover:scale-100 backdrop-blur-xl">
    <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2 pb-1 border-b border-white/10">{title}</div>
    <div className="text-[11px] text-white font-semibold mb-1">{desc}</div>
    <div className="text-[10px] text-gray-400 mb-2 leading-relaxed italic">"{detail}"</div>
    <div className="text-[9px] text-gray-500 bg-white/5 p-2 rounded-lg border border-white/5">{usage}</div>
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 glass-card border-r border-b border-[#D4AF37]/30 rotate-45 z-[-1]"></div>
  </div>
);

// --- Guide Modal Component ---
const UserGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6" onClick={onClose}>
      <div className="max-w-2xl w-full glass-card p-8 md:p-12 rounded-[2.5rem] border border-[#D4AF37]/20 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-cinematic font-bold text-[#D4AF37] uppercase tracking-tight flex items-center gap-3">
            <i className="fas fa-book-open"></i> Director's Guide
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-8 text-sm text-gray-300 font-light leading-relaxed">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">1</div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-1">Cine Hardware Selection</p>
              <p>Chọn loại máy quay (Body) để xác định color science và dynamic range. Ví dụ: ARRI cho màu sắc cảm xúc, RED cho hình ảnh sắc nét 8K.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">2</div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-1">Optical Glass System</p>
              <p>Chọn Lens để tạo texture và bokeh. Cooke mang lại cảm giác ấm áp, Panavision C mang lại chất Anamorphic cổ điển với flare xanh ngang.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">3</div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-1">Perspective & Focal Length</p>
              <p>Tiêu cự quyết định góc nhìn. 8mm là góc panorama, 12mm là ultra wide, 18mm là wide, 25mm-35mm là medium shot, 50mm-85mm là chân dung nửa người, và 135mm là cận cảnh.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">4</div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-1">Camera Angle</p>
              <p>Góc máy quyết định cảm xúc của cảnh quay. Bạn có thể chọn các góc có sẵn hoặc tự nhập góc máy tùy chỉnh.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 py-4 btn-gold rounded-2xl uppercase tracking-widest text-xs"
        >
          Understood, Let's Shoot
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('cine_studio_api_key') || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  
  // Form State
  const [prompt, setPrompt] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<CameraBody>(CameraBody.ARRI_ALEXA_35);
  const [selectedLens, setSelectedLens] = useState<LensType>(LensType.ZEISS_ULTRA);
  const [selectedFocal, setSelectedFocal] = useState<FocalLength>(35);
  const [isAngleEnabled, setIsAngleEnabled] = useState<boolean>(true);
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>(CameraAngle.EYE_LEVEL);
  const [customAngle, setCustomAngle] = useState<string>("");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("16:9");
  const [selectedSize, setSelectedSize] = useState<ImageSize>("1K");
  const [isAnamorphic, setIsAnamorphic] = useState<boolean>(false);
  const [referenceImages, setReferenceImages] = useState<RefImage[]>([]);

  useEffect(() => {
    localStorage.setItem('cine_studio_api_key', apiKey);
  }, [apiKey]);

  const deleteShot = (id: string) => {
    setResults(prev => prev.filter(img => img.id !== id));
  };

  const clearResults = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ phân cảnh (shots) đã tạo không?")) {
      setResults([]);
    }
  };

  const generateImage = async () => {
    if (loading) return;
    if (!apiKey) {
      setStatus("Vui lòng nhập API Key trước khi bắt đầu.");
      return;
    }

    setLoading(true);
    setStatus("Developing negative...");

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const lensSpec = LENS_SPECS[selectedLens];
      const cameraSpec = CAMERA_SPECS[selectedCamera];
      
      let angleText = "";
      if (isAngleEnabled) {
        const angleSpec = ANGLE_SPECS[selectedAngle];
        angleText = `Camera Angle: ${angleSpec.prompt} ${customAngle ? `, custom position: ${customAngle}` : ''}`;
      }

      let focalPhysics = "";
      if (selectedFocal === 8) {
        focalPhysics = "extremely wide panoramic vista, expansive field of view, epic scale, straight horizons, immersive panorama, rectilinear wide.";
      } else if (selectedFocal === 12) {
        focalPhysics = "ultra-wide rectilinear angle, vast spatial depth, professional wide-angle cinema optics, clean edges.";
      } else if (selectedFocal === 18) {
        focalPhysics = "wide-angle cinema perspective, great field of depth, establishing shot, cinematic clarity.";
      } else if (selectedFocal === 25 || selectedFocal === 35) {
        focalPhysics = "medium shot perspective, natural human field of view, standard cinema framing, balanced depth.";
      } else if (selectedFocal === 50 || selectedFocal === 75 || selectedFocal === 85) {
        focalPhysics = "half-body portrait framing, beautiful subject-to-background separation, shallow depth of field, creamy bokeh.";
      } else if (selectedFocal >= 100) {
        focalPhysics = `close-up portrait optics (${selectedFocal}mm), extreme lens compression, tight facial detail, massive background blur, shallow focus on the eyes.`;
      }

      // Refined Anamorphic: more subtle, avoiding overkill
      const anamorphicText = isAnamorphic 
        ? "subtle anamorphic 2x characteristics, slight oval bokeh in out-of-focus areas, gentle horizontal anamorphic lens flares, classic cinemascope optical rendering." 
        : "spherical lens rendering, round circular bokeh, clean professional glass optics.";

      const fullPrompt = `MASTER_CINEMA_FRAME. 
Shot on ${selectedCamera} (${cameraSpec.desc}). 
Optics: ${selectedLens} (${lensSpec.desc}) at ${selectedFocal}mm.
${angleText}
Optical Physics: ${focalPhysics} ${lensSpec.prompt} ${anamorphicText}
Atmosphere: Professional cinematic lighting, volumetric shadows, film-grade color science.
Subject: ${prompt}
Highest fidelity, 8k raw, authentic film grain, master cinematography.`;

      const contents = {
        parts: [
          ...referenceImages.map(img => ({
            inlineData: { data: img.data, mimeType: img.mimeType }
          })),
          { text: fullPrompt }
        ]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents,
        config: {
          imageConfig: {
            aspectRatio: selectedRatio,
            imageSize: selectedSize
          }
        }
      });

      if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error("Render interrupted.");
      }

      let foundImageUrl = "";
      const parts = response.candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          foundImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImageUrl) {
        setResults(prev => [{
          id: Date.now().toString(),
          url: foundImageUrl,
          prompt,
          settings: {
            camera: selectedCamera,
            lens: selectedLens,
            focalLength: selectedFocal,
            angle: selectedAngle,
            ratio: selectedRatio,
            size: selectedSize
          },
          timestamp: Date.now()
        }, ...prev]);
        setStatus("Cut! Shot captured.");
      }
    } catch (error: any) {
      console.error(error);
      setStatus("Technical error: " + (error.message || "Unknown issue"));
    } finally {
      setLoading(false);
    }
  };

  const getFocalDescription = (f: number) => {
    if (f === 8) return "PANORAMA WIDE";
    if (f === 12) return "ULTRA-WIDE";
    if (f === 18) return "WIDE";
    if (f === 25 || f === 35) return "MEDIUM SHOT";
    if (f === 50 || f === 85) return "PORTRAIT HALF-BODY";
    if (f >= 100) return "CLOSE-UP PORTRAIT";
    return "STANDARD PERSPECTIVE";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200">
      
      {/* Header with Manual API Key Control */}
      <header className="py-4 px-6 border-b border-white/5 glass-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl md:text-2xl font-cinematic font-bold text-[#D4AF37] tracking-tighter uppercase whitespace-nowrap">
              CINEMA <span className="text-white font-light">STUDIO</span>
            </h1>
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="text-[9px] text-gray-500 hover:text-white uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-full transition-all"
            >
              Guide
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            {/* Manual API Key Textbox */}
            <div className="relative group w-full max-w-[280px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <div className={`w-1.5 h-1.5 rounded-full ${apiKey.length > 20 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
              </div>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập Gemini API Key..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2 pl-8 pr-4 text-[10px] text-gray-300 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.06] transition-all font-mono"
              />
              <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                 <span className="text-[8px] text-gray-600 font-bold tracking-widest uppercase">
                  {apiKey.length > 20 ? 'Ready' : 'Required'}
                 </span>
              </div>
            </div>

            {/* Clear All Button */}
            <button 
              onClick={clearResults}
              disabled={results.length === 0}
              className={`text-[9px] uppercase tracking-widest px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                results.length > 0 
                ? 'border-red-500/30 text-red-500/80 hover:bg-red-500/10 hover:border-red-500' 
                : 'border-white/5 text-gray-700 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-trash-alt"></i> Xóa Hết
            </button>
          </div>
        </div>
      </header>

      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <main className="flex-grow container mx-auto px-4 py-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Production Dashboard */}
        <div className="lg:col-span-5 space-y-8">
          
          <section className="glass-card p-6 rounded-3xl border border-white/5 space-y-8">
            
            {/* Camera Body Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold flex items-center gap-2">
                  <i className="fas fa-video"></i> 01. Camera Body
                </label>
                <span className="text-[9px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded uppercase">Hardware</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CAMERAS.map(cam => (
                  <div key={cam} className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedCamera(cam as CameraBody)}
                      className={`w-full text-[10px] p-3 rounded-xl border transition-all text-left ${
                        selectedCamera === cam 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                          : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{CAMERA_SPECS[cam].icon}</span>
                        <span className="font-medium truncate">{cam}</span>
                      </div>
                    </button>
                    <InfoTooltip 
                      title={cam}
                      desc={CAMERA_SPECS[cam].desc}
                      detail={CAMERA_SPECS[cam].detail}
                      usage={CAMERA_SPECS[cam].usage}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lens Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold flex items-center gap-2">
                  <i className="fas fa-bullseye"></i> 02. Optical System
                </label>
                <span className="text-[9px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded uppercase">Glass</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LENSES.map(lens => (
                  <div key={lens} className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedLens(lens as LensType)}
                      className={`w-full text-[10px] p-3 rounded-xl border transition-all text-left ${
                        selectedLens === lens 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                          : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/20'
                      }`}
                    >
                      <span className="font-medium truncate">{lens}</span>
                    </button>
                    <InfoTooltip 
                      title={lens}
                      desc={LENS_SPECS[lens].desc}
                      detail={LENS_SPECS[lens].detail}
                      usage={LENS_SPECS[lens].usage}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Focal Length Grid */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-4 block">03. Focal Length (MM)</label>
              <div className="grid grid-cols-5 gap-2">
                {FOCAL_LENGTHS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSelectedFocal(f as FocalLength)}
                    className={`text-[10px] py-3 rounded-lg border font-mono transition-all ${
                      selectedFocal === f ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[8px] text-gray-600 uppercase tracking-widest text-center font-bold">
                {getFocalDescription(selectedFocal)}
              </p>
            </div>

            {/* Camera Angle Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold flex items-center gap-2">
                  <i className="fas fa-camera"></i> 04. Camera Angle
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{isAngleEnabled ? 'Enabled' : 'Disabled'}</span>
                  <button 
                    onClick={() => setIsAngleEnabled(!isAngleEnabled)}
                    className={`w-8 h-4 rounded-full transition-all relative ${isAngleEnabled ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isAngleEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
              
              {isAngleEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {ANGLES.map(angle => (
                      <div key={angle} className="relative group">
                        <button
                          type="button"
                          onClick={() => setSelectedAngle(angle as CameraAngle)}
                          className={`w-full text-[10px] p-3 rounded-xl border transition-all text-left ${
                            selectedAngle === angle 
                              ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                              : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/20'
                          }`}
                        >
                          <span className="font-medium truncate">{angle}</span>
                        </button>
                        <InfoTooltip 
                          title={angle}
                          desc={ANGLE_SPECS[angle].desc}
                          detail={ANGLE_SPECS[angle].detail}
                          usage={ANGLE_SPECS[angle].usage}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <input 
                      type="text"
                      value={customAngle}
                      onChange={(e) => setCustomAngle(e.target.value)}
                      placeholder="Góc máy tùy chỉnh (vd: 30 degree low tilt)..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-[10px] text-gray-300 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Global Settings */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-3 block">Ratio & Format</label>
                <div className="flex flex-wrap gap-1.5">
                  {RATIOS.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRatio(r as AspectRatio)}
                      className={`text-[9px] px-2 py-1.5 rounded-md border transition-all flex-1 min-w-[50px] ${
                        selectedRatio === r ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/5 text-gray-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-3 block">Master Resolution</label>
                  <div className="flex gap-1.5">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s as ImageSize)}
                        className={`text-[9px] px-3 py-1.5 rounded-md border transition-all flex-1 ${
                          selectedSize === s ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/5 text-gray-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer p-2 bg-white/[0.01] rounded-xl border border-white/5 hover:bg-white/[0.03] transition-all h-[36px]">
                    <input 
                      type="checkbox" 
                      checked={isAnamorphic} 
                      onChange={(e) => setIsAnamorphic(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Anamorphic (Subtle)</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* References */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-3 block">Moodboard / Reference</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <label className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#D4AF37]/40 transition-all">
                  <i className="fas fa-plus text-gray-700 text-xs"></i>
                  <input type="file" multiple accept="image/*" onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach((file: File) => {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          const base64 = (re.target?.result as string).split(',')[1];
                          setReferenceImages(prev => [...prev, { id: Math.random().toString(), data: base64, mimeType: file.type }]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }} className="hidden" />
                </label>
                {referenceImages.map(img => (
                  <div key={img.id} className="relative flex-shrink-0 w-16 h-16 group">
                    <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-cover rounded-xl" alt="Ref" />
                    <button onClick={() => setReferenceImages(prev => prev.filter(i => i.id !== img.id))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Prompt */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-3 block">Scene Synopsis</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Mô tả cảnh quay, nhân vật, ánh sáng..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs min-h-[120px] focus:outline-none focus:border-[#D4AF37]/50 resize-none font-light leading-relaxed"
              />
            </div>

            <button
              onClick={generateImage}
              disabled={loading || !prompt || apiKey.length < 20}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs tracking-[0.3em] uppercase shadow-2xl relative overflow-hidden group ${apiKey.length > 20 ? 'btn-gold' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'}`}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Developing...</span>
                </>
              ) : (
                <>
                  <i className={`fas fa-record-vinyl ${apiKey.length > 20 ? 'animate-pulse text-red-700' : 'text-gray-700'}`}></i>
                  <span>{apiKey.length > 20 ? 'Render Shot' : 'API Key Required'}</span>
                </>
              )}
            </button>
            {status && <p className="text-center text-[10px] text-[#D4AF37] uppercase tracking-widest mt-4 font-bold">{status}</p>}
          </section>
        </div>

        {/* Studio Output */}
        <div className="lg:col-span-7 space-y-8">
          <section className="glass-card p-6 md:p-10 rounded-3xl border border-white/5 min-h-[800px] relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-10">
              <h2 className="text-xl font-cinematic font-bold flex items-center gap-3">
                <i className="fas fa-photo-video text-[#D4AF37]"></i> SHOTS
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Live Viewport</span>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="h-[600px] flex flex-col items-center justify-center text-gray-800 border-2 border-dashed border-white/[0.02] rounded-[3rem]">
                <i className="fas fa-film text-[120px] opacity-[0.03] mb-8"></i>
                <p className="font-light tracking-[0.4em] text-xs uppercase mb-2">Awaiting Production</p>
                <p className="text-[10px] text-gray-700 italic tracking-wider">Initialize optics to begin</p>
              </div>
            ) : (
              <div className="space-y-16">
                {results.map((img, index) => {
                  const shotNumber = results.length - index;
                  return (
                    <div key={img.id} className="group relative glass-card p-6 rounded-[2.5rem] border border-white/5 bg-black/40 transition-all hover:bg-black/60">
                      
                      <div className="absolute -top-4 -left-4 bg-[#D4AF37] text-black font-cinematic font-bold px-5 py-2 rounded-xl shadow-xl z-10 text-sm tracking-widest">
                        SHOT #{shotNumber}
                      </div>

                      <div className="relative overflow-hidden rounded-[1.5rem] bg-zinc-950 shadow-2xl mb-8 group-hover:shadow-[#D4AF37]/5 transition-all">
                        <img src={img.url} className="w-full h-auto object-contain max-h-[80vh]" alt={`Shot ${shotNumber}`} />
                        <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => deleteShot(img.id)}
                            className="w-12 h-12 rounded-full bg-red-600/20 backdrop-blur-md text-red-500 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl"
                            title="Delete Shot"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <a href={img.url} download={`shot-${shotNumber}.png`} className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center hover:scale-110 transition-all shadow-xl">
                            <i className="fas fa-download"></i>
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest mb-1">Cine Body</p>
                          <p className="text-[10px] text-[#D4AF37] font-medium truncate">{img.settings.camera}</p>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest mb-1">Optics</p>
                          <p className="text-[10px] text-[#D4AF37] font-medium truncate">{img.settings.lens} • {img.settings.focalLength}mm</p>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest mb-1">Composition</p>
                          <p className="text-[10px] text-[#D4AF37] font-medium truncate">{img.settings.angle}</p>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest mb-1">Render</p>
                          <p className="text-[10px] text-[#D4AF37] font-medium">{img.settings.size} Master</p>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-white/[0.01] rounded-2xl border border-white/5">
                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                          <span className="text-white/20 font-bold mr-2 uppercase text-[9px]">Synopsis //</span>
                          "{img.prompt}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-gray-600 border-t border-white/5 mt-12 bg-black/50">
        <p className="mb-4 text-xs tracking-widest">© 2025 CINEMA STUDIO • THE FUTURE OF OPTICAL GENERATION</p>
      </footer>
    </div>
  );
};

export default App;
