const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NguoiDung, TaiKhoan, BacSi } = require('../models');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.TaiKhoanId, username: user.TenDangNhap, role: user.VaiTro },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const AuthController = {
  // Login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập và mật khẩu không được để trống'
        });
      }

      // Find account
      const account = await TaiKhoan.findOne({
        where: { TenDangNhap: username },
        include: [{ model: NguoiDung }]
      });

      if (!account) {
        return res.status(401).json({
          success: false,
          message: 'Tên đăng nhập không tồn tại'
        });
      }

      if (account.TrangThai !== 'HoatDong') {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản bị khóa'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, account.MatKhauHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mật khẩu không đúng'
        });
      }

      // Generate token
      const token = generateToken(account);

      // Build user object
      const userData = {
        TaiKhoanId: account.TaiKhoanId,
        TenDangNhap: account.TenDangNhap,
        VaiTro: account.VaiTro,
        HoTen: account.NguoiDung.HoTen,
        Email: account.NguoiDung.Email,
        DienThoai: account.NguoiDung.DienThoai
      };

      // If user is a doctor, fetch their BacSiId
      if (account.VaiTro === 'BacSi' && account.NguoiDung.NguoiDungId) {
        const doctor = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDung.NguoiDungId }
        });
        if (doctor) {
          userData.BacSiId = doctor.BacSiId;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token,
          user: userData
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Register (Admin only)
  register: async (req, res) => {
    try {
      const { username, password, hoTen, email, dienThoai, vaiTro = 'LeTan', soChungChi, capHocVan, namKinhNghiem } = req.body;

      // Validate input
      if (!username || !password || !hoTen) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập, mật khẩu và họ tên không được để trống'
        });
      }

      // For BacSi, require certificate number
      if (vaiTro === 'BacSi' && !soChungChi) {
        return res.status(400).json({
          success: false,
          message: 'Số chứng chỉ không được để trống cho bác sĩ'
        });
      }

      // Check if username exists
      const existingAccount = await TaiKhoan.findOne({
        where: { TenDangNhap: username }
      });

      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại'
        });
      }

      // Check if certificate number exists (for doctors)
      if (vaiTro === 'BacSi') {
        const existingCert = await BacSi.findOne({
          where: { SoChungChi: soChungChi }
        });
        if (existingCert) {
          return res.status(409).json({
            success: false,
            message: 'Số chứng chỉ đã tồn tại'
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await NguoiDung.create({
        HoTen: hoTen,
        Email: email,
        DienThoai: dienThoai
      });

      // Create account
      const account = await TaiKhoan.create({
        NguoiDungId: user.NguoiDungId,
        TenDangNhap: username,
        MatKhauHash: hashedPassword,
        VaiTro: vaiTro,
        TrangThai: 'HoatDong'
      });

      // If BacSi role, create BacSi record
      if (vaiTro === 'BacSi') {
        await BacSi.create({
          NguoiDungId: user.NguoiDungId,
          SoChungChi: soChungChi,
          CapHocVan: capHocVan || 'Chưa cập nhật',
          NamKinhNghiem: namKinhNghiem || 0,
          TrangThai: 'HoatDong'
        });
      }

      // Generate token
      const token = generateToken(account);

      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data: {
          token,
          user: {
            TaiKhoanId: account.TaiKhoanId,
            TenDangNhap: account.TenDangNhap,
            VaiTro: account.VaiTro,
            HoTen: user.HoTen,
            Email: user.Email,
            DienThoai: user.DienThoai
          }
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const account = await TaiKhoan.findOne({
        where: { TaiKhoanId: req.user.id },
        include: [{ model: NguoiDung }]
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Tài khoản không tìm thấy'
        });
      }

      const userData = {
        TaiKhoanId: account.TaiKhoanId,
        NguoiDungId: account.NguoiDungId,
        TenDangNhap: account.TenDangNhap,
        VaiTro: account.VaiTro,
        HoTen: account.NguoiDung.HoTen,
        Email: account.NguoiDung.Email,
        DienThoai: account.NguoiDung.DienThoai,
        DiaChi: account.NguoiDung.DiaChi
      };

      // If user is a doctor, fetch their BacSiId
      if (account.VaiTro === 'BacSi' && account.NguoiDung.NguoiDungId) {
        const doctor = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDung.NguoiDungId }
        });
        if (doctor) {
          userData.BacSiId = doctor.BacSiId;
        }
      }

      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu cũ và mật khẩu mới không được để trống'
        });
      }

      const account = await TaiKhoan.findOne({
        where: { TaiKhoanId: req.user.id }
      });

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, account.MatKhauHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mật khẩu cũ không đúng'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await account.update({ MatKhauHash: hashedPassword });

      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }
};

module.exports = AuthController;
