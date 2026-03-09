const bcrypt = require('bcrypt');
const { NguoiDung, TaiKhoan, BacSi, ChuyenKhoa, BacSiChuyenKhoa } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const UserManagementController = {
  // Lấy danh sách người dùng (có filter theo role)
  getAllUsers: async (req, res) => {
    try {
      const { role, status, search, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (role) whereClause.VaiTro = role;
      if (status) whereClause.TrangThai = status;

      const userWhereClause = {};
      if (search) {
        userWhereClause[Op.or] = [
          { HoTen: { [Op.like]: `%${search}%` } },
          { Email: { [Op.like]: `%${search}%` } },
          { DienThoai: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await TaiKhoan.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: NguoiDung,
            as: 'NguoiDung',
            where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
            required: true
          }
        ],
        order: [['CreatedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Lấy thêm thông tin BacSi nếu là bác sĩ
      const usersWithDetails = await Promise.all(
        rows.map(async (account) => {
          const userData = account.toJSON();
          
          if (account.VaiTro === 'BacSi') {
            const bacSi = await BacSi.findOne({
              where: { NguoiDungId: account.NguoiDungId },
              include: [
                {
                  model: ChuyenKhoa,
                  as: 'ChuyenKhoas',
                  through: { attributes: [] }
                }
              ]
            });
            userData.BacSi = bacSi;
          }

          return userData;
        })
      );

      res.status(200).json({
        success: true,
        data: usersWithDetails,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách người dùng',
        error: error.message
      });
    }
  },

  // Lấy chi tiết 1 người dùng
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const account = await TaiKhoan.findByPk(id, {
        include: [
          {
            model: NguoiDung,
            as: 'NguoiDung'
          }
        ]
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      const userData = account.toJSON();

      // Nếu là bác sĩ, lấy thêm thông tin chuyên khoa
      if (account.VaiTro === 'BacSi') {
        const bacSi = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDungId },
          include: [
            {
              model: ChuyenKhoa,
              as: 'ChuyenKhoas',
              through: { attributes: [] }
            }
          ]
        });
        userData.BacSi = bacSi;
      }

      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin người dùng',
        error: error.message
      });
    }
  },

  // Tạo người dùng mới
  createUser: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        // Thông tin cá nhân
        hoTen,
        gioiTinh,
        dienThoai,
        email,
        diaChi,
        thanhPho,
        ngaySinh,
        // Thông tin tài khoản
        tenDangNhap,
        matKhau,
        vaiTro,
        // Thông tin bác sĩ (nếu role = BacSi)
        soChungChi,
        capHocVan,
        namKinhNghiem,
        tieuSu,
        chuyenKhoaIds
      } = req.body;

      // Validate
      if (!hoTen || !tenDangNhap || !matKhau || !vaiTro) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc'
        });
      }

      // Kiểm tra username đã tồn tại
      const existingAccount = await TaiKhoan.findOne({
        where: { TenDangNhap: tenDangNhap }
      });

      if (existingAccount) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại'
        });
      }

      // Tạo NguoiDung
      const nguoiDung = await NguoiDung.create({
        HoTen: hoTen,
        GioiTinh: gioiTinh || 'Khac',
        DienThoai: dienThoai,
        Email: email,
        DiaChi: diaChi,
        ThanhPho: thanhPho,
        NgaySinh: ngaySinh
      }, { transaction });

      // Hash mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(matKhau, salt);

      // Tạo TaiKhoan
      const taiKhoan = await TaiKhoan.create({
        NguoiDungId: nguoiDung.NguoiDungId,
        TenDangNhap: tenDangNhap,
        MatKhauHash: hashedPassword,
        VaiTro: vaiTro,
        TrangThai: 'HoatDong'
      }, { transaction });

      // Nếu là bác sĩ, tạo thêm BacSi
      let bacSi = null;
      if (vaiTro === 'BacSi') {
        if (!soChungChi) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Số chứng chỉ là bắt buộc cho bác sĩ'
          });
        }

        bacSi = await BacSi.create({
          NguoiDungId: nguoiDung.NguoiDungId,
          SoChungChi: soChungChi,
          CapHocVan: capHocVan,
          NamKinhNghiem: namKinhNghiem || 0,
          TieuSu: tieuSu,
          TrangThai: 'HoatDong'
        }, { transaction });

        // Thêm chuyên khoa nếu có
        if (chuyenKhoaIds && chuyenKhoaIds.length > 0) {
          await BacSiChuyenKhoa.bulkCreate(
            chuyenKhoaIds.map(ckId => ({
              BacSiId: bacSi.BacSiId,
              ChuyenKhoaId: ckId
            })),
            { transaction }
          );
        }
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
        data: {
          taiKhoan,
          nguoiDung,
          bacSi
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo người dùng',
        error: error.message
      });
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const {
        // Thông tin cá nhân
        hoTen,
        gioiTinh,
        dienThoai,
        email,
        diaChi,
        thanhPho,
        ngaySinh,
        // Thông tin tài khoản
        vaiTro,
        trangThai,
        // Thông tin bác sĩ
        soChungChi,
        capHocVan,
        namKinhNghiem,
        tieuSu,
        trangThaiBacSi,
        chuyenKhoaIds
      } = req.body;

      const account = await TaiKhoan.findByPk(id, { transaction });
      if (!account) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Cập nhật NguoiDung
      await NguoiDung.update({
        HoTen: hoTen,
        GioiTinh: gioiTinh,
        DienThoai: dienThoai,
        Email: email,
        DiaChi: diaChi,
        ThanhPho: thanhPho,
        NgaySinh: ngaySinh,
        UpdatedAt: new Date()
      }, {
        where: { NguoiDungId: account.NguoiDungId },
        transaction
      });

      // Cập nhật TaiKhoan
      await account.update({
        VaiTro: vaiTro,
        TrangThai: trangThai,
        UpdatedAt: new Date()
      }, { transaction });

      // Cập nhật BacSi nếu là bác sĩ
      if (vaiTro === 'BacSi') {
        const bacSi = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDungId },
          transaction
        });

        if (bacSi) {
          await bacSi.update({
            SoChungChi: soChungChi,
            CapHocVan: capHocVan,
            NamKinhNghiem: namKinhNghiem,
            TieuSu: tieuSu,
            TrangThai: trangThaiBacSi,
            UpdatedAt: new Date()
          }, { transaction });

          // Cập nhật chuyên khoa
          if (chuyenKhoaIds && Array.isArray(chuyenKhoaIds)) {
            // Xóa tất cả chuyên khoa cũ
            await BacSiChuyenKhoa.destroy({
              where: { BacSiId: bacSi.BacSiId },
              transaction
            });

            // Thêm chuyên khoa mới (convert to integer)
            if (chuyenKhoaIds.length > 0) {
              const specialtyIds = chuyenKhoaIds.map(id => parseInt(id) || id).filter(id => id);
              
              if (specialtyIds.length > 0) {
                await BacSiChuyenKhoa.bulkCreate(
                  specialtyIds.map(ckId => ({
                    BacSiId: bacSi.BacSiId,
                    ChuyenKhoaId: ckId
                  })),
                  { transaction }
                );
              }
            }
          }
        }
      }

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: 'Cập nhật người dùng thành công'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật người dùng',
        error: error.message
      });
    }
  },

  // Đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { matKhauMoi } = req.body;

      if (!matKhauMoi || matKhauMoi.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
        });
      }

      const account = await TaiKhoan.findByPk(id);
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(matKhauMoi, salt);

      await account.update({
        MatKhauHash: hashedPassword,
        UpdatedAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi đổi mật khẩu',
        error: error.message
      });
    }
  },

  // Vô hiệu hóa/Kích hoạt tài khoản
  toggleAccountStatus: async (req, res) => {
    try {
      const { id } = req.params;

      const account = await TaiKhoan.findByPk(id);
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
      }

      const newStatus = account.TrangThai === 'HoatDong' ? 'KhongHoatDong' : 'HoatDong';

      await account.update({
        TrangThai: newStatus,
        UpdatedAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: `Đã ${newStatus === 'HoatDong' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
        data: { trangThai: newStatus }
      });
    } catch (error) {
      console.error('Toggle account status error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thay đổi trạng thái tài khoản',
        error: error.message
      });
    }
  },

  // Xóa người dùng
  deleteUser: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;

      const account = await TaiKhoan.findByPk(id, { transaction });
      if (!account) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Kiểm tra xem có thể xóa không (nếu là bác sĩ có lịch khám, không xóa)
      if (account.VaiTro === 'BacSi') {
        const bacSi = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDungId }
        });

        if (bacSi) {
          // Xóa các liên kết chuyên khoa
          await BacSiChuyenKhoa.destroy({
            where: { BacSiId: bacSi.BacSiId },
            transaction
          });

          // Xóa BacSi
          await bacSi.destroy({ transaction });
        }
      }

      // Xóa TaiKhoan
      await account.destroy({ transaction });

      // Xóa NguoiDung
      await NguoiDung.destroy({
        where: { NguoiDungId: account.NguoiDungId },
        transaction
      });

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa người dùng. Có thể người dùng này có dữ liệu liên quan.',
        error: error.message
      });
    }
  }
};

module.exports = UserManagementController;
