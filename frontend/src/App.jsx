import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BacSi from './pages/BacSi';
import ChuyenKhoa from './pages/ChuyenKhoa';
import LichKham from './pages/LichKham';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bacsi" element={<BacSi />} />
        <Route path="/chuyenkhoa" element={<ChuyenKhoa />} />
        <Route path="/lichkham" element={<LichKham />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
