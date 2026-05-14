import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Restaurant, City, CITIES, Rating } from '../types';

interface RestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (restaurant: Partial<Restaurant>, imageFile?: File) => Promise<void>;
  editingRestaurant: Restaurant | null;
  ratings: Rating[];
}

export default function RestaurantForm({ isOpen, onClose, onSave, editingRestaurant, ratings }: RestaurantFormProps) {
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    city: 'hanoi',
    address: '',
    open: '08:00',
    close: '22:00',
    rating: 0,
    info: '',
    img: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingRestaurant) {
      setFormData(editingRestaurant);
      setPreview(editingRestaurant.img);
    } else {
      setFormData({
        name: '',
        city: 'hanoi',
        address: '',
        open: '08:00',
        close: '22:00',
        rating: 0,
        info: '',
        img: ''
      });
      setPreview('');
    }
    setImageFile(null);
  }, [editingRestaurant, isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData, imageFile || undefined);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            <div className="w-full max-w-[720px] rounded-t-[32px] bg-white p-6 pb-10 shadow-2xl overflow-y-auto max-h-[92vh]">
              <h2 className="mb-6 text-center font-serif text-2xl font-bold text-text">
                {editingRestaurant ? "Cập nhật quán" : "Thêm quán mới"}
              </h2>

              <div className="space-y-4.5">
                <div className="flex flex-col gap-2">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Tên quán</label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="fi"
                    placeholder="Tên quán..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Thành phố</label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value as City })}
                    className="fi"
                  >
                    {(Object.keys(CITIES) as City[]).map(city => (
                      <option key={city} value={city}>{CITIES[city]}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Địa chỉ</label>
                  <input
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="fi"
                    placeholder="Địa chỉ..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Mở cửa</label>
                    <input
                      type="time"
                      value={formData.open}
                      onChange={e => setFormData({ ...formData, open: e.target.value })}
                      className="fi"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Đóng cửa</label>
                    <input
                      type="time"
                      value={formData.close}
                      onChange={e => setFormData({ ...formData, close: e.target.value })}
                      className="fi"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Đánh giá</label>
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

                <div className="flex flex-col gap-2">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Thông tin</label>
                  <textarea
                    value={formData.info}
                    onChange={e => setFormData({ ...formData, info: e.target.value })}
                    className="fi min-h-[100px]"
                    placeholder="Mô tả..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Hình ảnh</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed border-rose/30 bg-bg p-5 font-bold text-text-mid"
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-20 w-20 rounded-xl object-cover" />
                    ) : (
                      <Plus size={32} />
                    )}
                    <span>{preview ? 'Thay đổi ảnh' : 'Bấm để tải ảnh'}</span>
                  </button>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={onClose}
                    className="flex-[0.4] rounded-[18px] bg-[#EDF2F7] p-4 text-[15px] font-bold text-text-mid transition-all active:scale-95 disabled:opacity-50"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSubmit}
                    className="flex-1 rounded-[18px] bg-rose p-4 text-[15px] font-extrabold text-white shadow-xl shadow-rose/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu quán"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
