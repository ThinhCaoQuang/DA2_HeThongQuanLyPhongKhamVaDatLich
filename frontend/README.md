# Hệ Thống Quản Lý Phòng Khám - Frontend

Frontend React cho hệ thống quản lý phòng khám với giao diện đơn giản, màu trắng và xanh, sử dụng font Roboto.

## Tính Năng

### Design
- **Font**: Roboto (từ Google Fonts)
- **Màu**: Trắng (#FFFFFF) và Xanh (#007bff)
- **Style**: Đơn giản, không gradient, không icon
- **Responsive**: Tối ưu cho desktop, tablet, mobile

### Chức Năng
- ✅ Đăng nhập/Đăng xuất
- ✅ Bảng điều khiển (Dashboard)
- ✅ Quản lý bệnh nhân (CRUD)
- ✅ Quản lý lịch khám
- ✅ Quản lý bác sĩ
- ✅ Kiểm soát truy cập theo vai trò (Role-based)

### Vai Trò & Quyền
- **Quản Trị Viên (QuanTri)**: Truy cập tất cả chức năng
- **Nhân Viên Tiếp Tân (LeTan)**: Quản lý bệnh nhân, lịch khám, lịch làm việc
- **Bác Sĩ (BacSi)**: Xem lịch khám, tạo hồ sơ khám bệnh

## Cài Đặt

### Yêu Cầu
- Node.js 16+ 
- npm hoặc yarn

### Bước 1: Cài Đặt Dependencies
```bash
npm install
```

### Bước 2: Cấu Hình API
Đảm bảo rằng backend đang chạy trên `http://localhost:5000` (xem file `src/services/api.js`)

### Bước 3: Khởi Động Server Phát Triển
```bash
npm run dev
```

Truy cập ứng dụng tại `http://localhost:5173`

## Tài Khoản Demo

| Vai Trò | Username | Password | Quyền |
|---------|----------|----------|-------|
| Quản Trị | admin | Admin@123 | Tất cả |
| Tiếp Tân | test456 | Test@123 | Bệnh nhân, lịch khám |
| Bác Sĩ | doctor1 | Doctor@123 | Lịch khám, hồ sơ |

## Cấu Trúc Dự Án

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MainLayout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/           # React context (Auth)
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Patients.jsx
│   │   ├── Appointments.jsx
│   │   ├── Doctors.jsx
│   │   └── NotFound.jsx
│   ├── services/          # API calls & auth
│   │   ├── api.js
│   │   └── authService.js
│   ├── styles/            # CSS files
│   │   ├── global.css
│   │   ├── layout.css
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── list.css
│   │   └── error.css
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Build cho Production

```bash
npm run build
npm run preview
```

## Lưu Ý Quan Trọng

1. **Backend**: Backend phải chạy trên port 5000
2. **CORS**: Backend đã bật CORS cho frontend
3. **Token**: JWT token được lưu trong localStorage (tự động hết hạn sau 7 ngày)
4. **API Base URL**: `http://localhost:5000/api`

## Tính Năng Bảo Mật

- ✅ JWT Authentication
- ✅ Token validation trên mỗi request
- ✅ Auto-logout khi token hết hạn (401)
- ✅ Role-based access control
- ✅ Protected routes

## Quy Ước Màu

```css
--primary-blue: #007bff      /* Màu chính */
--dark-blue: #0056b3         /* Màu tối */
--light-blue: #e7f3ff        /* Màu nhạt */
--white: #ffffff             /* Nền trắng */
--light-gray: #f5f5f5        /* Nền xám nhạt */
--text-dark: #333333         /* Chữ tối */
--text-light: #999999        /* Chữ nhạt */
```

## TypeScript (Tuỳ Chọn)

Để sử dụng TypeScript, thay đổi extensions từ `.jsx` thành `.tsx` và cài đặt:
```bash
npm install --save-dev typescript @types/react @types/react-dom
```

## Troubleshooting

### Lỗi CORS
- Kiểm tra backend có bật CORS không
- Kiểm tra API base URL trong `src/services/api.js`

### Login không thành công
- Kiểm tra backend có chạy không
- Kiểm tra tài khoản demo có đúng không

### Trang trắng / 404
- Kiểm tra backend có trả về dữ liệu không
- Kiểm tra console browser có lỗi gì

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Medical records management
- [ ] Doctor scheduling
- [ ] Email notifications
- [ ] Dark mode

## Liên Hệ

Nếu có vấn đề, vui lòng liên hệ với quản trị viên hệ thống.

---
**Phiên Bản**: 1.0.0  
**Ngày Cập Nhật**: 23/02/2026
