<?php 
require_once 'config.php';
require_once 'header.php';
require_once 'db.php';
?>

<script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
        const [restaurants, setRestaurants] = useState([]);
        const [activeTab, setActiveTab] = useState('to-an');
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchData();
        }, [activeTab]);

        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getRestaurants(activeTab);
                setRestaurants(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            if (window.lucide) window.lucide.createIcons();
        }, [restaurants]);

        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Branding */}
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-5xl font-black italic text-rose mb-8 uppercase tracking-tighter animate-fade-in">
                        {activeTab === 'to-an' ? 'TỚ ĂN' : activeTab === 'to-lam-da' ? 'TỚ LÀM DA' : activeTab === 'to-chup' ? 'TỚ CHỤP' : 'TỚ DU LỊCH'}
                    </h1>
                    
                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 p-1 bg-white rounded-3xl shadow-xl border border-rose/10">
                        {[
                            { id: 'to-an', label: 'Tới quán ngon' },
                            { id: 'to-lam-da', label: 'Tớ chăm da' },
                            { id: 'to-chup', label: 'Kho ảnh của tớ' },
                            { id: 'to-du-lich', label: 'Tớ du lịch' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                                    activeTab === tab.id ? 'bg-rose text-white shadow-lg' : 'text-rose/60 hover:bg-rose/5'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 animate-fade-in">
                        {restaurants.length === 0 ? (
                            <div className="text-center py-24 opacity-30 italic font-medium">Chưa có bài viết nào...</div>
                        ) : (
                            restaurants.map(item => (
                                <div key={item.id} className="bg-white rounded-[40px] p-6 shadow-xl shadow-rose/5 border border-rose/5 hover:scale-[1.01] transition-transform">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Image Section */}
                                        <div className="w-full md:w-[38%] shrink-0">
                                            {activeTab === 'to-lam-da' ? (
                                                <div className={`flex gap-1 overflow-hidden rounded-[28px] ${item.images?.length > 1 ? 'aspect-[2/1]' : 'aspect-square'}`}>
                                                    {(item.images || []).slice(0, 2).map((img, idx) => (
                                                        <div key={idx} className="flex-1 overflow-hidden bg-rose/5">
                                                            <img src={img} className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : activeTab === 'to-chup' ? (
                                                <div className="aspect-[2/1] rounded-[28px] overflow-hidden bg-rose/5 grid grid-cols-5 gap-1">
                                                    <div className="col-span-3 h-full overflow-hidden">
                                                        <img src={item.images?.[0]} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-1 h-full">
                                                        {item.images?.slice(1, 5).map((img, idx) => (
                                                            <div key={idx} className="relative w-full h-full overflow-hidden">
                                                                <img src={img} className="w-full h-full object-cover" />
                                                                {idx === 3 && item.images.length > 5 && (
                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-black">+{item.images.length - 5}</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="aspect-[4/3] rounded-[28px] overflow-hidden bg-rose/5 flex items-center justify-center">
                                                    {item.images?.[0] ? (
                                                        <img src={item.images[0]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <i data-lucide="image" className="w-12 h-12 text-rose/20"></i>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Section */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-2xl font-black text-text-dark mb-4 tracking-tight leading-tight">{item.name}</h3>
                                            <p className="text-text-mid leading-relaxed text-[15px] whitespace-pre-wrap line-clamp-4 font-medium opacity-80">
                                                {item.info}
                                            </p>
                                            <div className="mt-6 flex items-center gap-3">
                                                <span className="px-4 py-1.5 bg-rose/5 text-rose text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    {item.category?.replace('to-', '')}
                                                </span>
                                                {item.location && <span className="text-[11px] text-text-light font-bold flex items-center gap-1"><i data-lucide="map-pin" className="w-3 h-3"></i> {item.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
</script>

<?php require_once 'footer.php'; ?>
