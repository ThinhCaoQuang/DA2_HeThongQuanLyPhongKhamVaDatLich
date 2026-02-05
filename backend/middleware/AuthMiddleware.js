const jwt = require('jsonwebtoken');

// Middleware xác thực JWT token
exports.authenticateToken = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp'
      });
    }

    // Xác minh token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token không hợp lệ hoặc hết hạn'
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message
    });
  }
};

// Middleware kiểm tra quyền (Role-based)
exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp'
      });
    }

    if (!roles.includes(req.user.VaiTro)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền. Yêu cầu vai trò: ${roles.join(', ')}`
      });
    }

    next();
  };
};
