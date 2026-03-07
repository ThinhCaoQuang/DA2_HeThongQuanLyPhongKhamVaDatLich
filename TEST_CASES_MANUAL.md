# 🧪 CLINIC API - MANUAL TEST CASES

## 📋 Test Plan

Server: `http://localhost:5000`
Database: MySQL (QuanLyPhongKham)
Auth: JWT Bearer Token

---

## ✅ TEST CASE 1: Authentication - Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "doctor_test_2026",
  "password": "SecurePass@123",
  "hoTen": "Bác Sĩ Nguyễn Văn A",
  "email": "doctor.test@clinic.com",
  "dienThoai": "0912345678",
  "vaiTro": "BacSi"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "TaiKhoanId": 7,
      "TenDangNhap": "doctor_test_2026",
      "VaiTro": "BacSi",
      "HoTen": "Bác Sĩ Nguyễn Văn A",
      "Email": "doctor.test@clinic.com",
      "DienThoai": "0912345678"
    }
  }
}
```

**✅ Test Pass If:**
- Status = 201
- success = true
- Token được trả về
- User data tương ứng

**❌ Test Fail If:**
- Status ≠ 201
- Token không được trả về
- Validation error xuất hiện

---

## ✅ TEST CASE 2: Authentication - Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "test456",
  "password": "Test@123"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "TaiKhoanId": 6,
      "TenDangNhap": "test456",
      "VaiTro": "LeTan",
      "HoTen": "Nguyễn Ánh Sáng",
      "Email": "test456@clinic.com",
      "DienThoai": "0987654321"
    }
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Token received
- User info matches login credentials

**Action:** 
- **Copy Token** → Save for next tests as `{{token}}`

---

## ✅ TEST CASE 3: Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Lấy thông tin thành công",
  "data": {
    "TaiKhoanId": 6,
    "TenDangNhap": "test456",
    "VaiTro": "LeTan",
    "HoTen": "Nguyễn Ánh Sáng",
    "Email": "test456@clinic.com",
    "DienThoai": "0987654321"
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns user profile
- User data valid

---

## ✅ TEST CASE 4: Get All Patients

**Endpoint:** `GET /api/benhnhan`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Optional):**
```
?page=1&limit=10
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "BenhNhanId": 1,
      "NguoiDungId": 6,
      "MaBenhNhan": "P0001",
      "TienSuBenhLy": "Không có",
      "TrangThai": "HoatDong",
      "CreatedAt": "2026-02-23T00:00:00.000Z"
    },
    {
      "BenhNhanId": 2,
      "NguoiDungId": 7,
      "MaBenhNhan": "P0002",
      "TienSuBenhLy": "Viêm xoang",
      "TrangThai": "HoatDong"
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns array of patients
- Pagination info included
- Contains at least 1 patient

---

## ✅ TEST CASE 5: Get Patient By ID

**Endpoint:** `GET /api/benhnhan/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "BenhNhanId": 1,
    "NguoiDungId": 6,
    "MaBenhNhan": "P0001",
    "TienSuBenhLy": "Không có",
    "DiUng": "Không",
    "GhiChu": null,
    "TrangThai": "HoatDong",
    "CreatedAt": "2026-02-23T00:00:00.000Z"
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns single patient object
- BenhNhanId = 1

**❌ Test with Invalid ID:**
- Try: `GET /api/benhnhan/999`
- Expected: `404 Not Found` with message "Bệnh nhân không tìm thấy"

---

## ✅ TEST CASE 6: Create New Patient

**Endpoint:** `POST /api/benhnhan`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "hoTen": "Trần Văn Bình",
  "gioiTinh": "Nam",
  "ngaySinh": "1988-03-15",
  "dienThoai": "0923456789",
  "email": "binh.tran@email.com",
  "diaChi": "456 Đường Lê Lợi, Quận 1, TP.HCM",
  "tienSuBenh": "Đái tháo đường type 2"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "Tạo bệnh nhân thành công",
  "data": {
    "BenhNhanId": 5,
    "NguoiDungId": 9,
    "MaBenhNhan": "P0011",
    "TienSuBenhLy": "Đái tháo đường type 2",
    "TrangThai": "HoatDong",
    "CreatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**✅ Test Pass If:**
- Status = 201
- New patient created with auto-generated MaBenhNhan (P0011, P0012, etc.)
- All fields match request

**Action:** Save `MaBenhNhan` for next test

---

## ✅ TEST CASE 7: Update Patient

**Endpoint:** `PUT /api/benhnhan/5`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body (Update only what needed):**
```json
{
  "hoTen": "Trần Văn Bình Updated",
  "dienThoai": "0999999999",
  "diaChi": "789 Đường Thảo Điền, Quận 2, TP.HCM"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cập nhật bệnh nhân thành công",
  "data": {
    "BenhNhanId": 5,
    "NguoiDungId": 9,
    "MaBenhNhan": "P0011",
    "hoTen": "Trần Văn Bình Updated",
    "dienThoai": "0999999999",
    "diaChi": "789 Đường Thảo Điền, Quận 2, TP.HCM"
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Updated fields reflect in response
- Unchanged fields remain same

---

## ✅ TEST CASE 8: Get All Doctors

**Endpoint:** `GET /api/bacsi`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Optional):**
```
?page=1&limit=10
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "BacSiId": 1,
      "NguoiDungId": 3,
      "MaBacSi": "BS0001",
      "SoChungChi": "LIC001",
      "CapHocVan": "Tiến sĩ Y học",
      "NamKinhNghiem": 10,
      "TrangThai": "HoatDong"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns doctors array
- At least 3 doctors returned

---

## ✅ TEST CASE 9: Get All Specialties

**Endpoint:** `GET /api/chuyenkhoa`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "ChuyenKhoaId": 1,
      "TenChuyenKhoa": "Tim Mạch",
      "MoTa": "Chuyên khoa về bệnh tim và mạch máu"
    },
    {
      "ChuyenKhoaId": 2,
      "TenChuyenKhoa": "Hô Hấp",
      "MoTa": "Chuyên khoa về bệnh hô hấp"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns 5 specialties
- All data valid

---

## ✅ TEST CASE 10: Get All Appointments

**Endpoint:** `GET /api/lichkham`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Parameters (Optional):**
```
?status=ChoXacNhan&page=1&limit=10
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "LichKhamId": 1,
      "MaLichKham": "LK0001",
      "BenhNhanId": 1,
      "BacSiId": 1,
      "ChuyenKhoaId": 1,
      "ThoiGianBatDau": "2026-02-05T08:00:00.000Z",
      "TrangThai": "ChoXacNhan",
      "CreatedAt": "2026-02-23T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns appointments
- Filters working (if used status parameter)

---

## ✅ TEST CASE 11: Get Doctor Schedules

**Endpoint:** `GET /api/lichlamviec`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Parameters (Optional):**
```
?bacSiId=1&page=1&limit=10
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "LichLamViecId": 1,
      "BacSiId": 1,
      "NgayLamViec": "2026-02-05",
      "CaLam": "Sang",
      "GioBatDau": "08:00:00",
      "GioKetThuc": "12:00:00",
      "SoBenhNhanToiDa": 10,
      "TrangThai": "HoatDong"
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns schedules
- Contains time fields

---

## ✅ TEST CASE 12: Get Medical Records

**Endpoint:** `GET /api/hosokhambenh`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "HoSoId": 1,
      "MaHoSo": "HS0001",
      "LichKhamId": 1,
      "BenhNhanId": 1,
      "BacSiId": 1,
      "TrieuChung": "Đau ngực, khó thở",
      "ChanDoan": "Rối loạn tim mạch",
      "KeHoachDieuTri": "Kê đơn và tư vấn",
      "NgayKham": "2026-02-05T08:00:00.000Z",
      "CreatedAt": "2026-02-23T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 0
  }
}
```

**✅ Test Pass If:**
- Status = 200
- Returns records (may be empty)
- Proper structure

---

## ⚠️ TEST CASE 13: Authentication Bug - Missing Token

**Endpoint:** `GET /api/benhnhan`

**Headers:**
```
Content-Type: application/json
(NO Authorization header)
```

**Expected Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Không tìm thấy token xác thực"
}
```

**✅ Test Pass If:**
- Status = 401
- Error message appears

---

## ⚠️ TEST CASE 14: Invalid Token

**Endpoint:** `GET /api/benhnhan`

**Headers:**
```
Authorization: Bearer invalid_token_12345
```

**Expected Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Token không hợp lệ"
}
```

**✅ Test Pass If:**
- Status = 401
- Token validation error

---

## ⚠️ TEST CASE 15: Access Control - Wrong Role

**Endpoint:** `POST /api/chuyenkhoa` (Admin only)

**Headers:**
```
Authorization: Bearer {{token}}  (LeTan role token)
Content-Type: application/json
```

**Request Body:**
```json
{
  "tenChuyenKhoa": "Test Specialty",
  "moTa": "Test Description"
}
```

**Expected Response:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện tác vụ này"
}
```

**✅ Test Pass If:**
- Status = 403
- Access denied properly

---

## 📊 TEST SUMMARY CHECKLIST

Print this and tick off as you test:

- [ ] Test 1: Register User
- [ ] Test 2: Login
- [ ] Test 3: Get Profile
- [ ] Test 4: Get All Patients
- [ ] Test 5: Get Patient by ID
- [ ] Test 6: Create Patient
- [ ] Test 7: Update Patient
- [ ] Test 8: Get All Doctors
- [ ] Test 9: Get All Specialties
- [ ] Test 10: Get All Appointments
- [ ] Test 11: Get Doctor Schedules
- [ ] Test 12: Get Medical Records
- [ ] Test 13: Missing Token Error
- [ ] Test 14: Invalid Token Error
- [ ] Test 15: Wrong Role Access

---

## 🐛 If Tests Fail

**Check these:**
1. Server running? `http://localhost:5000/api/test` should return `{ "message": "Backend API is working!" }`
2. Token expired? Login again and copy fresh token
3. Database connection? Check MySQL is running
4. Wrong URL? Use exactly `http://localhost:5000`
5. Missing Content-Type? Should be `application/json`

---

**Total Tests:** 15
**Expected Pass Rate:** 100%
**Estimated Duration:** 15-20 minutes

Good luck! 🎉
