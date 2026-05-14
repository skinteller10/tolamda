<?php 
require_once 'config.php';
require_once 'header.php';
require_once 'db.php';
?>

<script type="text/babel">
    const { useState, useEffect } = React;

    function Admin() {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [items, setItems] = useState([]);
        const [creds, setCreds] = useState({ email: '', pass: '' });

        useEffect(() => {
            const unsub = auth.onAuthStateChanged(u => {
                setUser(u);
                setLoading(false);
                if (u) loadData();
            });
            return () => unsub();
        }, []);

        const loadData = async () => {
            const data = await getRestaurants();
            setItems(data);
        };

        const handleLogin = async (e) => {
            e.preventDefault();
            try {
                await auth.signInWithEmailAndPassword(creds.email, creds.pass);
            } catch (err) {
                alert("Lỗi: " + err.message);
            }
        };

        const handleDelete = async (id) => {
            if (confirm('Xác nhận xóa bài viết này?')) {
                await db.collection('restaurants').doc(id).delete();
                loadData();
            }
        };

        if (loading) return <div className="flex justify-center p-20 animate-spin">O</div>;

        if (!user) {
            return (
                <div className="max-w-md mx-auto mt-24 p-10 bg-white rounded-[40px] shadow-2xl border border-rose/10">
                    <h2 className="text-3xl font-black mb-8 text-rose italic uppercase tracking-tighter">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <input type="email" placeholder="Email" value={creds.email} onChange={e => setCreds({...creds, email: e.target.value})} className="w-full p-5 rounded-2xl bg-rose/5 border-none font-bold" required />
                        <input type="password" placeholder="Mật khẩu" value={creds.pass} onChange={e => setCreds({...creds, pass: e.target.value})} className="w-full p-5 rounded-2xl bg-rose/5 border-none font-bold" required />
                        <button className="w-full p-5 bg-rose text-white font-black rounded-2xl shadow-xl shadow-rose/20 hover:scale-[1.02] transition-transform uppercase">Đăng nhập</button>
                    </form>
                    <div className="mt-6 text-center">
                        <a href="index.php" className="text-rose/40 text-xs font-black uppercase tracking-widest">Quay lại trang chủ</a>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black text-rose italic uppercase tracking-tighter">QUẢN TRỊ VIÊN</h1>
                    <button onClick={() => auth.signOut()} className="text-rose font-black text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">Đăng xuất</button>
                </div>

                <div className="bg-white rounded-[32px] p-2 shadow-xl border border-rose/5 mb-8 flex">
                    <a href="editor.php" className="flex-1 text-center py-4 bg-green text-white font-black rounded-[28px] shadow-lg shadow-green/20 uppercase tracking-widest">
                        Thêm bài viết mới
                    </a>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-rose/5 flex justify-between items-center animate-fade-in transition-all hover:bg-rose/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-rose/10 overflow-hidden shrink-0">
                                    {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <p className="font-black text-text-dark leading-none mb-1">{item.name}</p>
                                    <p className="text-[10px] font-black text-rose uppercase tracking-widest">{item.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <a href={`editor.php?id=${item.id}`} className="text-indigo-600 font-black text-xs uppercase tracking-widest">Sửa</a>
                                <button onClick={() => handleDelete(item.id)} className="text-rose font-black text-xs uppercase tracking-widest">Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<Admin />);
</script>

<?php require_once 'footer.php'; ?>
