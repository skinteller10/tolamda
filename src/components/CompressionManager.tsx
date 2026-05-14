import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Settings2, Save } from 'lucide-react';
import { compressImage } from './RestaurantForm';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CompressionSettings {
  maxWidth: number;
  quality: number;
}

interface CompressionManagerProps {
  settings: CompressionSettings;
  onSave: (settings: CompressionSettings) => void;
  onBack: () => void;
}

export default function CompressionManager({ settings, onSave, onBack }: CompressionManagerProps) {
  const [config, setConfig] = useState(settings);
  const [testImage, setTestImage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ original: number; compressed: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const originalSize = file.size;
      const compressed = await compressImage(file, config.quality / 100, config.maxWidth);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setTestImage(reader.result as string);
        setTestResult({
          original: originalSize,
          compressed: compressed.size
        });
        setIsProcessing(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-bg min-h-screen p-6"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text font-serif italic">Quản lý nén</h1>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[14px] font-bold text-text-mid shadow-sm transition-all hover:bg-rose/5 active:scale-95 border border-rose/5"
          >
            <ArrowLeft size={18} className="text-rose" />
            Quay lại
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex bg-white/60 backdrop-blur-md rounded-2xl p-1 shadow-sm border border-rose/10">
             <div className="flex-1 rounded-xl py-3 text-center text-[11px] font-black uppercase tracking-widest bg-gradient-to-br from-rose to-rose-dark text-white shadow-lg shadow-rose/20 scale-105 z-10">
                THÔNG SỐ NÉN
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Width */}
            <div className="space-y-4">
               <label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80 pl-1">CHIỀU DÀI TỐI ĐA (PX)</label>
               <div className="relative flex items-center bg-white rounded-[28px] p-6 shadow-sm border border-rose/10">
                  <input 
                    type="number" 
                    value={config.maxWidth}
                    onChange={e => setConfig({ ...config, maxWidth: parseInt(e.target.value) || 0 })}
                    className="w-full text-4xl font-black text-rose-dark bg-transparent outline-none font-serif italic"
                  />
                  <div className="flex flex-col gap-2 ml-4 border-l border-rose/10 pl-4">
                     <button onClick={() => setConfig(c => ({...c, maxWidth: c.maxWidth + 100}))} className="text-rose hover:scale-125 transition-transform">▲</button>
                     <button onClick={() => setConfig(c => ({...c, maxWidth: Math.max(100, c.maxWidth - 100)}))} className="text-rose hover:scale-125 transition-transform">▼</button>
                  </div>
                  <span className="ml-4 text-text-light font-bold">px</span>
               </div>
               <p className="text-[11px] italic text-text-light font-medium pl-1">Ảnh sẽ được co lại nếu chiều rộng/cao vượt mức này</p>
            </div>

            {/* Quality */}
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80 pl-1">CHẤT LƯỢNG ({config.quality}%)</label>
               </div>
               <div className="bg-white rounded-[28px] p-8 shadow-sm border border-rose/10 h-[104px] flex flex-col justify-center">
                  <input 
                    type="range"
                    min="10"
                    max="100"
                    value={config.quality}
                    onChange={e => setConfig({ ...config, quality: parseInt(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-rose/10 accent-rose"
                  />
                  <div className="flex justify-between mt-4">
                     <span className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Dung lượng thấp</span>
                     <span className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Chất lượng cao</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Test Zone */}
        <div className="relative">
          <div className="rounded-[44px] border-2 border-dashed border-rose/20 bg-white/40 p-10 text-center transition-all hover:bg-white/60">
            <h2 className="mb-2 text-xl font-bold text-rose-dark font-serif italic">KHU VỰC THỬ NGHIỆM</h2>
            <p className="text-sm font-medium text-text-light mb-8">Tải ảnh lên để xem trước kết quả nén</p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleTestUpload}
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-rose/10 bg-white p-12 shadow-sm transition-all hover:border-rose/30 cursor-pointer group"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose border-t-transparent" />
              ) : testImage ? (
                <div className="space-y-6 w-full">
                  <img src={testImage} alt="Test result" className="mx-auto max-h-48 rounded-[20px] shadow-card border border-rose/5" />
                  <div className="flex gap-4 justify-center">
                    <div className="bg-white px-4 py-3 rounded-2xl border border-rose/5 shadow-sm min-w-[80px]">
                      <p className="text-[10px] text-text-light uppercase font-black tracking-wider">Gốc</p>
                      <p className="font-bold text-text">{formatSize(testResult?.original || 0)}</p>
                    </div>
                    <div className="bg-rose/5 px-4 py-3 rounded-2xl border border-rose/10 shadow-sm min-w-[80px]">
                      <p className="text-[10px] text-rose uppercase font-black tracking-wider">Sau nén</p>
                      <p className="font-bold text-rose-dark">{formatSize(testResult?.compressed || 0)}</p>
                    </div>
                    <div className="bg-green/10 px-4 py-3 rounded-2xl border border-green/20 shadow-sm flex items-center">
                       <p className="font-black text-green-dark text-lg italic">-{Math.round(100 - (testResult?.compressed || 0) / (testResult?.original || 1) * 100)}%</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-rose">Bấm để thử ảnh khác</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose/5 text-rose transition-transform group-hover:scale-110 shadow-sm">
                    <Upload size={32} />
                  </div>
                  <p className="text-lg font-bold text-rose-dark font-serif italic">Chọn ảnh thử nghiệm</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={() => onSave(config)}
          className="w-full flex items-center justify-center gap-3 rounded-[28px] bg-gradient-to-br from-rose to-rose-dark py-6 text-xl font-black text-white shadow-xl shadow-rose/25 transition-all hover:scale-[1.01] active:scale-[0.98] uppercase tracking-widest"
        >
          <Save size={24} />
          Lưu cấu hình
        </button>
      </div>
    </motion.div>
  );
}
