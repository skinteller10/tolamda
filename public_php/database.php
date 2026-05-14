<script>
// Khởi tạo Firebase từ PHP Config
const firebaseConfig = <?php echo json_encode($firebaseConfig); ?>;

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Helper lấy data
const getRestaurants = async (category) => {
    try {
        let query = db.collection('restaurants');
        if (category) {
            query = query.where('category', '==', category);
        }
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Firestore Error:", error);
        if (error.message.includes("composite index")) {
            throw new Error("Cần tạo Index trong Firebase. Click link trong Console để tạo.");
        }
        throw error;
    }
};
</script>
