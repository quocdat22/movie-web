# Hướng dẫn triển khai trên Vercel

## Cấu hình biến môi trường

Khi triển khai ứng dụng trên Vercel, bạn cần cấu hình các biến môi trường sau:

```
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

## Cấu hình Supabase

### 1. Cấu hình URL chuyển hướng

Để xác thực hoạt động đúng, bạn cần cấu hình URL chuyển hướng trong Supabase:

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.io/)
2. Chọn dự án của bạn
3. Đi đến **Authentication** > **URL Configuration**
4. Trong phần **Redirect URLs**, thêm URL sau:
   - `https://your-production-domain.com/auth/callback`

### 2. Kiểm tra cấu hình email

Đảm bảo rằng cấu hình email của Supabase đã được thiết lập đúng:

1. Đi đến **Authentication** > **Email Templates**
2. Kiểm tra mẫu email **Confirmation** để đảm bảo nó không chứa bất kỳ URL cứng nào trỏ đến localhost

## Kiểm tra sau khi triển khai

Sau khi triển khai, hãy kiểm tra quy trình đăng ký:

1. Tạo một tài khoản mới
2. Kiểm tra email xác nhận được gửi đến
3. Xác minh rằng liên kết trong email chứa URL chuyển hướng đúng đến trang web production của bạn
4. Nhấp vào liên kết xác nhận và đảm bảo rằng bạn được chuyển hướng đến trang web production và đăng nhập thành công

## Xử lý sự cố

Nếu bạn gặp vấn đề với xác thực:

1. Kiểm tra console trình duyệt để tìm lỗi
2. Xác minh rằng biến môi trường `NEXT_PUBLIC_SITE_URL` đã được cấu hình đúng trong Vercel
3. Kiểm tra logs của Supabase để xem có lỗi nào liên quan đến xác thực không
4. Đảm bảo rằng URL chuyển hướng đã được thêm vào danh sách cho phép trong Supabase