import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Restaurant, Rating } from '../types';
import imageCompression from 'browser-image-compression';
import ImageCropper from './ImageCropper';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const compressImage = async (
  file: File, 
  quality: number = 0.8, 
  maxWidth: number = 1200
) => {
    const options = {
      maxSizeMB: 0.15, // Cố gắng nén dưới 150KB để lưu base64
      maxWidthOrHeight: 800,
      useWebWorker: true,
      initialQuality: 0.6,
    };

  try {
    const compressTask = imageCompression(file, options);
    const timeoutTask = new Promise<File>((_, reject) => setTimeout(() => reject(new Error("Quá thời gian nén ảnh")), 60000));
    const compressedFile = await Promise.race([compressTask, timeoutTask]);
    return compressedFile;
  } catch (error) {
    console.error("Lỗi nén ảnh:", error);
    throw error;
  }
};

interface CompressionSettings {
  maxWidth: number;
  quality: number;
  enabledCategories: ('to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da')[];
}

interface RestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (restaurant: Partial<Restaurant>, finalImages: (string | File | Blob)[], onProgress?: (msg: string) => void) => Promise<void>;
  editingRestaurant: Restaurant | null;
  ratings: Rating[];
  citiesList: { id: string; label: string }[];
  typesList: { id: string; label: string }[];
  formsList: { id: string; label: string }[];
  compressionSettings: CompressionSettings;
  mode?: 'to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da';
}

export default function RestaurantForm({ 
  isOpen, onClose, onSave, editingRestaurant, ratings, citiesList, typesList, formsList,
  compressionSettings,
  mode = 'to-an'
}: RestaurantFormProps) {
  const isAn = mode === 'to-an';
  const isSkinCare = mode === 'to-lam-da';
  const isGalleryLayout = mode === 'to-chup' || mode === 'to-du-lich';
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    city: 'hanoi',
    type: typesList[0]?.id || 'cafe',
    category: mode,
    form: 'offline',
    address: '',
    open: '08:00',
    close: '22:00',
    open2: '',
    close2: '',
    branch2Address: '',
    branch2Open: '',
    branch2Close: '',
    branch2Open2: '',
    branch2Close2: '',
    rating: 0,
    info: '',
    img: '',
    images: []
  });

  // Update category when mode changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, category: mode }));
  }, [mode]);

  const [imagesData, setImagesData] = useState<(string | File | Blob)[]>([]);
  const [imageTypes, setImageTypes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHour2, setShowHour2] = useState(false);
  const [showBranch2, setShowBranch2] = useState(false);
  const [showBranch2Hour2, setShowBranch2Hour2] = useState(false);
  
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (editingRestaurant) {
      setFormData(editingRestaurant);
      // Prepare images for display, keeping duplicates if they have different paths/content
      const all: (string | File | Blob)[] = [editingRestaurant.img, ...(editingRestaurant.images || [])].filter(Boolean);
      setImagesData(all);
      
      // Load image types
      const types = editingRestaurant.imageTypes || [];
      // Fill with default if missing
      const fullTypes = all.map((_, i) => types[i] || 'máy film');
      setImageTypes(fullTypes);

      setShowHour2(!!editingRestaurant.open2);
      setShowBranch2(!!editingRestaurant.branch2Address);
      setShowBranch2Hour2(!!editingRestaurant.branch2Open2);
    } else {
      setFormData({
        name: '',
        city: citiesList[0]?.id || 'hanoi',
        type: typesList[0]?.id || (isAn ? 'cafe' : 'máy film'),
        category: mode,
        form: formsList[0]?.id || 'offline',
        address: '',
        open: '08:00',
        close: '22:00',
        open2: '',
        close2: '',
        branch2Address: '',
        branch2Open: '',
        branch2Close: '',
        branch2Open2: '',
        branch2Close2: '',
        rating: 0,
        info: '',
        img: '',
        images: []
      });
      setImagesData([]);
      setImageTypes([]);
      setShowHour2(false);
      setShowBranch2(false);
      setShowBranch2Hour2(false);
    }
  }, [editingRestaurant, isOpen, citiesList, typesList, formsList, mode]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isGalleryLayout) {
        // Skip cropping for gallery layout
        setImagesData([...imagesData, file]);
        setImageTypes([...imageTypes, '']); // Default empty type
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCropImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const handleCropDone = (croppedFile: File, fileUrl: string) => {
    setImagesData([...imagesData, croppedFile]);
    setImageTypes([...imageTypes, '']); // Default empty type
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setImagesData(imagesData.filter((_, i) => i !== index));
    setImageTypes(imageTypes.filter((_, i) => i !== index));
  };

  const handleImageTypeChange = (index: number, value: string) => {
    const next = [...imageTypes];
    next[index] = value;
    setImageTypes(next);
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      setSaveError("Vui lòng nhập tên!");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      setSaveError("Đang nén ảnh...");
      const finalImages = await Promise.all(imagesData.map(async (item, idx) => {
        const category = formData.category || mode;
        const shouldCompress = compressionSettings?.enabledCategories?.includes(category as any);
        
        if (typeof item !== 'string' && shouldCompress) {
          console.log(`Bắt đầu nén ảnh ${idx}...`);
          try {
            const result = await compressImage(item as File, compressionSettings.quality / 100, compressionSettings.maxWidth);
            console.log(`Nén ảnh ${idx} thành công. Kích thước mới: ${result.size}`);
            return result;
          } catch (err) {
            console.error(`Nén ảnh ${idx} thất bại:`, err);
            return item; // Trả về ảnh gốc nếu nén lỗi
          }
        }
        return item; // existing url or non-compressed image
      }));
      
      const finalData = { ...formData, imageTypes };
      await onSave(finalData, finalImages, (msg) => {
        setSaveError(msg);
      });
      onClose();
    } catch (error: any) {
      console.error(error);
      let errMsg = error.message || "Có lỗi xảy ra khi lưu";
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error) {
           errMsg = "Lỗi: " + parsed.error;
           if (errMsg.includes("permission")) {
               errMsg = "Bạn không có quyền cập nhật quán này.";
           } else if (errMsg.includes("storage")) {
               errMsg = "Lỗi tải ảnh lên. Vui lòng thử lại.";
           }
        }
      } catch (e) {}
      setSaveError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc} 
          onCropDone={handleCropDone} 
          onCropCancel={handleCropCancel} 
        />
      )}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1100] bg-text/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[1200] flex justify-center"
          >
            <div className="w-full max-w-[720px] rounded-t-[40px] bg-white p-6 pb-12 shadow-float overflow-y-auto max-h-[95vh] border-t border-rose/10">
              <div className="w-12 h-1.5 bg-rose/10 rounded-full mx-auto mb-6" />
              <h2 className="mb-8 text-center font-serif text-3xl font-bold text-rose-dark italic">
                {editingRestaurant ? (
                    isAn ? "Cập nhật quán" : 
                    isSkinCare ? "Cập nhật bài viết" : 
                    "Cập nhật Bộ ảnh"
                  ) : (
                    isAn ? "Thêm quán mới" : 
                    isSkinCare ? "Thêm bài viết mới" : 
                    "Thêm Bộ ảnh"
                  )}
              </h2>

              <div className="space-y-6">
                <div className="flex flex-col gap-2.5">
                  <label className="pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">
                    {isAn ? "Tên quán" : isSkinCare ? "Tiêu đề bài viết" : "Tên bộ ảnh"} <span className="text-red">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="fi"
                    placeholder={isAn ? "Tớ ăn quán nào..." : isSkinCare ? "Tiêu đề..." : "Tên bộ ảnh..."}
                  />
                </div>

                <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", isGalleryLayout && "hidden")}>
                  {(isAn || isSkinCare) && (
                    <div className="flex flex-col gap-2.5">
                      <label className="pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">Thành phố</label>
                      <select
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="fi"
                      >
                        {citiesList.map(city => (
                          <option key={city.id} value={city.id}>{city.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-2.5">
                    <label className="pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">{isAn ? "Loại" : isSkinCare ? "Phân loại" : "Loại máy"}</label>
                    <select
                      value={formData.type || (isGalleryLayout ? 'máy film' : 'cafe')}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="fi"
                    >
                      {typesList.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  {(isAn || isSkinCare) && (
                    <div className="flex flex-col gap-2.5">
                      <label className="pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">Hình thức</label>
                      <select
                        value={formData.form || 'offline'}
                        onChange={e => setFormData({ ...formData, form: e.target.value })}
                        className="fi"
                      >
                        {formsList.map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Chi nhánh 1 & 2 */}
                {isAn && (
                  <>
                    <div className="rounded-[24px] border border-rose/10 bg-rose/5 p-4 relative pt-6 shadow-sm">
                      <span className="absolute -top-3 left-6 shadow-sm rounded-full bg-rose-mid px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest">Cơ sở 1</span>
                      <div className="flex flex-col gap-3">
                        <input
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                          className="fi bg-white"
                          placeholder="Địa chỉ..."
                        />
                        <div className="flex gap-3">
                           <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                              <span className="text-[11px] font-bold text-text-light">Mở:</span>
                              <input
                                type="time"
                                value={formData.open}
                                onChange={e => setFormData({ ...formData, open: e.target.value })}
                                className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                              />
                           </div>
                           <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                              <span className="text-[11px] font-bold text-text-light">Đóng:</span>
                              <input
                                type="time"
                                value={formData.close}
                                onChange={e => setFormData({ ...formData, close: e.target.value })}
                                className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                              />
                           </div>
                        </div>
                      </div>
                      {showHour2 && (
                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-rose/5">
                          <span className="text-[11px] font-black text-text-light/70 uppercase">Giờ hoạt động 2</span>
                          <div className="flex gap-3">
                             <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                                <span className="text-[11px] font-bold text-text-light">Mở:</span>
                                <input
                                  type="time"
                                  value={formData.open2}
                                  onChange={e => setFormData({ ...formData, open2: e.target.value })}
                                  className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                                />
                             </div>
                             <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                                <span className="text-[11px] font-bold text-text-light">Đóng:</span>
                                <input
                                  type="time"
                                  value={formData.close2}
                                  onChange={e => setFormData({ ...formData, close2: e.target.value })}
                                  className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                                />
                             </div>
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={() => setShowHour2(!showHour2)}
                        className="mt-3 text-[12px] font-bold text-rose px-2 py-1 hover:bg-rose/5 rounded-lg transition-colors"
                      >
                        {showHour2 ? "✕ Bỏ giờ 2" : "+ Thêm khung giờ khác"}
                      </button>
                    </div>

                    {!showBranch2 ? (
                      <button onClick={() => setShowBranch2(true)} className="w-full py-4 rounded-[22px] border-2 border-dashed border-rose/20 text-rose font-bold text-[14px] hover:bg-rose/5 transition-all">
                        + Thêm chi nhánh (Cơ sở 2)
                      </button>
                    ) : (
                      <div className="rounded-[24px] border border-rose/10 bg-indigo/5 p-4 relative pt-6 shadow-sm mt-4">
                        <span className="absolute -top-3 left-6 shadow-sm rounded-full bg-indigo-500 px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest">Cơ sở 2</span>
                        <button onClick={() => {
                            setShowBranch2(false); 
                            setFormData({...formData, branch2Address: '', branch2Open: '', branch2Close: '', branch2Open2: '', branch2Close2: ''});
                          }} 
                          className="absolute -top-3 right-6 bg-white shadow-sm border border-red/20 rounded-full px-3 py-1 text-[10px] font-bold text-red"
                        >
                          Xoá chi nhánh
                        </button>
                        <div className="flex flex-col gap-3">
                          <input
                            value={formData.branch2Address || ''}
                            onChange={e => setFormData({ ...formData, branch2Address: e.target.value })}
                            className="fi bg-white"
                            placeholder="Địa chỉ c.sở 2..."
                          />
                          <div className="flex gap-3">
                             <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                                <span className="text-[11px] font-bold text-text-light">Mở:</span>
                                <input
                                  type="time"
                                  value={formData.branch2Open || ''}
                                  onChange={e => setFormData({ ...formData, branch2Open: e.target.value })}
                                  className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                                />
                             </div>
                             <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                                <span className="text-[11px] font-bold text-text-light">Đóng:</span>
                                <input
                                  type="time"
                                  value={formData.branch2Close || ''}
                                  onChange={e => setFormData({ ...formData, branch2Close: e.target.value })}
                                  className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                                />
                             </div>
                          </div>
                        </div>
                        {showBranch2Hour2 && (
                          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-rose/5">
                            <span className="text-[11px] font-black text-text-light/70 uppercase">Giờ hoạt động 2 (CS2)</span>
                            <div className="flex gap-3">
                               <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                                  <span className="text-[11px] font-bold text-text-light">Mở:</span>
                                  <input
                                    type="time"
                                    value={formData.branch2Open2 || ''}
                                    onChange={e => setFormData({ ...formData, branch2Open2: e.target.value })}
                                    className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                                  />
                               </div>
                               <div className="flex flex-1 items-center gap-2 bg-white rounded-[18px] px-3 border border-rose/5">
                                  <span className="text-[11px] font-bold text-text-light">Đóng:</span>
                                  <input
                                    type="time"
                                    value={formData.branch2Close2 || ''}
                                    onChange={e => setFormData({ ...formData, branch2Close2: e.target.value })}
                                    className="bg-transparent text-sm font-bold text-rose-dark outline-none py-2 flex-1"
                                  />
                               </div>
                            </div>
                          </div>
                        )}
                        <button 
                          onClick={() => setShowBranch2Hour2(!showBranch2Hour2)}
                          className="mt-3 text-[12px] font-bold text-rose px-2 py-1 hover:bg-rose/5 rounded-lg transition-colors"
                        >
                          {showBranch2Hour2 ? "✕ Bỏ giờ 2" : "+ Thêm khung giờ cho CS2"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Spacer for rhythm */}
                {isGalleryLayout && <div className="h-2" />}

                {(isAn || isSkinCare) && (
                  <div className="flex flex-col gap-2.5">
                    <label className="pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">Đánh giá</label>
                    <select
                      value={formData.rating}
                      onChange={e => setFormData({ ...formData, rating: +e.target.value })}
                      className="fi"
                    >
                      {ratings.map((r, i) => (
                        <option key={i} value={i}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(isAn || isSkinCare) && (
                  <div className="flex flex-col gap-2.5">
                    <label className="pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">{isAn ? "Thông tin" : "Bài viết"}</label>
                    <textarea
                      value={formData.info}
                      onChange={e => setFormData({ ...formData, info: e.target.value })}
                      className="fi min-h-[120px] leading-relaxed"
                      placeholder={isAn ? "Tớ thích quán này vì..." : "Viết gì đó..."}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <label className="pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-text-light/80">{isAn ? "Hình ảnh của quán" : "Ảnh (Ảnh 1 là ảnh đại diện)"}</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex flex-col items-center gap-4 rounded-[28px] border-2 border-dashed border-rose/20 bg-rose/5 p-8 transition-all hover:border-rose/40 hover:bg-rose/[0.08] cursor-pointer"
                  >
                    {imagesData.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                        {imagesData.map((item, idx) => {
                          const src = typeof item === 'string' ? item : URL.createObjectURL(item);
                          return (
                            <div key={idx} className="flex flex-col gap-2">
                              <div className="relative aspect-square w-full group/item">
                                <img src={src} alt={`Preview ${idx}`} className={cn("h-full w-full rounded-2xl object-cover shadow-sm", idx === 0 ? "ring-4 ring-rose ring-offset-2" : "border border-rose/10")} />
                                {idx === 0 && <span className="absolute -top-2 -left-2 bg-rose text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-md">Main</span>}
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                  className="absolute -top-2 -right-2 bg-white text-red border border-red/20 text-[10px] w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm z-10"
                                >
                                  ✕
                                </button>
                              </div>
                              {!isAn && (
                                <select 
                                  value={imageTypes[idx] || ''}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => handleImageTypeChange(idx, e.target.value)}
                                  className="text-[10px] font-bold py-1 px-2 rounded-lg bg-white border border-rose/10 text-rose-dark outline-none"
                                >
                                  <option value="">(Bỏ qua)</option>
                                  <option value="máy film">Máy film</option>
                                  <option value="máy số">Máy số</option>
                                  <option value="điện thoại">Điện thoại</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                        <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-rose/30 flex items-center justify-center text-rose/40 group-hover:text-rose/60 transition-colors bg-white">
                           <Plus size={24} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-rose shadow-sm group-hover:scale-110 transition-transform">
                           <Plus size={32} />
                        </div>
                        <div className="text-center">
                           <p className="font-bold text-text-mid">Bấm để tải ảnh lên</p>
                           <p className="text-[12px] text-text-light font-medium mt-1">Ảnh đầu tiên sẽ là ảnh đại diện của quán</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {saveError && (
                  <div className="bg-red/10 text-red border border-red/20 p-4 rounded-[22px] text-sm font-semibold">
                    {saveError}
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={onClose}
                    className="flex-[0.4] rounded-[22px] bg-rose/5 p-4.5 text-[15px] font-bold text-rose transition-all active:scale-95 disabled:opacity-50 border border-rose/10"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSubmit}
                    className="flex-1 rounded-[22px] bg-gradient-to-br from-rose to-rose-dark p-4.5 text-[15px] font-black text-white shadow-xl shadow-rose/25 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? "Đang lưu..." : (editingRestaurant ? "CẬP NHẬT" : (isAn ? "LƯU QUÁN" : "LƯU BÀI VIẾT"))}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
