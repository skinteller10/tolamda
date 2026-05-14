<?php 
require_once 'config.php';
require_once 'header.php';
require_once 'db.php';
?>

<script type="text/babel">
    const { useState, useEffect } = React;

    function Editor() {
        const [id, setId] = useState(new URLSearchParams(window.location.search).get('id'));
        const [loading, setLoading] = useState(true);
        const [isSaving, setIsSaving] = useState(false);
        const [formData, setFormData] = useState({ name: '', info: '', category: 'to-an', images: [] });
        const [tempFiles, setTempFiles] = useState([]); // Chứa file vừa chọn nén
        const [existingImages, setExistingImages] = useState([]); // Chứa URL hiện có khi sửa

        useEffect(() => {
            const unsub = auth.onAuthStateChanged(u => {
                if (!u) window.location.href = 'admin.php';
                if (id) loadItem();
                else setLoading(false);
            });
            return () => unsub();
        }, []);

        const loadItem = async () => {
            const doc = await db.collection('restaurants').doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                setFormData(data);
                setExistingImages(data.images || []);
            }
            setLoading(false);
        };

        const handleImageChange = async (e) => {
            const files = Array.from(e.target.files);
            if (formData.category === 'to-lam-da' && (existingImages.length + tempFiles.length + files.length) > 2) {
                alert("Mục 'Tớ làm da' chỉ cho phép tối đa 2 ảnh.");
                return;
            }

            const limit = 500 * 1024; // 500KB
            const processedFiles = [];

            for (const file of files) {
                if (file.size > limit) {
                    console.log(`Đang nén file ${file.name}...`);
                    try {
                        const compressed = await imageCompression(file, {
                            maxSizeMB: 0.48, // Target 480KB
                            maxWidthOrHeight: 1600,
                            useWebWorker: true
                        });
                        if (compressed.size > limit) {
                            alert(`File ${file.name} vẫn quá 500KB sau khi nén. Hãy chọn file nhỏ hơn.`);
                            continue;
                        }
                        processedFiles.push(compressed);
                    } catch (err) {
                        console.error(err);
                        alert(`Lỗi nén ảnh ${file.name}`);
                    }
                } else {
                    processedFiles.push(file);
                }
            }
            setTempFiles([...tempFiles, ...processedFiles]);
        };

        const handleSave = async (e) => {
            e.preventDefault();
            setIsSaving(true);
            try {
                // 1. Upload ảnh mới
                const newUrls = await Promise.all(tempFiles.map(async file => {
                    const name = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
                    const ref = storage.ref().child(`restaurants/${name}`);
                    const snap = await ref.put(file);
                    return await snap.ref.getDownloadURL();
                }));

                const finalData = {
                    ...formData,
                    images: [...existingImages, ...newUrls],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (!id) {
                    finalData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await db.collection('restaurants').add(finalData);
                } else {
                    await db.collection('restaurants').doc(id).update(finalData);
                }

                window.location.href = 'admin.php';
            } catch (err) {
                alert("Lỗi: " + err.message);
                setIsSaving(false);
            }
        };

        if (loading) return <div className="p-20 text-center">Đang tải...</div>;

        return (
            <div className="max-w-2xl mx-auto p-4 md:p-12 animate-fade-in">
                <div className="flex items-center gap-4 mb-10">
                    <a href="admin.php" className="p-3 bg-white rounded-2xl shadow-sm text-rose"><i data-lucide="chevron-left"></i></a>
                    <h1 className="text-3xl font-black text-rose italic uppercase tracking-tighter">{id ? 'SỬA BÀI VIẾT' : 'THÊM MỚI'}</h1>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-rose/5 space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block ml-1">Tiêu đề bài viết</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 rounded-2xl bg-rose/5 border-none font-bold" placeholder="Nhập tiêu đề..." required />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block ml-1">Chuyên mục</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-5 rounded-2xl bg-rose/5 border-none font-bold appearance-none">
                                <option value="to-an">Tớ ăn</option>
                                <option value="to-lam-da">Tớ làm da (Tối đa 2 ảnh)</option>
                                <option value="to-chup">Tớ chụp</option>
                                <option value="to-du-lich">Tớ du lịch</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block ml-1">Nội dung</label>
                            <textarea value={formData.info} onChange={e => setFormData({...formData, info: e.target.value})} className="w-full p-5 rounded-2xl bg-rose/5 border-none font-bold h-40" placeholder="Viết gì đó..." required />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-light mb-2 block ml-1">Hình ảnh (Nén > 500KB)</label>
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {existingImages.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative border-2 border-rose">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx)=>idx!==i))} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-rose shadow-md opacity-30 hover:opacity-100">x</button>
                                    </div>
                                ))}
                                {tempFiles.map((file, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative border-2 border-dashed border-green bg-green/5">
                                        <div className="w-full h-full flex items-center justify-center text-green text-[10px] font-black">MỚI</div>
                                        <button type="button" onClick={() => setTempFiles(tempFiles.filter((_, idx)=>idx!==i))} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-rose shadow-md">x</button>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-xl border-4 border-dashed border-rose/10 flex flex-col items-center justify-center cursor-pointer hover:bg-rose/5 transition-colors">
                                    <i data-lucide="plus" className="text-rose/40"></i>
                                    <input type="file" multiple onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <button disabled={isSaving} className="w-full p-5 bg-rose text-white font-black rounded-2xl shadow-xl shadow-rose/20 uppercase tracking-widest disabled:opacity-50">
                            {isSaving ? 'ĐANG LƯU...' : 'LƯU BÀI VIẾT'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<Editor />);

    setTimeout(() => window.lucide.createIcons(), 500);
</script>

<?php require_once 'footer.php'; ?>
