const jwt = require('jsonwebtoken');
const { BacSi, TaiKhoan } = require('../models');

const AuthMiddleware = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token không được cung cấp'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // If user is BacSi, fetch their BacSiId from database
      if (decoded.role === 'BacSi') {
        try {
          const account = await TaiKhoan.findByPk(decoded.id);
          if (account && account.NguoiDungId) {
            const doctor = await BacSi.findOne({
              where: { NguoiDungId: account.NguoiDungId }
            });
            if (doctor) {
              req.user.BacSiId = doctor.BacSiId;
            }
          }
        } catch (error) {
          console.error('Error fetching BacSiId:', error);
          // Continue without BacSiId if there's an error
        }
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
  },

  // Check user role
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Không được xác thực'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập tài nguyên này'
        });
      }

      next();
    };
  },

  // Optional token (doesn't fail if no token)
  optionalToken: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
      next();
    } catch (error) {
      next();
    }
  }
};

module.exports = AuthMiddleware;
