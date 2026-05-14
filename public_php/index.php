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

        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-4xl font-black italic text-rose mb-8 uppercase tracking-tighter">
                        {activeTab === 'to-an' ? 'TỚ ĂN' : activeTab === 'to-lam-da' ? 'TỚ LÀM DA' : 'TỚ CHỤP'}
                    </h1>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-white rounded-full shadow-lg border border-rose/10">
                        {['to-an', 'to-lam-da', 'to-chup'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                                    activeTab === tab ? 'bg-rose text-white shadow-md' : 'text-rose/60 hover:bg-rose/5'
                                }`}
                            >
                                {tab === 'to-an' ? 'Tới quán ngon' : tab === 'to-lam-da' ? 'Tớ chăm da' : 'Kho ảnh của tớ'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {restaurants.map(item => (
                            <div key={item.id} className="bg-white rounded-3xl p-4 shadow-xl border border-rose/5">
                                {/* Card content based on layout logic in guide */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden bg-rose/5">
                                        {item.images && item.images[0] ? (
                                            <img src={item.images[0]} className="w-full h-full object-cover" />
                                        ) : null}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                                        <p className="text-gray-500 whitespace-pre-wrap line-clamp-3">{item.info}</p>
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
