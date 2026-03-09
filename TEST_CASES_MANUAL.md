# CLINIC API - MANUAL TEST CASES

## Test Plan

Server: `http://localhost:5000`
Database: MySQL (QuanLyPhongKham)
Auth: JWT Bearer Token

---

## TEST CASE 1: Authentication - Register New User

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

**Test Pass If:**
- Status = 201
- success = true
- Token được trả về

---

## TEST CASE 2: Authentication - Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "test456",
  "password": "Test@123"
}
```

**Expected Response:** `200 OK`

**Test Pass If:**
- Status = 200
- Token received
- User info matches login credentials

---

## TEST CASE 3: Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Test Pass If:**
- Status = 200
- Returns user profile

---

## TEST CASE 4: Get All Patients

**Endpoint:** `GET /api/benhnhan`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Test Pass If:**
- Status = 200
- Returns array of patients
- Contains at least 1 patient

---

## TEST CASE 5: Get Patient By ID

**Endpoint:** `GET /api/benhnhan/1`

**Test Pass If:**
- Status = 200
- Returns patient object

---

## TEST CASE 6: Create New Patient

**Endpoint:** `POST /api/benhnhan`

**Test Pass If:**
- Status = 201
- Patient created with auto-generated code

---

## TEST CASE 7: Update Patient

**Endpoint:** `PUT /api/benhnhan/5`

**Test Pass If:**
- Status = 200
- Updated fields reflect in response

---

## TEST CASE 8: Get All Doctors

**Endpoint:** `GET /api/bacsi`

**Test Pass If:**
- Status = 200
- Returns doctors array

---

## TEST CASE 9: Get All Specialties

**Endpoint:** `GET /api/chuyenkhoa`

**Test Pass If:**
- Status = 200
- Returns specialties

---

## TEST CASE 10: Get All Appointments

**Endpoint:** `GET /api/lichkham`

**Test Pass If:**
- Status = 200
- Returns appointments

---

## TEST CASE 11: Get Doctor Schedules

**Endpoint:** `GET /api/lichlamviec`

**Test Pass If:**
- Status = 200
- Returns schedules

---

## TEST CASE 12: Get Medical Records

**Endpoint:** `GET /api/hosokhambenh`

**Test Pass If:**
- Status = 200
- Returns records

---

## TEST CASE 13: Authentication Bug - Missing Token

**Endpoint:** `GET /api/benhnhan`

**Expected Response:** `401 Unauthorized`

**Test Pass If:**
- Status = 401
- Error message appears

---

## TEST CASE 14: Invalid Token

**Endpoint:** `GET /api/benhnhan`

**Headers:**
```
Authorization: Bearer invalid_token
```

**Expected Response:** `401 Unauthorized`

**Test Pass If:**
- Status = 401

---

## TEST CASE 15: Access Control - Wrong Role

**Endpoint:** `POST /api/chuyenkhoa`

**Expected Response:** `403 Forbidden`

**Test Pass If:**
- Status = 403
- Access denied

---

## TEST SUMMARY CHECKLIST

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

**Total Tests:** 15
**Expected Pass Rate:** 100%
**Estimated Duration:** 15-20 minutes
