# Hướng dẫn triển khai hệ thống phân quyền

## Tổng quan
Hệ thống đã được triển khai với các tính năng sau:
- Phân quyền user/admin trong database
- Trang Admin Dashboard với analytics
- Middleware bảo vệ route `/admin`
- UI hiển thị link Admin chỉ cho user có quyền

# Hướng dẫn triển khai hệ thống phân quyền

## Tổng quan
Hệ thống đã được triển khai với các tính năng sau:
- Phân quyền user/admin trong database
- Trang Admin Dashboard với analytics
- Middleware bảo vệ route `/admin`
- UI hiển thị link Admin chỉ cho user có quyền

## Cách tạo admin đầu tiên (An toàn)

### Phương pháp 1: Thông qua Supabase Dashboard (Khuyến nghị)
1. Truy cập Supabase Dashboard của project
2. Vào Table Editor > profiles
3. Tìm user cần promote thành admin
4. Edit row và thay đổi cột `role` từ `'user'` thành `'admin'`
5. Save changes

### Phương pháp 2: Thông qua SQL Query
1. Truy cập Supabase SQL Editor
2. Chạy query sau (thay YOUR_USER_ID bằng ID thực tế):
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

### Phương pháp 3: Thông qua CLI (nếu có access)
```sql
-- Kết nối với database và chạy:
UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourdomain.com';
```

### Lưu ý bảo mật quan trọng
- ❌ **KHÔNG** tạo UI hoặc API endpoint để promote admin
- ❌ **KHÔNG** có chức năng tự động tạo admin trong code
- ✅ **CHỈ** tạo admin thông qua database trực tiếp
- ✅ **CHỈ** người có access vào database mới có thể tạo admin
- ✅ Luôn verify user trước khi promote thành admin

### Bước 3: Truy cập Admin Dashboard
Sau khi được promote thành admin, user sẽ thấy:
- Link "Admin" trong navigation bar
- Link "Admin Dashboard" trong dropdown menu
- Có thể truy cập `/admin` để xem analytics

## Tính năng Admin Dashboard

### Thống kê tổng quan
- Tổng số người dùng
- Tổng số lượt yêu thích phim
- Tổng số bình luận
- Tổng số phim trong database

### Các tab chi tiết
1. **Tổng quan**: Phân tích cảm xúc bình luận
2. **Người dùng**: Danh sách user gần đây với role
3. **Phim phổ biến**: Top phim được yêu thích nhiều nhất
4. **Bình luận**: Bình luận gần đây với sentiment analysis

### Bảo mật
- Middleware kiểm tra quyền admin trước khi truy cập `/admin`
- RLS policies trong Supabase
- Không có UI hoặc API để promote user (chỉ thông qua database)

## Cấu trúc Database

### Bảng profiles
```sql
- id (uuid, primary key)
- full_name (text)
- avatar_url (text)
- role (text, default 'user') -- 'user' hoặc 'admin'
- updated_at (timestamptz)
```

### Policies
- User chỉ có thể xem/sửa profile của chính họ
- Admin có thể xem/sửa tất cả profiles
- Admin có thể promote user khác thành admin

## API Endpoints

Không có API endpoints để quản lý admin - tất cả thao tác admin phải thực hiện trực tiếp trên database để đảm bảo bảo mật.

## Lưu ý Development vs Production

### Development
- Admin chỉ có thể được tạo thông qua database
- Sử dụng Supabase local development hoặc staging environment để test

### Production
- **TUYỆT ĐỐI KHÔNG** có bất kỳ UI hoặc API nào để tạo admin
- Chỉ database administrator mới có thể promote user thành admin
- Luôn audit và log các thay đổi role trong production

## Cấu trúc Database

### Bảng profiles
```sql
- id (uuid, primary key)
- full_name (text)
- avatar_url (text)
- role (text, default 'user') -- 'user' hoặc 'admin'
- updated_at (timestamptz)
```

### Policies
- User chỉ có thể xem/sửa profile của chính họ
- Không có policy đặc biệt cho admin (sử dụng RPC functions khi cần)
- Tất cả thao tác admin phải thực hiện trực tiếp trên database

### RPC Functions
- `get_user_stats_admin()`: Lấy thống kê cho admin dashboard
- `get_recent_users_admin()`: Lấy danh sách user gần đây

### Security Features
- Không có function hoặc API để promote user trong code
- Middleware bảo vệ route admin
- RLS policies bảo vệ dữ liệu user
