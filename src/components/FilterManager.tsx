import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import Pagination from './Pagination';

interface FilterManagerProps {
  onBack: () => void;
  // State from App
  cities: {id: string, label: string}[];
  setCities: (val: {id: string, label: string}[]) => void;
  citiesDuLich: {id: string, label: string}[];
  setCitiesDuLich: (val: {id: string, label: string}[]) => void;
  types: {id: string, label: string}[];
  setTypes: (val: {id: string, label: string}[]) => void;
  forms: {id: string, label: string}[];
  setForms: (val: {id: string, label: string}[]) => void;
  ratings: {label: string, bc: string}[];
  setRatings: (val: {label: string, bc: string}[]) => void;
  galleryTypes: {id: string, label: string}[];
  setGalleryTypes: (val: {id: string, label: string}[]) => void;
}

type MainTab = 'to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da';
type SubTab = 'cities' | 'ratings' | 'types' | 'forms' | 'galleryTypes';

export default function FilterManager({
  onBack, cities, setCities, citiesDuLich, setCitiesDuLich, 
  types, setTypes, forms, setForms, ratings, setRatings,
  galleryTypes, setGalleryTypes
}: FilterManagerProps) {
  const [mainTab, setMainTab] = useState<MainTab>('to-an');
  const [activeTab, setActiveTab] = useState<SubTab>('cities');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const getActiveData = () => {
    switch (activeTab) {
      case 'cities': return mainTab === 'to-du-lich' ? citiesDuLich : cities;
      case 'types': return types;
      case 'forms': return forms;
      case 'ratings': return ratings.map((r, i) => ({ id: i.toString(), label: r.label, bc: r.bc }));
      case 'galleryTypes': return galleryTypes;
    }
  };

  const handleAdd = () => {
    if (!newItemText.trim()) return;
    const text = newItemText.trim();
    if (!window.confirm(`Bạn có chắc chắn muốn thêm: "${text}"?`)) return;
    if (activeTab === 'cities') {
      if (mainTab === 'to-du-lich') setCitiesDuLich([...citiesDuLich, { id: 'city_dl_'+Date.now(), label: text }]);
      else setCities([...cities, { id: 'city_'+Date.now(), label: text }]);
    } else if (activeTab === 'types') {
      setTypes([...types, { id: 'type_'+Date.now(), label: text }]);
    } else if (activeTab === 'forms') {
      setForms([...forms, { id: 'form_'+Date.now(), label: text }]);
    } else if (activeTab === 'ratings') {
      setRatings([...ratings, { label: text, bc: 'bg-white text-text border-text-light' }]);
    } else if (activeTab === 'galleryTypes') {
      setGalleryTypes([...galleryTypes, { id: 'gtype_'+Date.now(), label: text }]);
    }
    setNewItemText('');
  };

  const handleRemove = (indexToRem: number, gId: string) => {
    const item = getActiveData()[indexToRem];
    if (!window.confirm(`Bạn có chắc chắn muốn xóa: "${item.label}"?`)) return;
    if (activeTab === 'cities') {
      if (mainTab === 'to-du-lich') setCitiesDuLich(citiesDuLich.filter(x => x.id !== gId));
      else setCities(cities.filter(x => x.id !== gId));
    }
    else if (activeTab === 'types') setTypes(types.filter(x => x.id !== gId));
    else if (activeTab === 'forms') setForms(forms.filter(x => x.id !== gId));
    else if (activeTab === 'ratings') setRatings(ratings.filter((_, i) => i !== indexToRem));
    else if (activeTab === 'galleryTypes') setGalleryTypes(galleryTypes.filter(x => x.id !== gId));
  };

  const startEditing = (id: string, currentLabel: string) => {
    setEditingId(id);
    setEditText(currentLabel);
  };

  const saveEdit = (index: number, id: string) => {
    if (!window.confirm("Lưu thay đổi?")) return;
    handleChange(index, id, editText);
    setEditingId(null);
  };

  const handleChange = (indexToEdit: number, gId: string, newVal: string) => {
    if (activeTab === 'cities') {
      if (mainTab === 'to-du-lich') setCitiesDuLich(citiesDuLich.map(x => x.id === gId ? {...x, label: newVal} : x));
      else setCities(cities.map(x => x.id === gId ? {...x, label: newVal} : x));
    }
    else if (activeTab === 'types') setTypes(types.map(x => x.id === gId ? {...x, label: newVal} : x));
    else if (activeTab === 'forms') setForms(forms.map(x => x.id === gId ? {...x, label: newVal} : x));
    else if (activeTab === 'ratings') setRatings(ratings.map((x, i) => i === indexToEdit ? {...x, label: newVal} : x));
    else if (activeTab === 'galleryTypes') setGalleryTypes(galleryTypes.map(x => x.id === gId ? {...x, label: newVal} : x));
  };

  const data = getActiveData();
  const paginatedData = data.slice((page - 1) * perPage, page * perPage);

  const subTabs = (mainTab === 'to-an' || mainTab === 'to-lam-da')
    ? [
        { id: 'cities' as SubTab, name: 'Thành phố' },
        { id: 'types' as SubTab, name: 'Loại quán' },
        { id: 'forms' as SubTab, name: 'Hình thức' },
        { id: 'ratings' as SubTab, name: 'Đánh giá' }
      ]
    : mainTab === 'to-du-lich'
    ? [
        { id: 'cities' as SubTab, name: 'Thành phố' }
      ]
    : [
        { id: 'galleryTypes' as SubTab, name: 'Loại máy' }
      ];

  // Auto-switch sub-tab if main tab changes
  React.useEffect(() => {
    if (mainTab === 'to-chup') setActiveTab('galleryTypes');
    else if (activeTab === 'galleryTypes') setActiveTab('cities');
  }, [mainTab]);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text font-serif italic">Quản lý bộ lọc</h1>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[14px] font-bold text-text-mid shadow-sm transition-all hover:bg-rose/5 active:scale-95 border border-rose/5"
        >
          <ArrowLeft size={18} className="text-rose" />
          Quay lại
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-rose/5 p-1 rounded-2xl border border-rose/10 gap-1">
        {[
          { id: 'to-an', name: 'Tớ ăn' },
          { id: 'to-lam-da', name: 'Tớ làm da' },
          { id: 'to-chup', name: 'Tớ chụp' },
          { id: 'to-du-lich', name: 'Tớ du lịch' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id as MainTab)}
            className={`flex-1 rounded-xl py-2.5 text-[12px] font-black uppercase tracking-widest transition-all ${mainTab === t.id ? 'bg-white text-rose shadow-sm' : 'text-text-light hover:text-rose-mid'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-white/60 backdrop-blur-md rounded-2xl p-1 shadow-sm border border-rose/10 flex-wrap gap-1">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setPage(1); }}
            className={`flex-1 min-w-[80px] rounded-xl py-3 text-center text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-gradient-to-br from-rose to-rose-dark text-white shadow-lg shadow-rose/20 scale-105 z-10' : 'text-text-mid hover:bg-rose/5'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          value={newItemText}
          onChange={e => setNewItemText(e.target.value)}
          placeholder={`Thêm ${activeTab === 'cities' ? 'thành phố' : activeTab === 'ratings' ? 'đánh giá' : (activeTab === 'types' || activeTab === 'galleryTypes') ? 'loại' : 'hình thức'} mới...`} 
          className="fi flex-1"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="flex items-center justify-center rounded-xl bg-green px-4 text-white font-bold active:scale-95">
          <Plus size={20} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-rose/15 overflow-hidden">
        <div className="flex flex-col">
          {paginatedData.map((item, index) => {
            const actualIndex = (page - 1) * perPage + index;
            const isEditing = editingId === (item.id || actualIndex.toString());
            return (
              <div key={item.id || actualIndex} className="flex items-center gap-3 p-3 border-b border-rose/5 last:border-b-0 hover:bg-rose/5">
                <div className="w-8 text-center text-sm font-extrabold text-text-light">{actualIndex + 1}</div>
                {isEditing ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveEdit(actualIndex, item.id)}
                    className="flex-1 bg-white shadow-inner outline-none font-bold text-text px-2 py-1 rounded-lg border border-rose/20"
                  />
                ) : (
                  <div className={`flex-1 font-bold text-text px-2 py-1 ${'bc' in item ? item.bc : ''}`}>
                    {item.label}
                  </div>
                )}
                
                <div className="flex gap-1">
                  {isEditing ? (
                    <button 
                      onClick={() => saveEdit(actualIndex, item.id)}
                      className="p-2 text-green hover:bg-green/10 rounded-xl transition-all"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => startEditing(item.id || actualIndex.toString(), item.label)}
                      className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleRemove(actualIndex, item.id)}
                    className="p-2 text-red/60 hover:text-red hover:bg-red/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {paginatedData.length === 0 && (
            <div className="py-8 text-center text-sm font-bold text-text-mid">
              Chưa có dữ liệu nào.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-rose/5 pt-8 mb-10">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-black text-text-mid uppercase tracking-[0.15em] whitespace-nowrap">Hiển thị</span>
          <select 
            className="h-10 text-[14px] font-black text-rose bg-rose/5 border-2 border-rose/10 px-4 rounded-xl outline-none cursor-pointer focus:bg-white focus:border-rose/30 transition-all shadow-sm"
            value={perPage} 
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10 dòng</option>
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
          </select>
        </div>
        
        {data.length > perPage && (
          <div className="sm:ml-auto">
            <Pagination
              totalItems={data.length}
              itemsPerPage={perPage}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
