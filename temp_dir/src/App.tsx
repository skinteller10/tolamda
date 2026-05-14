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
import { Restaurant, Rating, City, DEFAULT_RATINGS, CITIES } from './types';
import Header from './components/Header';
import FilterSection from './components/FilterSection';
import RestaurantCard from './components/RestaurantCard';
import Pagination from './components/Pagination';
import BottomNav from './components/BottomNav';
import SearchOverlay from './components/SearchOverlay';
import RestaurantForm from './components/RestaurantForm';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit3, Trash2, ArrowLeft } from 'lucide-react';

const PER_PAGE = 5;
const ADMIN_EMAIL = 'thaild@app.local';

export default function App() {
  // State
  const [view, setView] = useState<'home' | 'login' | 'admin' | 'ratings'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [ratings, setRatings] = useState<Rating[]>(DEFAULT_RATINGS);
  
  // Filters
  const [selectedCities, setSelectedCities] = useState<Set<City>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [openNowMode, setOpenNowMode] = useState(false);
  const [page, setPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [currentTime, setCurrentTime] = useState('');

  // UI Overlays
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

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
        const q = query(collection(db, 'restaurants'), orderBy('id', 'desc'), limit(500));
        const snap = await getDocs(q);
        const data: Restaurant[] = [];
        snap.forEach((doc) => {
          data.push(doc.data() as Restaurant);
        });
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };
    fetchData();
  }, []);

  // Timer for "Open Now"
  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setCurrentTime(`${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helpers
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const isRestaurantOpen = (r: Restaurant) => {
    const n = new Date();
    const now = n.getHours() * 60 + n.getMinutes();
    const o = parseTime(r.open);
    const c = parseTime(r.close);
    return o < c ? now >= o && now < c : now >= o || now < c;
  };

  const isAdmin = useMemo(() => !!user, [user]);

  const filteredRestaurants = useMemo(() => {
    let d = restaurants;
    if (selectedCities.size > 0) d = d.filter(r => selectedCities.has(r.city));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q));
    }
    if (openNowMode) d = d.filter(isRestaurantOpen);
    return d;
  }, [restaurants, selectedCities, searchQuery, openNowMode]);

  const displayedRestaurants = useMemo(() => {
    const p = view === 'home' ? page : adminPage;
    return filteredRestaurants.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  }, [filteredRestaurants, page, adminPage, view]);

  // Actions
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Normalize email if needed
    const finalEmail = email.includes('@') ? email : `${email}@app.local`;

    try {
      await signInWithEmailAndPassword(auth, finalEmail, password);
      setView('home');
    } catch (error) {
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  const handleSaveRestaurant = async (data: Partial<Restaurant>, imageFile?: File) => {
    if (!isAdmin) return;

    try {
      const id = editingRestaurant?.id || String(Date.now());
      let imageUrl = data.img;
      let imagePath = editingRestaurant?.imgPath;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `restaurants/${id}-${Date.now()}.${ext}`;
        const r = storageRef(storage, path);
        await uploadBytes(r, imageFile);
        imageUrl = await getDownloadURL(r);
        
        // Delete old image
        if (imagePath) {
          try { await deleteObject(storageRef(storage, imagePath)); } catch (e) {}
        }
        imagePath = path;
      }

      const restToSave: Restaurant = {
        id,
        name: data.name || 'Quán chưa đặt tên',
        city: data.city || 'hanoi',
        address: data.address || '',
        open: data.open || '08:00',
        close: data.close || '22:00',
        rating: data.rating || 0,
        info: data.info || '',
        img: imageUrl || 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300',
        imgPath: imagePath,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || null,
        ...(editingRestaurant ? {} : { createdAt: serverTimestamp(), createdBy: user?.email || null })
      };

      await setDoc(doc(db, 'restaurants', String(id)), restToSave, { merge: true });
      
      // Update local state
      if (editingRestaurant) {
        setRestaurants(prev => prev.map(r => r.id === id ? restToSave : r));
      } else {
        setRestaurants(prev => [restToSave, ...prev]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'restaurants');
    }
  };

  const handleDeleteRestaurant = async (id: string | number) => {
    if (!isAdmin || !confirm('Bạn có chắc chắn muốn xoá quán này?')) return;

    try {
      const r = restaurants.find(x => x.id === id);
      await deleteDoc(doc(db, 'restaurants', String(id)));
      if (r?.imgPath) {
        try { await deleteObject(storageRef(storage, r.imgPath)); } catch (e) {}
      }
      setRestaurants(prev => prev.filter(x => x.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'restaurants');
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
        title="Tớ làm da"
        showAdminButton={isAdmin && view === 'home'}
        onAdminClick={() => setView('admin')}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Main Content */}
      <main className="w-full max-w-[720px] pt-4">
        {view === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FilterSection
              selectedCities={selectedCities}
              onCityToggle={(city) => {
                const next = new Set(selectedCities);
                if (next.has(city)) next.delete(city); else next.add(city);
                setSelectedCities(next);
                setPage(1);
              }}
              openNowMode={openNowMode}
              onOpenNowToggle={() => {
                setOpenNowMode(!openNowMode);
                setPage(1);
              }}
              onClearAll={() => {
                setSelectedCities(new Set());
                setSearchQuery('');
                setPage(1);
              }}
              currentTime={currentTime}
              hasSearchQuery={searchQuery.length > 0}
            />

            <div className="mt-8 flex flex-col gap-4 px-5">
              {displayedRestaurants.map((r: Restaurant, i: number) => (
                <RestaurantCard
                  key={r.id.toString()}
                  restaurant={r}
                  ratingObj={ratings[r.rating] || ratings[0]}
                  index={(page - 1) * PER_PAGE + i}
                  isOpen={isRestaurantOpen(r)}
                />
              ))}
              {displayedRestaurants.length === 0 && (
                <div className="py-20 text-center text-text-light font-bold">
                  Không tìm thấy quán ăn nào 😔
                </div>
              )}
            </div>

            <Pagination
              totalItems={filteredRestaurants.length}
              itemsPerPage={PER_PAGE}
              currentPage={page}
              onPageChange={setPage}
            />
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
                <div className="space-y-2.5">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Tên đăng nhập</label>
                  <input name="email" type="text" className="fi" placeholder="admin" required />
                </div>
                <div className="space-y-2.5">
                  <label className="pl-1 text-[12px] font-extrabold uppercase tracking-widest text-text-mid">Mật khẩu</label>
                  <input name="password" type="password" className="fi" placeholder="••••••••" required />
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
            <div className="flex flex-col gap-4 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-bold text-rose-dark">Bảng Quản lý</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setView('ratings')}
                    className="flex h-10 items-center justify-center rounded-xl bg-text-mid px-4 text-[13px] font-extrabold text-white shadow shadow-text-mid/20 transition-all active:scale-95"
                  >
                    Đánh giá
                  </button>
                  <button 
                    onClick={() => {
                      setEditingRestaurant(null);
                      setIsFormOpen(true);
                    }}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-green px-4 text-[13px] font-extrabold text-white shadow shadow-green/20 transition-all active:scale-95"
                  >
                    <Plus size={16} strokeWidth={3} />
                    Thêm quán
                  </button>
                </div>
              </div>
              
              <FilterSection
                selectedCities={selectedCities}
                onCityToggle={(city) => {
                  const next = new Set(selectedCities);
                  if (next.has(city)) next.delete(city); else next.add(city);
                  setSelectedCities(next);
                  setAdminPage(1);
                }}
                openNowMode={openNowMode}
                onOpenNowToggle={() => {
                  setOpenNowMode(!openNowMode);
                  setAdminPage(1);
                }}
                onClearAll={() => {
                  setSelectedCities(new Set());
                  setSearchQuery('');
                  setAdminPage(1);
                }}
                currentTime={currentTime}
                hasSearchQuery={searchQuery.length > 0}
              />
            </div>

            <div className="mt-8 flex flex-col gap-4 px-5">
              {displayedRestaurants.map((r, i) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r as Restaurant}
                  ratingObj={ratings[r.rating] || ratings[0]}
                  index={(adminPage - 1) * PER_PAGE + i}
                  isOpen={isRestaurantOpen(r as Restaurant)}
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
                        onClick={() => handleDeleteRestaurant(r.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red/10 text-red"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </>
                  }
                />
              ))}
            </div>

            <Pagination
              totalItems={filteredRestaurants.length}
              itemsPerPage={PER_PAGE}
              currentPage={adminPage}
              onPageChange={setAdminPage}
            />
          </motion.div>
        )}

        {view === 'ratings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-6">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-rose-dark">Quản lý Đánh giá</h2>
              <button 
                onClick={() => setView('admin')}
                className="flex items-center gap-1 text-[14px] font-bold text-text-mid"
              >
                <ArrowLeft size={18} />
                Quay lại
              </button>
            </div>

            <div className="space-y-4">
              {ratings.map((r, i) => (
                <div key={i} className="flex items-center gap-4 rounded-3xl border border-rose/15 bg-white p-4 shadow-card">
                  <div className="w-7 text-center font-extrabold text-text-light">{i + 1}</div>
                  <input
                    value={r.label}
                    onChange={(e) => {
                      const next = [...ratings];
                      next[i].label = e.target.value;
                      setRatings(next);
                    }}
                    className={`flex-1 rounded-xl border-none p-3 text-base font-bold outline-none ${r.bc}`}
                  />
                  <span className={`badge ${r.bc}`}>Xem trước</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button 
                onClick={() => {
                  // In this version we just save to local state and it persists via DB in a real app
                  // Here we just go back as we didn't implement a ratings collection yet
                  setView('admin');
                }}
                className="w-full rounded-[18px] bg-rose p-4.5 text-base font-extrabold text-white shadow-xl shadow-rose/20 active:scale-95"
              >
                Lưu tất cả thay đổi
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav
        activeView={view}
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
      />
    </div>
  );
}
