# Frontend React - Admin Dashboard Setup & Guide

**Phiên Bản**: 1.0.0  
**Ngày Tạo**: 23/02/2026  
**Port**: 5173 (Vite Dev Server)

## 🎯 Tổng Quan

Đã hoàn thành xây dựng Frontend React cho **Option A** (Admin Dashboard) với giao diện đơn giản, không gradient, không icon, sử dụng font chữ Roboto và màu chủ đạo là trắng (#FFFFFF) và xanh (#007bff).

---

## ✅ Hoàn Thành

### 1. **Cấu Hình Dự Án**
- ✅ Tạo project React với Vite
- ✅ Cài đặt dependencies: React, React Router, Axios
- ✅ Tải Roboto font từ Google Fonts
- ✅ Cấu hình vite.config.js

### 2. **Hệ Thống Design**
- ✅ Global CSS với color scheme trắng + xanh
- ✅ Responsive layout (desktop, tablet, mobile)
- ✅ Không gradient, không icon - thiết kế tối giản
- ✅ CSS variables cho dễ thay đổi màu sắc

### 3. **Kiến Trúc & Services**
- ✅ Axios API client với interceptors
- ✅ Auth service (login, register, logout, getCurrentUser)
- ✅ React Context cho authentication state management
- ✅ Proper token management (localStorage)

### 4. **Components & Layout**
- ✅ MainLayout (Header + Sidebar + Content)
- ✅ Header component (user info, logout button)
- ✅ Sidebar component (dynamic menu theo role)
- ✅ ProtectedRoute component (role-based access)

### 5. **Pages (Hoàn Thành Tất Cả)**
| Page | Route | Roles | Tính Năng |
|------|-------|-------|----------|
| Login | `/login` | Public | Đăng nhập, demo accounts |
| Dashboard | `/dashboard` | All | Stats, welcome, quick guide |
| Patients | `/patients` | LeTan, QuanTri | CRUD patients, form |
| Appointments | `/appointments` | LeTan, QuanTri | List, create appointments |
| Doctors | `/doctors` | QuanTri | View doctor list |
| Specialties | `/specialties` | QuanTri | Manage specialties |
| Schedules | `/schedules` | LeTan, QuanTri | Manage work schedules |
| Medical Records | `/medical-records` | BacSi, QuanTri | View medical records |
| My Appointments | `/my-appointments` | BacSi | Doctor's appointments |
| Users | `/users` | QuanTri | User management |
| NotFound | `*` | All | 404 page |

### 6. **Authentication & Authorization**
- ✅ JWT token handling
- ✅ Role-based access control (RBAC)
- ✅ Protected routes
- ✅ Auto-logout on 401
- ✅ Demo credentials configured

### 7. **Styling (CSS)**
| File | Mục Đích |
|------|---------|
| global.css | Colors, typography, base styles |
| layout.css | Header, Sidebar, main layout |
| login.css | Login form styling |
| dashboard.css | Dashboard & stats cards |
| list.css | Table layouts & CRUD forms |
| error.css | Error/404 page styling |

---

## 📁 Cấu Trúc Dự Án

```
frontend/
├── .gitignore
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies & scripts
├── README.md               # Project README
│
├── src/
│   ├── App.jsx             # Main app with routes
│   ├── main.jsx            # React DOM render
│   │
│   ├── components/
│   │   ├── Header.jsx      # Top navigation bar
│   │   ├── Sidebar.jsx     # Side menu (role-based)
│   │   ├── MainLayout.jsx  # Layout wrapper
│   │   └── ProtectedRoute.jsx  # Route guard
│   │
│   ├── context/
│   │   └── AuthContext.jsx # Auth state management
│   │
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Patients.jsx        # Patient CRUD
│   │   ├── Appointments.jsx    # Appointment list/create
│   │   ├── Doctors.jsx         # Doctor list
│   │   ├── Specialties.jsx     # Specialty management
│   │   ├── Schedules.jsx       # Schedule management
│   │   ├── MedicalRecords.jsx  # Medical records
│   │   ├── MyAppointments.jsx  # Doctor's appointments
│   │   ├── Users.jsx           # User management
│   │   └── NotFound.jsx        # 404 page
│   │
│   ├── services/
│   │   ├── api.js          # Axios instance
│   │   └── authService.js  # Auth functions
│   │
│   └── styles/
│       ├── global.css      # Global styles
│       ├── layout.css      # Layout styles
│       ├── login.css       # Login styles
│       ├── dashboard.css   # Dashboard styles
│       ├── list.css        # List/table styles
│       └── error.css       # Error page styles
```

---

## 🚀 Khởi Động & Chạy

### 1. Cài Đặt Dependencies
```bash
npm install
```

### 2. Khởi Động Dev Server
```bash
npm run dev
```

**URL**: http://localhost:5173

### 3. Build Production
```bash
npm run build
npm run preview
```

---

## 🔑 Tài Khoản Demo

### Credentials
| Vai Trò | Username | Password | Quyền |
|---------|----------|----------|-------|
| **Quản Trị** | admin | Admin@123 | Tất cả chức năng |
| **Tiếp Tân** | test456 | Test@123 | Bệnh nhân, lịch khám, lịch làm việc |
| **Bác Sĩ** | doctor1 | Doctor@123 | Lịch khám, hồ sơ khám bệnh |

---

## 🎨 Color Scheme

```css
--primary-blue: #007bff       /* Xanh chủ đạo */
--dark-blue: #0056b3          /* Xanh đậm */
--light-blue: #e7f3ff         /* Xanh nhạt */
--white: #ffffff              /* Trắng */
--light-gray: #f5f5f5         /* Xám nhạt */
--medium-gray: #e0e0e0        /* Xám vừa */
--dark-gray: #666666          /* Xám đậm */
--text-dark: #333333          /* Chữ tối */
--text-light: #999999         /* Chữ nhạt */
```

---

## 📋 Menu Navigation

### 👨‍💼 Quản Trị Viên (QuanTri)
```
├── Bảng Điều Khiển
├── Bệnh Nhân
├── Bác Sĩ
├── Chuyên Khoa
├── Lịch Khám
├── Lịch Làm Việc
├── Hồ Sơ Khám
└── Quản Lý Người Dùng
```

### 👩‍💼 Nhân Viên Tiếp Tân (LeTan)
```
├── Bảng Điều Khiển
├── Bệnh Nhân
├── Lịch Khám
└── Lịch Làm Việc
```

### 👨‍⚕️ Bác Sĩ (BacSi)
```
├── Bảng Điều Khiển
├── Lịch Khám Của Tôi
└── Hồ Sơ Khám Bệnh
```

---

## 🔗 API Integration

### Base URL
```
http://localhost:5000/api/
```

### Auth Header
```
Authorization: Bearer {token}
```

### Endpoints Being Used

| Method | Endpoint | Component |
|--------|----------|-----------|
| POST | /auth/login | Login.jsx |
| POST | /auth/register | Login.jsx |
| GET | /benhnhan | Patients.jsx |
| POST | /benhnhan | Patients.jsx |
| PUT | /benhnhan/:id | Patients.jsx |
| DELETE | /benhnhan/:id | Patients.jsx |
| GET | /lichkham | Appointments.jsx, MyAppointments.jsx |
| POST | /lichkham | Appointments.jsx |
| GET | /bacsi | Doctors.jsx |
| GET | /hosokhambenh | MedicalRecords.jsx |

---

## ⚙️ Cấu Hình

### API Base URL
File: `src/services/api.js`
```javascript
const API_BASE_URL = 'http://localhost:5000/api'
```

### JWT Token Storage
- **Storage**: `localStorage`
- **Key**: `token`
- **User Data Key**: `user`

### Token Expiry
- **Duration**: 7 days
- **On Expiry**: Auto-logout, redirect to `/login`

---

## 🛡️ Bảo Mật

- ✅ JWT Token validation
- ✅ Protected routes with role checking
- ✅ Auto redirect on unauthorized access
- ✅ Token stored securely (localStorage)
- ✅ CORS configured on backend
- ✅ Request timeout handling

---

## 📱 Responsive Design

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

Tất cả components đều có media queries để tối ưu hóa trên các kích thước khác nhau.

---

## 🧪 Testing Frontend

### Test Login
1. Mở http://localhost:5173
2. Nhập tài khoản: `test456` / `Test@123`
3. Kiểm tra dashboard hiển thị

### Test Patient CRUD
1. Đăng nhập với LeTan (test456)
2. Vào "Bệnh Nhân"
3. Test: Thêm → Sửa → Xóa bệnh nhân

### Test Role-Based Access
1. Đăng nhập với BacSi (doctor1)
2. Kiểm tra menu chỉ có "Lịch Khám Của Tôi"
3. Cố truy cập `/patients` → phải redirect về dashboard

---

## 🚨 Troubleshooting

### Lỗi CORS
```
Access to XMLHttpRequest blocked by CORS policy
```
**Giải pháp**: Kiểm tra backend có bật CORS, backend đang chạy trên port 5000

### Login không thành công
```
Error: 401 Unauthorized
```
**Giải pháp**: Kiểm tra username/password, kiểm tra backend chạy chưa

### Frontend trắng / Không load
```
Cannot GET /
```
**Giải pháp**: 
- Kiểm tra Vite server chạy (`npm run dev`)
- Clear cache browser (Ctrl+Shift+Delete)
- Kiểm tra console browser

### Token hết hạn tự động logout
- Bình thường, token JWT 7 ngày
- User sẽ redirect về `/login`
- Phải đăng nhập lại

---

## 📊 Dashboard Stats

**Quản Trị**: Tổng bệnh nhân, tổng bác sĩ, lịch khám hôm nay  
**Tiếp Tân**: Lịch khám hôm nay, bệnh nhân mới, chấp nhận lịch  
**Bác Sĩ**: Lịch khám hôm nay, bệnh nhân chờ, hồ sơ tạo

> Note: Hiện tại hiển thị giá trị mặc định (0). Integration với backend sẽ cập nhật thực tế.

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0"
}
```

---

## 🔄 Tiếp Theo (CI & Deployment)

- [ ] Environment variables (.env.local)
- [ ] Error boundary component
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Form validation
- [ ] Data table pagination
- [ ] Search & filter
- [ ] Export to PDF/Excel
- [ ] Dark mode
- [ ] Mobile app (React Native)

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra console browser (F12)
2. Kiểm tra Network tab xem API calls
3. Kiểm tra server backend đang chạy
4. Kiểm tra token trong localStorage

---

**Tạo bởi**: GitHub Copilot  
**Ngày Update**: 23/02/2026  
**Version**: 1.0.0
