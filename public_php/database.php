<script>
// Khởi tạo Firebase từ PHP Config
const firebaseConfig = <?php echo json_encode($firebaseConfig); ?>;

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Chú ý: Cần truyền Database ID vào để kết nối đúng dữ liệu
const db = firebase.app().firestore(firebaseConfig.firestoreDatabaseId);
const auth = firebase.auth();
const storage = firebase.storage();

// Helper lấy data
const getRestaurants = async (category) => {
    try {
        let query = db.collection('restaurants');
        if (category) {
            query = query.where('category', '==', category);
        }
        // Thêm catch lỗi index
        const snapshot = await query.orderBy('createdAt', 'desc').get().catch(err => {
            if (err.message.includes("index")) {
                console.warn("Đang lấy dữ liệu không sắp xếp do chưa tạo Index...");
                return query.get(); // Fallback nếu chưa có Index
            }
            throw err;
        });
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Firestore Error:", error);
        throw error;
    }
};
</script>
