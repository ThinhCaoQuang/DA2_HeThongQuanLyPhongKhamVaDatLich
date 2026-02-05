const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NguoiDung, TaiKhoan } = require('../models');

// REGISTER
exports.register = async (req, res) => {
  try {
    // Accept both camelCase and PascalCase
    const { HoTen, hoTen, Email, email, DienThoai, soDienThoai, GioiTinh, gioiTinh, TenDangNhap, tenDangNhap, MatKhau, matKhau, VaiTro, vaiTro } = req.body;
    
    const finalHoTen = HoTen || hoTen;
    const finalEmail = Email || email;
    const finalDienThoai = DienThoai || soDienThoai;
    const finalGioiTinh = GioiTinh || gioiTinh;
    const finalTenDangNhap = TenDangNhap || tenDangNhap;
    const finalMatKhau = MatKhau || matKhau;
    const finalVaiTro = VaiTro || vaiTro;

    // Validation
    if (!finalHoTen || !finalTenDangNhap || !finalMatKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp hoTen, tenDangNhap, matKhau'
      });
    }

    // Check nếu username đã tồn tại
    const existingUser = await TaiKhoan.findOne({
      where: { TenDangNhap: finalTenDangNhap }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(finalMatKhau, salt);

    // Tạo NguoiDung
    const nguoiDung = await NguoiDung.create({
      HoTen: finalHoTen,
      Email: finalEmail,
      DienThoai: finalDienThoai,
      GioiTinh: finalGioiTinh || 'Nam'
    });

    // Tạo TaiKhoan
    const taiKhoan = await TaiKhoan.create({
      NguoiDungId: nguoiDung.NguoiDungId,
      TenDangNhap: finalTenDangNhap,
      MatKhauHash: hashedPassword,
      VaiTro: finalVaiTro || 'LeTan',
      TrangThai: 'HoatDong'
    });

    // Tạo JWT token
    const token = jwt.sign(
      {
        TaiKhoanId: taiKhoan.TaiKhoanId,
        TenDangNhap: taiKhoan.TenDangNhap,
        VaiTro: taiKhoan.VaiTro
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        TaiKhoanId: taiKhoan.TaiKhoanId,
        TenDangNhap: taiKhoan.TenDangNhap,
        VaiTro: taiKhoan.VaiTro,
        HoTen: nguoiDung.HoTen
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký',
      error: error.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    // Accept both camelCase and PascalCase
    const { TenDangNhap, tenDangNhap, MatKhau, matKhau } = req.body;
    
    const finalTenDangNhap = TenDangNhap || tenDangNhap;
    const finalMatKhau = MatKhau || matKhau;

    // Validation
    if (!finalTenDangNhap || !finalMatKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tenDangNhap và matKhau'
      });
    }

    // Tìm tài khoản
    const taiKhoan = await TaiKhoan.findOne({
      where: { TenDangNhap: finalTenDangNhap },
      include: [
        {
          model: NguoiDung,
          attributes: ['NguoiDungId', 'HoTen', 'Email', 'DienThoai']
        }
      ]
    });

    if (!taiKhoan) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(finalMatKhau, taiKhoan.MatKhauHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra trạng thái
    if (taiKhoan.TrangThai !== 'HoatDong') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        TaiKhoanId: taiKhoan.TaiKhoanId,
        TenDangNhap: taiKhoan.TenDangNhap,
        VaiTro: taiKhoan.VaiTro
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        TaiKhoanId: taiKhoan.TaiKhoanId,
        TenDangNhap: taiKhoan.TenDangNhap,
        VaiTro: taiKhoan.VaiTro,
        HoTen: taiKhoan.NguoiDung.HoTen,
        Email: taiKhoan.NguoiDung.Email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng nhập',
      error: error.message
    });
  }
};

// GET CURRENT USER (dùng token)
exports.getCurrentUser = async (req, res) => {
  try {
    const TaiKhoanId = req.user.TaiKhoanId;

    const taiKhoan = await TaiKhoan.findByPk(TaiKhoanId, {
      include: [
        {
          model: NguoiDung,
          attributes: ['NguoiDungId', 'HoTen', 'Email', 'DienThoai', 'GioiTinh', 'NgaySinh']
        }
      ],
      attributes: { exclude: ['MatKhauHash'] }
    });

    if (!taiKhoan) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tìm thấy'
      });
    }

    res.json({
      success: true,
      data: taiKhoan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

// LOGOUT (chỉ để cho API, client tự xóa token)
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công. Vui lòng xóa token trên client.'
  });
};
