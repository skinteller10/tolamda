/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  User 
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  getDoc,
  query, 
  limit, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { auth, db, storage, OperationType, handleFirestoreError } from './lib/firebase';
import { Restaurant, Rating, DEFAULT_RATINGS, DEFAULT_CITIES, DEFAULT_CITIES_DULICH, DEFAULT_TYPES, DEFAULT_FORMS, GALLERY_TYPES, SKIN_TYPES, SKIN_ISSUES } from './types';
import { cn } from './lib/utils';
import Header from './components/Header';
import FilterSection from './components/FilterSection';
import RestaurantCard from './components/RestaurantCard';
import Pagination from './components/Pagination';
import BottomNav from './components/BottomNav';
import SearchOverlay from './components/SearchOverlay';
import RestaurantForm, { compressImage } from './components/RestaurantForm';
import FilterManager from './components/FilterManager';
import CompressionManager from './components/CompressionManager';
import GalleryCard from './components/GalleryCard';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit3, Trash2, ArrowLeft, Settings, Zap, Sparkles } from 'lucide-react';

const ADMIN_EMAIL = 'thaild@gmail.com';

interface CompressionSettings {
  maxWidth: number;
  quality: number;
  enabledCategories: ('to-an' | 'to-chup' | 'to-du-lich')[];
}

export default function App() {
  // State
  const [view, setView] = useState<'home' | 'login' | 'admin' | 'ratings' | 'filters' | 'compression' | 'to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da'>('to-an');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [ratings, setRatings] = useState<Rating[]>(DEFAULT_RATINGS);
  const [citiesList, setCitiesList] = useState(DEFAULT_CITIES);
  const [citiesListDuLich, setCitiesListDuLich] = useState(DEFAULT_CITIES_DULICH);
  const [typesList, setTypesList] = useState(DEFAULT_TYPES);
  const [formsList, setFormsList] = useState(DEFAULT_FORMS);
  
  // Skin Care Specific Lists
  const [skinTypesList, setSkinTypesList] = useState(SKIN_TYPES);
  const [skinIssuesList, setSkinIssuesList] = useState(SKIN_ISSUES);
  
  // Gallery Specific Lists
  const [galleryTypesList, setGalleryTypesList] = useState(GALLERY_TYPES);
  
  // Compression Settings
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>(() => {
    const saved = localStorage.getItem('compressionSettings');
    const defaultSettings: CompressionSettings = { maxWidth: 1600, quality: 80, enabledCategories: ['to-an', 'to-chup', 'to-du-lich'] };
    if (!saved) return defaultSettings;
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('compressionSettings', JSON.stringify(compressionSettings));
  }, [compressionSettings]);
  
  // Filters
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [selectedRatings, setSelectedRatings] = useState<Set<number>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [openNowMode, setOpenNowMode] = useState(false);
  const [page, setPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [currentTime, setCurrentTime] = useState('');
  const [adminCategory, setAdminCategory] = useState<'to-an' | 'to-chup' | 'to-du-lich' | 'to-lam-da'>('to-an');

  // UI Overlays
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'restaurants'), limit(500));
        let snap;
        try {
          snap = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'restaurants');
          return;
        }

        const data: Restaurant[] = [];
        snap.forEach((doc) => {
          if (doc.id !== 'settings_filters' && doc.id !== 'settings_gallery') {
            data.push(doc.data() as Restaurant);
          }
        });
        setRestaurants(data);
        
        // Fetch Settings
        try {
          const settingsSnap = await getDoc(doc(db, 'restaurants', 'settings_filters'));
          if (settingsSnap.exists()) {
            const s = settingsSnap.data();
            if (s.cities) setCitiesList(s.cities);
            if (s.citiesDuLich) setCitiesListDuLich(s.citiesDuLich);
            if (s.types) setTypesList(s.types);
            if (s.forms) setFormsList(s.forms);
            if (s.ratings) setRatings(s.ratings);
            if (s.skinTypes) setSkinTypesList(s.skinTypes);
            if (s.skinIssues) setSkinIssuesList(s.skinIssues);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'restaurants/settings_filters');
        }

        // Fetch Gallery Settings
        try {
          const gallerySnap = await getDoc(doc(db, 'restaurants', 'settings_gallery'));
          if (gallerySnap.exists()) {
            const s = gallerySnap.data();
            if (s.types) setGalleryTypesList(s.types);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'restaurants/settings_gallery');
        }

        setFiltersLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!filtersLoaded || !user) return;
    const timeoutId = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'restaurants', 'settings_filters'), {
          cities: citiesList,
          types: typesList,
          forms: formsList,
          ratings: ratings,
          skinTypes: skinTypesList,
          skinIssues: skinIssuesList,
          isSettingsMap: true
        }, { merge: true });
      } catch (err) {
        console.error('Error saving filters:', err);
        handleFirestoreError(err, OperationType.WRITE, 'restaurants/settings_filters');
      }

      try {
        await setDoc(doc(db, 'restaurants', 'settings_gallery'), {
          types: galleryTypesList,
          isSettingsMap: true
        }, { merge: true });
      } catch (err) {
        console.error('Error saving gallery filters:', err);
        handleFirestoreError(err, OperationType.WRITE, 'restaurants/settings_gallery');
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [citiesList, typesList, formsList, ratings, galleryTypesList, filtersLoaded, user]);

  // Timer for "Open Now"
  useEffect(() => {
    const updateTime = () => {
      const n = new Date();
      setCurrentTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helpers
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const isRestaurantOpen = (r: Restaurant, timeStr: string) => {
    if (!timeStr) return true;
    const now = parseTime(timeStr);
    
    const checkBranch = (op?: string, cl?: string) => {
      if (!op || !cl) return false;
      const o = parseTime(op);
      const c = parseTime(cl);
      return o < c ? now >= o && now <= c : now >= o || now <= c;
    };

    return checkBranch(r.open, r.close) || 
           checkBranch(r.open2, r.close2) || 
           checkBranch(r.branch2Open, r.branch2Close) || 
           checkBranch(r.branch2Open2, r.branch2Close2);
  };

  const isAdmin = useMemo(() => !!user, [user]);

  const isFiltered = useMemo(() => {
    return selectedCities.size > 0 || selectedRatings.size > 0 || selectedTypes.size > 0 || selectedForms.size > 0 || openNowMode;
  }, [selectedCities, selectedRatings, selectedTypes, selectedForms, openNowMode]);

  const isAnView = view === 'to-an' || (view === 'admin' && adminCategory === 'to-an');
  const isChupView = view === 'to-chup' || (view === 'admin' && adminCategory === 'to-chup');
  const isDuLichView = view === 'to-du-lich' || (view === 'admin' && adminCategory === 'to-du-lich');

  const filteredRestaurants = useMemo(() => {
    let d = restaurants;
    // Category filtering
    if (view === 'to-an') {
      d = d.filter(r => r.category === 'to-an' || !r.category);
    } else if (view === 'to-chup') {
      d = d.filter(r => r.category === 'to-chup');
    } else if (view === 'to-du-lich') {
      d = d.filter(r => r.category === 'to-du-lich');
    } else if (view === 'to-lam-da') {
      d = d.filter(r => r.category === 'to-lam-da');
    } else if (view === 'admin') {
      if (adminCategory === 'to-an') {
        d = d.filter(r => r.category === 'to-an' || !r.category);
      } else if (adminCategory === 'to-chup') {
        d = d.filter(r => r.category === 'to-chup');
      } else if (adminCategory === 'to-lam-da') {
        d = d.filter(r => r.category === 'to-lam-da');
      } else {
        d = d.filter(r => r.category === 'to-du-lich');
      }
    }

    if (selectedCities.size > 0) d = d.filter(r => selectedCities.has(r.city));
    if (selectedRatings.size > 0) d = d.filter(r => selectedRatings.has(r.rating) || selectedRatings.has(Number(r.rating)));
    if (selectedTypes.size > 0) d = d.filter(r => selectedTypes.has(r.type || (isChupView ? 'máy film' : 'cafe')));
    if (selectedForms.size > 0) {
      if (view === 'to-lam-da' || (view === 'admin' && adminCategory === 'to-lam-da')) {
        d = d.filter(r => selectedForms.has(r.form));
      } else {
        d = d.filter(r => selectedForms.has(r.form || 'offline'));
      }
    }
    if (openNowMode && (isAnView || isDuLichView)) d = d.filter(r => isRestaurantOpen(r, currentTime));
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r => r.name.toLowerCase().includes(q) || (r.address || '').toLowerCase().includes(q));
    }
    return d;
  }, [restaurants, view, adminCategory, selectedCities, selectedRatings, selectedTypes, selectedForms, searchQuery, openNowMode, currentTime, isAnView, isChupView, isDuLichView]);

  const displayedRestaurants = useMemo(() => {
    const p = view === 'admin' ? adminPage : page;
    return filteredRestaurants.slice((p - 1) * perPage, p * perPage);
  }, [filteredRestaurants, page, adminPage, perPage, view]);

  const [loginError, setLoginError] = useState<string | null>(null);

  // Actions
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim();
    const password = (formData.get('password') as string).trim();
    
    const finalEmail = email.includes('@') ? email : `${email}@local.com`;

    try {
      await signInWithEmailAndPassword(auth, finalEmail, password);
      setView('home');
    } catch (error: any) {
      console.error('Đăng nhập thất bại', error);
      if (error.code === 'auth/operation-not-allowed') {
        setLoginError('Lỗi: Phương thức đăng nhập bằng Email/Mật khẩu chưa được bật trong Firebase Console. Vui lòng kiểm tra tab "Sign-in method".');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setLoginError('Tài khoản hoặc mật khẩu không chính xác.');
      } else {
        setLoginError(`Lỗi đăng nhập: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  const handleSaveRestaurant = async (data: Partial<Restaurant>, finalImages: (string | File | Blob)[], onProgress?: (msg: string) => void) => {
    if (!isAdmin) return;

    try {
      const id = editingRestaurant?.id || String(Date.now());
      let newImgUrl = '';
      let newImgPath = '';
      const newExtraUrls: string[] = [];
      const newExtraPaths: string[] = [];

      onProgress?.(`Đang xử lý ${finalImages.filter(x => typeof x !== 'string').length} ảnh...`);

      // Khởi tạo hàm fileToBase64
      const fileToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      // Process images in parallel
      const uploadPromises = finalImages.map(async (item, i) => {
        if (typeof item === 'string') {
          return { type: 'existing', url: item, index: i };
        } else {
          try {
            console.log(`Đang chuyển ảnh ${i} sang base64...`);
            const base64Url = await fileToBase64(item as File | Blob);
            console.log(`Chuyển ảnh ${i} thành công.`);
            const path = '';
            return { type: 'new', url: base64Url, path, index: i };
          } catch (err) {
            console.error(`Xử lý ảnh ${i} thất bại:`, err);
            throw new Error(`Xử lý ảnh ${i} thất bại: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // Sort and assign results
      results.sort((a, b) => a.index - b.index);
      results.forEach((res, i) => {
        if (res.type === 'existing') {
          const item = res.url;
          if (i === 0) {
            newImgUrl = item;
            if (item === editingRestaurant?.img) newImgPath = editingRestaurant.imgPath || '';
            else {
              const idx = (editingRestaurant?.images || []).indexOf(item);
              if (idx >= 0 && editingRestaurant?.imagesPaths) newImgPath = editingRestaurant.imagesPaths[idx] || '';
            }
          } else {
            newExtraUrls.push(item);
            if (item === editingRestaurant?.img) {
              if (editingRestaurant.imgPath) newExtraPaths.push(editingRestaurant.imgPath);
            } else {
              const idx = (editingRestaurant?.images || []).indexOf(item);
              if (idx >= 0 && editingRestaurant?.imagesPaths) newExtraPaths.push(editingRestaurant.imagesPaths[idx] || '');
            }
          }
        } else {
          if (i === 0) {
            newImgUrl = res.url;
            newImgPath = res.path!;
          } else {
            newExtraUrls.push(res.url);
            newExtraPaths.push(res.path!);
          }
        }
      });

      onProgress?.('Đang xóa ảnh cũ...');
      const allNewPaths = [newImgPath, ...newExtraPaths].filter(Boolean);
      const allOldPaths = [editingRestaurant?.imgPath, ...(editingRestaurant?.imagesPaths || [])].filter(Boolean);
      const pathsToDelete = allOldPaths.filter(p => !allNewPaths.includes(p));
      
      const deletePromises = pathsToDelete.map(async (p) => {
        if (p) {
          try { 
            console.log(`Xóa ảnh cũ: ${p}...`);
            await deleteObject(storageRef(storage, p)); 
            console.log(`Xóa ảnh cũ ${p} thành công.`);
          } catch (e) {
            console.warn(`Không thể xóa ảnh cũ ${p}:`, e);
          }
        }
      });
      await Promise.all(deletePromises);

      const restToSave: any = {
        ...data,
        id,
        name: data.name || 'Quán chưa đặt tên',
        city: data.city || 'hanoi',
        type: data.type || 'cafe',
        form: data.form || 'offline',
        address: data.address || '',
        open: data.open || '08:00',
        close: data.close || '22:00',
        open2: data.open2 || '',
        close2: data.close2 || '',
        branch2Address: data.branch2Address || '',
        branch2Open: data.branch2Open || '',
        branch2Close: data.branch2Close || '',
        branch2Open2: data.branch2Open2 || '',
        branch2Close2: data.branch2Close2 || '',
        rating: data.rating || 0,
        info: data.info || '',
        img: newImgUrl,
        imgPath: newImgPath,
        images: newExtraUrls,
        imagesPaths: newExtraPaths,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || null,
        ...(editingRestaurant ? {} : { createdAt: serverTimestamp(), createdBy: user?.email || null })
      };
      
      onProgress?.('Đang lưu vào Firestore...');
      console.log('Đang lưu thông tin quán vào Firestore...');
      await setDoc(doc(db, 'restaurants', String(id)), restToSave, { merge: true });
      console.log('Lưu vào Firestore thành công.');
      
      if (editingRestaurant) {
        setRestaurants(prev => prev.map(r => r.id === id ? restToSave as Restaurant : r));
      } else {
        setRestaurants(prev => [restToSave as Restaurant, ...prev]);
      }
    } catch (error) {
      console.error('Lỗi trong handleSaveRestaurant:', error);
      handleFirestoreError(error, OperationType.WRITE, 'restaurants');
    }
  };

  const handleDeleteRestaurant = async (id: string | number) => {
    if (!isAdmin) return;
    try {
      const r = restaurants.find(x => x.id === id);
      await deleteDoc(doc(db, 'restaurants', String(id)));
      if (r?.imgPath) {
        try { await deleteObject(storageRef(storage, r.imgPath)); } catch (e) {}
      }
      setRestaurants(prev => prev.filter(x => x.id !== id));
      setRestaurantToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'restaurants');
    }
  };

  const handleSaveFilters = async () => {
    try {
      await setDoc(doc(db, 'restaurants', 'settings_filters'), {
        cities: citiesList,
        citiesDuLich: citiesListDuLich,
        types: typesList,
        forms: formsList,
        ratings: ratings
      });
      await setDoc(doc(db, 'restaurants', 'settings_gallery'), {
        types: galleryTypesList
      });
      alert('Đã lưu các thuộc tính bộ lọc thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu bộ lọc!');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="font-serif text-2xl italic text-rose-dark animate-pulse">
          Tớ làm da...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center pb-24 bg-bg">
      {/* Header */}
      <Header
        title={
          view === 'to-chup' ? 'Tớ chụp' : 
          view === 'to-an' ? 'Tớ ăn' : 
          view === 'to-du-lich' ? 'Tớ du lịch' : 
          view === 'to-lam-da' ? 'Tớ làm da' : 
          'Tớ làm da'
        }
        showAdminButton={isAdmin}
        onAdminClick={() => setView('admin')}
        onSearchClick={() => setIsSearchOpen(true)}
        isLoggedIn={!!user}
        onLoginClick={() => setView('login')}
        onLogoutClick={() => signOut(auth)}
      />

      {/* Main Content */}
      <main className="w-full max-w-[720px] pt-4 px-0">
        {(view === 'to-an' || view === 'to-chup' || view === 'to-du-lich' || view === 'to-lam-da') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FilterSection
              mode={view}
              selectedCities={selectedCities}
              citiesList={view === 'to-du-lich' ? citiesListDuLich : citiesList}
              onCityToggle={(city) => {
                const next = new Set(selectedCities);
                if (next.has(city)) next.delete(city); else next.add(city);
                setSelectedCities(next);
                setPage(1);
              }}
              selectedRatings={selectedRatings}
              onRatingToggle={(ratingIndex) => {
                const next = new Set(selectedRatings);
                if (next.has(ratingIndex)) next.delete(ratingIndex); else next.add(ratingIndex);
                setSelectedRatings(next);
                setPage(1);
              }}
              selectedTypes={selectedTypes}
              onTypeToggle={(type) => {
                const next = new Set(selectedTypes);
                if (next.has(type)) next.delete(type); else next.add(type);
                setSelectedTypes(next);
                setPage(1);
              }}
              selectedForms={selectedForms}
              onFormToggle={(form) => {
                const next = new Set(selectedForms);
                if (next.has(form)) next.delete(form); else next.add(form);
                setSelectedForms(next);
                setPage(1);
              }}
              openNowMode={openNowMode}
              onOpenNowToggle={() => {
                setOpenNowMode(!openNowMode);
                setPage(1);
              }}
              onClearAll={() => {
                setSelectedCities(new Set());
                setSelectedRatings(new Set());
                setSelectedTypes(new Set());
                setSelectedForms(new Set());
                setSearchQuery('');
                setPage(1);
              }}
              currentTime={currentTime}
              hasSearchQuery={searchQuery.length > 0}
              typesList={view === 'to-chup' ? galleryTypesList : (view === 'to-lam-da' ? skinTypesList : typesList)}
              formsList={view === 'to-lam-da' ? skinIssuesList : formsList}
              ratingsList={ratings}
            />

            <div className="flex flex-col min-h-[60vh]">
              <div className={cn("mt-4 flex flex-col px-5", (view === 'to-chup' || view === 'to-du-lich') ? "gap-3" : "gap-6")}>
                {(isFiltered || searchQuery) && (
                  <div className="flex flex-col items-center gap-2 mb-2 px-5">
                    <div className="h-[2px] w-12 bg-rose/20" />
                    <span className="text-[12px] font-bold text-rose-mid uppercase tracking-[0.2em]">
                      {searchQuery ? `Kết quả tìm kiếm: ${filteredRestaurants.length}` : `Tìm thấy ${filteredRestaurants.length} kết quả`}
                    </span>
                  </div>
                )}
                {displayedRestaurants.map((r: Restaurant, i: number) => (
                  (view === 'to-chup' || view === 'to-du-lich') ? (
                    <GalleryCard
                      key={r.id.toString()}
                      restaurant={r}
                      index={(page - 1) * perPage + i}
                      mode={view as any}
                    />
                  ) : (
                    <RestaurantCard
                      key={r.id.toString()}
                      restaurant={r}
                      ratingObj={ratings[r.rating] || ratings[0]}
                      index={(page - 1) * perPage + i}
                      isOpen={isRestaurantOpen(r, currentTime)}
                      currentTime={currentTime}
                      isSkinCare={view === 'to-lam-da'}
                    />
                  )
                ))}
                {displayedRestaurants.length === 0 && (
                  <div className="py-20 text-center text-text-light font-bold">
                    Không tìm thấy kết quả nào 😔
                  </div>
                )}
              </div>
            </div>

            <div className="mb-32 mt-20 px-5 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-rose/5 pt-10">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-black text-text-mid uppercase tracking-[0.15em] whitespace-nowrap">
                  {(view === 'to-chup' || view === 'to-du-lich') ? 'Số album/trang' : 'Số kết quả/trang'}
                </span>
                <select 
                  value={perPage}
                  onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="h-12 text-[14px] font-black text-rose bg-rose/5 border-2 border-rose/10 px-5 rounded-xl outline-none cursor-pointer focus:bg-white focus:border-rose/30 transition-all shadow-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="sm:ml-auto">
                <Pagination
                  totalItems={filteredRestaurants.length}
                  itemsPerPage={perPage}
                  currentPage={page}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </motion.div>
        )}

        {view === 'login' && (
          <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#FFF5F5] p-5">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-[400px] rounded-[32px] bg-white p-12 shadow-2xl shadow-rose/10"
            >
              <div className="mb-3 text-center font-serif text-3xl font-bold italic text-rose-dark">Tớ làm da</div>
              <div className="mb-10 text-center text-[14px] font-extrabold uppercase tracking-widest text-text-light">Đăng nhập Quản trị</div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                {loginError && (
                  <div className="rounded-xl bg-red/10 p-4 text-[13px] font-bold text-red">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2.5">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Tên đăng nhập</label>
                  <input name="email" type="text" className="fi" placeholder="thaild@local.com" required />
                </div>
                <div className="space-y-2.5">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Mật khẩu</label>
                  <input name="password" type="password" className="fi" placeholder="M8nchester" required />
                </div>
                <button type="submit" className="w-full rounded-[18px] bg-gradient-to-br from-rose to-rose-dark p-4.5 text-base font-extrabold text-white shadow-xl shadow-rose/20 active:scale-95">
                  ĐĂNG NHẬP
                </button>
              </form>

              <button onClick={() => setView('home')} className="mt-7 w-full text-center text-sm font-bold text-text-light">
                Quay lại trang chủ
              </button>
            </motion.div>
          </div>
        )}

        {view === 'admin' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5">
            <div className="flex flex-col gap-5 py-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  {/* Category Selector replaces "Bảng Quản lý" */}
                  <div className="flex items-center gap-3 p-1 rounded-[20px] bg-rose/5 border border-rose/10 w-fit">
                    <button 
                      onClick={() => { setAdminCategory('to-an'); setAdminPage(1); }}
                      className={cn(
                        "px-6 py-2 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all",
                        adminCategory === 'to-an' ? "bg-white text-rose shadow-sm" : "text-text-light hover:text-rose-mid"
                      )}
                    >
                      Tớ ăn
                    </button>
                    <button 
                      onClick={() => { setAdminCategory('to-lam-da'); setAdminPage(1); }}
                      className={cn(
                        "px-6 py-2 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all",
                        adminCategory === 'to-lam-da' ? "bg-white text-rose shadow-sm" : "text-text-light hover:text-rose-mid"
                      )}
                    >
                      Tớ làm da
                    </button>
                    <button 
                      onClick={() => { setAdminCategory('to-chup'); setAdminPage(1); }}
                      className={cn(
                        "px-6 py-2 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all",
                        adminCategory === 'to-chup' ? "bg-white text-rose shadow-sm" : "text-text-light hover:text-rose-mid"
                      )}
                    >
                      Tớ chụp
                    </button>
                    <button 
                      onClick={() => { setAdminCategory('to-du-lich'); setAdminPage(1); }}
                      className={cn(
                        "px-6 py-2 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all",
                        adminCategory === 'to-du-lich' ? "bg-white text-rose shadow-sm" : "text-text-light hover:text-rose-mid"
                      )}
                    >
                      Tớ du lịch
                    </button>
                  </div>

                  <div className="flex gap-2.5">
                    <button 
                      onClick={() => setView('compression')}
                      className="flex h-10 w-10 sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-indigo-500 sm:px-4 text-[13px] font-extrabold text-white shadow shadow-indigo-500/20 transition-all active:scale-95"
                      title="Quản lý nén"
                    >
                      <Zap size={16} fill="currentColor" />
                      <span className="hidden sm:inline">Quản lý nén</span>
                    </button>
                    <button 
                      onClick={() => setView('filters')}
                      className="flex h-10 w-10 sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-orange-500 sm:px-4 text-[13px] font-extrabold text-white shadow shadow-orange-500/20 transition-all active:scale-95"
                      title="Quản lý bộ lọc"
                    >
                      <Settings size={16} />
                      <span className="hidden sm:inline">Quản lý bộ lọc</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button 
                    onClick={() => {
                      setEditingRestaurant(null);
                      setIsFormOpen(true);
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[22px] bg-green px-6 text-[15px] font-black uppercase tracking-widest text-white shadow shadow-green/20 transition-all active:scale-95"
                  >
                    <Plus size={20} strokeWidth={3} />
                    {adminCategory === 'to-an' ? "Thêm quán" : adminCategory === 'to-chup' ? "Thêm Bộ ảnh" : adminCategory === 'to-lam-da' ? "Thêm bài viết" : "Thêm chuyến đi"}
                  </button>
                </div>
              </div>
              
              <div className="-mx-5 -mb-4">
                <FilterSection
                      mode={adminCategory}
                      selectedCities={selectedCities}
                      onCityToggle={(city) => {
                        const next = new Set(selectedCities);
                        if (next.has(city)) next.delete(city); else next.add(city);
                        setSelectedCities(next);
                        setAdminPage(1);
                      }}
                      selectedRatings={selectedRatings}
                      onRatingToggle={(ratingIndex) => {
                        const next = new Set(selectedRatings);
                        if (next.has(ratingIndex)) next.delete(ratingIndex); else next.add(ratingIndex);
                        setSelectedRatings(next);
                        setAdminPage(1);
                      }}
                      selectedTypes={selectedTypes}
                      onTypeToggle={(type) => {
                        const next = new Set(selectedTypes);
                        if (next.has(type)) next.delete(type); else next.add(type);
                        setSelectedTypes(next);
                        setAdminPage(1);
                      }}
                      selectedForms={selectedForms}
                      onFormToggle={(form) => {
                        const next = new Set(selectedForms);
                        if (next.has(form)) next.delete(form); else next.add(form);
                        setSelectedForms(next);
                        setAdminPage(1);
                      }}
                      openNowMode={openNowMode}
                      onOpenNowToggle={() => {
                        setOpenNowMode(!openNowMode);
                        setAdminPage(1);
                      }}
                      onClearAll={() => {
                        setSelectedCities(new Set());
                        setSelectedRatings(new Set());
                        setSelectedTypes(new Set());
                        setSelectedForms(new Set());
                        setSearchQuery('');
                        setAdminPage(1);
                      }}
                      currentTime={currentTime}
                      hasSearchQuery={searchQuery.length > 0}
                      citiesList={adminCategory === 'to-du-lich' ? citiesListDuLich : citiesList}
                      typesList={adminCategory === 'to-chup' ? galleryTypesList : (adminCategory === 'to-lam-da' ? skinTypesList : typesList)}
                      formsList={adminCategory === 'to-lam-da' ? skinIssuesList : formsList}
                      ratingsList={ratings}
                    />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {(isFiltered || searchQuery) && (
                <div className="flex flex-col items-center gap-2 mb-2">
                   <div className="h-[2px] w-12 bg-rose/20" />
                   <span className="text-[12px] font-bold text-rose-mid uppercase tracking-[0.2em]">
                     {searchQuery ? `Kết quả tìm kiếm: ${filteredRestaurants.length}` : `Tìm thấy ${filteredRestaurants.length} kết quả`}
                   </span>
                </div>
              )}
              <div className={cn("flex flex-col min-h-[60vh] -mx-5 px-5", (adminCategory === 'to-chup' || adminCategory === 'to-du-lich') ? "gap-4" : "gap-6")}>
                {displayedRestaurants.map((r, i) => (
                (adminCategory === 'to-an' || adminCategory === 'to-lam-da') ? (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r as Restaurant}
                    ratingObj={ratings[r.rating] || ratings[0]}
                    index={(adminPage - 1) * perPage + i}
                    isOpen={isRestaurantOpen(r as Restaurant, currentTime)}
                    currentTime={currentTime}
                    isSkinCare={adminCategory === 'to-lam-da'}
                    actions={
                      <>
                        <button 
                          onClick={() => {
                            setEditingRestaurant(r);
                            setIsFormOpen(true);
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green-dark"
                        >
                          <Edit3 size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => setRestaurantToDelete(r as Restaurant)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red/10 text-red"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </>
                    }
                  />
                ) : (
                  <div key={r.id} className="relative">
                    <GalleryCard
                      restaurant={r as Restaurant}
                      index={(adminPage - 1) * perPage + i}
                      mode={adminCategory as any}
                    />
                    <div className="absolute top-4 right-5 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingRestaurant(r);
                          setIsFormOpen(true);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/90 backdrop-blur text-white shadow-lg"
                      >
                        <Edit3 size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => setRestaurantToDelete(r as Restaurant)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red/90 backdrop-blur text-white shadow-lg"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )
              ))}
              </div>
            </div>

            <div className="mb-32 mt-20 px-5 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-rose/5 pt-10">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-black text-text-mid uppercase tracking-[0.15em] whitespace-nowrap">
                  {adminCategory === 'to-chup' ? 'Số album/trang' : 'Số quán/trang'}
                </span>
                <select 
                  value={perPage}
                  onChange={e => { setPerPage(Number(e.target.value)); setAdminPage(1); }}
                  className="h-12 text-[14px] font-black text-rose bg-rose/5 border-2 border-rose/10 px-5 rounded-xl outline-none cursor-pointer focus:bg-white focus:border-rose/30 transition-all shadow-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="sm:ml-auto">
                <Pagination
                  totalItems={filteredRestaurants.length}
                  itemsPerPage={perPage}
                  currentPage={adminPage}
                  onPageChange={setAdminPage}
                />
              </div>
            </div>
          </motion.div>
        )}

        {view === 'filters' && (
          <div className="px-5">
            <FilterManager 
              onBack={() => { handleSaveFilters(); setView('admin'); }}
              cities={citiesList} setCities={setCitiesList}
              citiesDuLich={citiesListDuLich} setCitiesDuLich={setCitiesListDuLich}
              types={typesList} setTypes={setTypesList}
              forms={formsList} setForms={setFormsList}
              ratings={ratings} setRatings={setRatings}
              galleryTypes={galleryTypesList} setGalleryTypes={setGalleryTypesList}
              skinTypes={skinTypesList} setSkinTypes={setSkinTypesList}
              skinIssues={skinIssuesList} setSkinIssues={setSkinIssuesList}
            />
          </div>
        )}
        {view === 'compression' && (
          <div className="-mt-4">
            <CompressionManager 
              settings={compressionSettings}
              onSave={(newSettings) => {
                setCompressionSettings(newSettings);
                setView('admin');
              }}
              onBack={() => setView('admin')}
            />
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav
        view={view}
        onNavClick={setView}
        isLoggedIn={!!user}
        onLogout={handleLogout}
      />

      {/* Overlays */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(q) => {
          setSearchQuery(q);
          setPage(1);
          setAdminPage(1);
        }}
        initialQuery={searchQuery}
      />

      <RestaurantForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRestaurant(null);
        }}
        onSave={handleSaveRestaurant}
        editingRestaurant={editingRestaurant}
        ratings={ratings}
        citiesList={adminCategory === 'to-du-lich' ? citiesListDuLich : citiesList}
        typesList={adminCategory === 'to-an' ? typesList : (adminCategory === 'to-lam-da' ? skinTypesList : galleryTypesList)}
        formsList={adminCategory === 'to-lam-da' ? skinIssuesList : formsList}
        compressionSettings={compressionSettings}
        mode={adminCategory}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {restaurantToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-2 text-xl font-bold text-text">Xác nhận xoá</h3>
              <p className="mb-6 text-sm text-text-mid">
                Bạn có chắc chắn muốn xoá quán <span className="font-bold text-text-dark">{restaurantToDelete.name}</span> không? Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setRestaurantToDelete(null)}
                  className="flex-1 rounded-xl bg-bg px-4 py-3 text-sm font-bold text-text-mid active:scale-95 transition-all"
                >
                  Huỷ bỏ
                </button>
                <button
                  onClick={() => handleDeleteRestaurant(restaurantToDelete.id)}
                  className="flex-1 rounded-xl bg-red px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red/20 active:scale-95 transition-all"
                >
                  Xoá quán
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

