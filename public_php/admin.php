<?php 
require_once 'config.php';
require_once 'header.php';
require_once 'database.php';
?>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<!-- Browser-image-compression -->
<script src="https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js"></script>

<script type="text/babel">
    const { useState, useEffect } = React;

    function AdminPanel() {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [restaurants, setRestaurants] = useState([]);
        const [isEditorOpen, setIsEditorOpen] = useState(false);
        const [formData, setFormData] = useState({ name: '', info: '', category: 'to-an', images: [] });

        useEffect(() => {
            const unsubscribe = auth.onAuthStateChanged(u => {
                setUser(u);
                setLoading(false);
                if (u) loadData();
            });
            return () => unsubscribe();
        }, []);

        const loadData = async () => {
            const data = await getRestaurants();
            setRestaurants(data);
        };

        const handleLogin = async (e) => {
            e.preventDefault();
            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (err) {
                alert("Lỗi đăng nhập: " + err.message);
            }
        };

        const handleSave = async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
                // Đảm bảo dùng đúng DB ID
                const restaurantsRef = db.collection('restaurants');
                await restaurantsRef.add({
                    ...formData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                setIsEditorOpen(false);
                loadData();
            } catch (err) {
                alert("Lỗi lưu: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (loading) return <div className="p-20 text-center">Đang tải...</div>;

        if (!user) {
            return (
                <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl border border-rose/10">
                    <h2 className="text-2xl font-black mb-6 text-rose uppercase italic">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-rose/5 border-none" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-rose/5 border-none" />
                        <button className="w-full p-4 bg-rose text-white font-bold rounded-2xl shadow-lg">ĐĂNG NHẬP</button>
                    </form>
                </div>
            );
        }

        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black text-rose italic">QUẢN TRỊ VIÊN</h1>
                    <button onClick={() => auth.signOut()} className="text-rose font-bold text-sm">Đăng xuất</button>
                </div>

                <div className="mb-6 flex gap-4">
                    <button onClick={() => setIsEditorOpen(true)} className="px-6 py-3 bg-green text-white font-black rounded-2xl shadow-lg uppercase tracking-wider">
                        Thêm mới
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {restaurants.map(item => (
                        <div key={item.id} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-text-light">{item.category}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-indigo">Sửa</button>
                                <button onClick={async () => { if(confirm('Xóa?')) { await db.collection('restaurants').doc(item.id).delete(); loadData(); } }} className="p-2 text-rose">Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<AdminPanel />);
</script>

<?php require_once 'footer.php'; ?>
