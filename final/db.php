<script>
// Khởi tạo Firebase từ config PHP
const firebaseConfig = <?php echo json_encode($firebaseConfig); ?>;

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Kết nối đúng Database ID
const db = firebase.app().firestore(firebaseConfig.firestoreDatabaseId);
const auth = firebase.auth();
const storage = firebase.storage();

// Helpers
const getRestaurants = async (category) => {
    try {
        let query = db.collection('restaurants');
        if (category) {
            query = query.where('category', '==', category);
        }
        
        // Cố gắng sắp xếp theo thời gian
        const snapshot = await query.orderBy('createdAt', 'desc').get().catch(err => {
            console.warn("Lưu ý: Đang lấy dữ liệu không sắp xếp. Nếu muốn sắp xếp, hãy tạo Index theo link trong console trình duyệt.");
            return query.get();
        });
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Firestore Error:", error);
        throw error;
    }
};
</script>
