import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { useContext } from 'react'
import MainLayout from './components/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BenhNhan from './pages/BenhNhan'
import LichKham from './pages/LichKham'
import BacSi from './pages/BacSi'
import ChuyenKhoa from './pages/ChuyenKhoa'
import ThoiGianLamViec from './pages/ThoiGianLamViec'
import HoSoKhamBenh from './pages/HoSoKhamBenh'
import LichKhamCuaToi from './pages/LichKhamCuaToi'
import NotFound from './pages/NotFound'
import LichKhamHomNayLeTan from './pages/LichKhamHomNayLeTan'
import DieuphoiLichKham from './pages/DieuphoiLichKham'
import DonThuoc from './pages/DonThuoc'
import ThongKeKham from './pages/ThongKeKham'
import LichKhamHomNay from './pages/LichKhamHomNay'
import DoctorPrescriptions from './pages/DoctorPrescriptions'
import ThongBao from './pages/ThongBao'
import ThongKeHuyLich from './pages/ThongKeHuyLich'
import QuanLyNguoiDung from './pages/QuanLyNguoiDung'
import './styles/global.css'

function AppContent() {
  const { isAuthenticated } = useContext(AuthContext)

  return (
    <>
      <Toast />
      <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute requiredRoles={['LeTan', 'BacSi', 'QuanTri', 'QuanLy']}>
            <MainLayout>
              <BenhNhan />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute requiredRoles={['LeTan', 'QuanTri', 'QuanLy']}>
            <MainLayout>
              <LichKham />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules"
        element={
          <ProtectedRoute requiredRoles={['LeTan', 'BacSi', 'QuanTri', 'QuanLy']}>
            <MainLayout>
              <ThoiGianLamViec />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute requiredRoles={['LeTan', 'QuanTri', 'QuanLy']}>
            <MainLayout>
              <BacSi />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/specialties"
        element={
          <ProtectedRoute requiredRoles={['LeTan', 'QuanTri', 'QuanLy']}>
            <MainLayout>
              <ChuyenKhoa />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* TODO: Implement /auth/all-users endpoint
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRoles={['QuanTri']}>
            <MainLayout>
              <Users />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      */}
      <Route
        path="/medical-records"
        element={
          <ProtectedRoute requiredRoles={['BacSi', 'QuanTri', 'QuanLy', 'LeTan']}>
            <MainLayout>
              <HoSoKhamBenh />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute requiredRoles={['BacSi']}>
            <MainLayout>
              <LichKhamCuaToi />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/today-appointments"
        element={
          <ProtectedRoute requiredRoles={['LeTan']}>
            <MainLayout>
              <LichKhamHomNayLeTan />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule-coordination"
        element={
          <ProtectedRoute requiredRoles={['LeTan']}>
            <MainLayout>
              <DieuphoiLichKham />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute requiredRoles={['BacSi', 'LeTan', 'QuanTri', 'QuanLy']}>
            <MainLayout>
              <DonThuoc />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/thong-ke-kham"
        element={
          <ProtectedRoute requiredRoles={['BacSi']}>
            <MainLayout>
              <ThongKeKham />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cancellation-stats"
        element={
          <ProtectedRoute requiredRoles={['QuanTri', 'QuanLy']}>
            <MainLayout>
              <ThongKeHuyLich />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lich-kham-hom-nay"
        element={
          <ProtectedRoute requiredRoles={['BacSi']}>
            <MainLayout>
              <LichKhamHomNay />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-prescriptions"
        element={
          <ProtectedRoute requiredRoles={['BacSi']}>
            <MainLayout>
              <DoctorPrescriptions />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ThongBao />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRoles={['QuanTri']}>
            <MainLayout>
              <QuanLyNguoiDung />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
