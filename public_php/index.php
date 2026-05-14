<?php 
require_once 'config.php';
require_once 'header.php';
require_once 'database.php';
?>

<!-- React & Babel cho JSX trực tiếp trên trình duyệt -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://unpkg.com/lucide@latest"></script>

<script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
        const [restaurants, setRestaurants] = useState([]);
        const [activeTab, setActiveTab] = useState('to-an');
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            fetchData();
        }, [activeTab]);

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getRestaurants(activeTab);
                setRestaurants(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Initialize Lucide icons
        useEffect(() => {
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }, [restaurants, activeTab]);

        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-4xl font-black italic text-rose mb-8 uppercase tracking-tighter">
                        {activeTab === 'to-an' ? 'TỚ ĂN' : activeTab === 'to-lam-da' ? 'TỚ LÀM DA' : activeTab === 'to-chup' ? 'TỚ CHỤP' : 'TỚ DU LỊCH'}
                    </h1>
                    
                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 p-1 bg-white rounded-3xl shadow-lg border border-rose/10">
                        {[
                            { id: 'to-an', label: 'Tới quán ngon' },
                            { id: 'to-lam-da', label: 'Tớ chăm da' },
                            { id: 'to-chup', label: 'Kho ảnh của tớ' },
                            { id: 'to-du-lich', label: 'Tớ du lịch' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                                    activeTab === tab.id ? 'bg-rose text-white shadow-md' : 'text-rose/60 hover:bg-rose/5'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-8 font-medium">
                        {error}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {restaurants.length === 0 && !error && (
                            <p className="text-center text-text-light py-20 font-medium italic">Chưa có bài viết nào ở mục này...</p>
                        )}
                        {restaurants.map(item => (
                            <div key={item.id} className="bg-white rounded-[32px] p-5 shadow-xl shadow-rose/5 border border-rose/5 transition-transform hover:scale-[1.01]">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Layout Hình ảnh */}
                                    <div className={`w-full md:w-[35%] shrink-0`}>
                                        {activeTab === 'to-lam-da' ? (
                                            <div className={`flex gap-1 overflow-hidden rounded-2xl ${item.images?.length > 1 ? 'aspect-[2/1]' : 'aspect-square'}`}>
                                                {item.images?.slice(0, 2).map((img, idx) => (
                                                    <div key={idx} className="flex-1 overflow-hidden bg-rose/5">
                                                        <img src={img} className="w-full h-full object-cover" loading="lazy" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-rose/5 flex items-center justify-center">
                                                {item.images && item.images[0] ? (
                                                    <img src={item.images[0]} className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <i data-lucide="image" className="w-12 h-12 text-rose/20"></i>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Nội dung */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-2xl font-black text-text-dark mb-3 tracking-tight">{item.name}</h3>
                                        <p className="text-text-mid leading-relaxed text-[15px] whitespace-pre-wrap line-clamp-4">
                                            {item.info}
                                        </p>
                                        <div className="mt-4 flex gap-2">
                                           <span className="px-3 py-1 bg-rose/5 text-rose text-[11px] font-black uppercase tracking-wider rounded-full">
                                               {activeTab}
                                           </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
</script>

<?php require_once 'footer.php'; ?>
