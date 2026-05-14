# Tài liệu hướng dẫn cho AI - Dự án "Tớ Làm Da / Tớ Ăn / Tớ Chụp"

Dự án này là một web app quản lý và hiển thị các địa điểm ăn uống, bài viết chăm sóc da, và bộ ảnh du lịch/nhiếp ảnh.

## 1. Cấu trúc Công nghệ
- **Frontend**: HTML5, PHP (để phân tách file), Tailwind CSS (STYLING), React JS (qua CDN - để xử lý logic UI và State).
- **Backend/Database**: Firebase (Firestore để lưu data, Firebase Auth để quản lý Admin, Firebase Storage để lưu ảnh).
- **Icons**: Lucide Icons.

## 2. Các trang chính (Categories)
- `to-an`: Danh sách quán ăn. Hiển thị ảnh kèm thông tin chi tiết.
- `to-lam-da`: Bài viết về da. Đặc điểm: Chỉ tối đa 2 ảnh (Trước/Sau), có thể mở rộng/thu nhỏ nội dung bài viết.
- `to-chup`: Bộ ảnh nhiếp ảnh. Hiển thị dưới dạng gallery (lưới 5 ảnh).
- `to-du-lich`: Chuyến đi du lịch.

## 3. Tính năng Admin
- Đăng nhập bằng Google hoặc Email/Password qua Firebase Auth.
- Thêm/Sửa/Xóa các thực thể (Restaurant/Article).
- **Quản lý nén ảnh**: Tự động kiểm tra nếu ảnh > 500KB sẽ nén xuống trước khi upload lên Firebase Storage. Nếu sau khi nén vẫn > 500KB sẽ báo lỗi.

## 4. Cấu trúc Firebase
- **Collection `restaurants`**:
  - `name` (string): Tên tiêu đề.
  - `category` (string): 'to-an', 'to-lam-da', 'to-chup', 'to-du-lich'.
  - `images` (array): Mảng các URL ảnh từ Storage.
  - `info` (string): Nội dung bài viết hoặc thông tin quán.
  - `type`, `location`, `rating`: Các field phụ tùy theo category.
  - `createdAt`: Timestamp.

## 5. Quy tắc hiển thị ảnh (RestaurantCard)
- `to-lam-da`: Hiển thị 2 ảnh vuông cạnh nhau (nếu đủ 2 ảnh). 1 ảnh thì hiện 1.
- `to-chup`: Hiển thị lưới 5 ảnh. Ảnh thứ 5 có dấu "+" nếu còn nhiều ảnh hơn.
- Các trang khác: Layout chuẩn với ảnh chính và các ảnh phụ bên cạnh.

## 6. Cách để AI hỗ trợ sửa lỗi
- Khi muốn sửa tính năng nén: Xem file `config.php` và logic nén trong `admin.php`.
- Khi muốn sửa giao diện: Xem các file component trong `ui-components.php`.
- Khi muốn sửa logic Firestore: Xem `database.php`.
