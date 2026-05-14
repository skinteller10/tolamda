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
    let query = db.collection('restaurants');
    if (category) {
        query = query.where('category', '==', category);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
</script>
