const { BacSi, NguoiDung, BacSiChuyenKhoa, ChuyenKhoa, LichLamViecBacSi } = require('../models');

const BacSiController = {
  // Get all doctors
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, chuyenKhoaId } = req.query;
      const offset = (page - 1) * limit;

      let options = {
        offset,
        limit: parseInt(limit),
        include: [
          { model: NguoiDung, attributes: ['NguoiDungId', 'HoTen', 'DienThoai', 'Email'] },
          {
            model: BacSiChuyenKhoa,
            attributes: ['ChuyenKhoaId', 'LaChuyenMonChinh'],
            include: [
              {
                model: ChuyenKhoa,
                attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
              }
            ]
          }
        ],
        order: [['BacSiId', 'DESC']]
      };

      // Filter by specialty if provided
      if (chuyenKhoaId) {
        options.include[1].where = { ChuyenKhoaId: parseInt(chuyenKhoaId) };
        options.include[1].required = true; // INNER JOIN to only get doctors with this specialty
      }

      const { count, rows } = await BacSi.findAndCountAll(options);

      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get all doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get doctor by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const doctor = await BacSi.findOne({
        where: { BacSiId: id },
        include: [
          { model: NguoiDung },
          {
            model: BacSiChuyenKhoa,
            attributes: ['ChuyenKhoaId', 'LaChuyenMonChinh'],
            include: [
              {
                model: ChuyenKhoa,
                attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
              }
            ]
          },
          { model: LichLamViecBacSi }
        ]
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Bác sĩ không tìm thấy'
        });
      }

      res.status(200).json({
        success: true,
        data: doctor
      });
    } catch (error) {
      console.error('Get doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create doctor
  create: async (req, res) => {
    try {
      const { HoTen, GioiTinh, DienThoai, Email, DiaChi, SoChungChi, CapHocVan, NamKinhNghiem, TieuSu, ChuyenKhoaId } = req.body;

      if (!HoTen || !SoChungChi) {
        return res.status(400).json({
          success: false,
          message: 'Họ tên và số chứng chỉ không được để trống'
        });
      }

      // Check if license number already exists
      const existingDoctor = await BacSi.findOne({
        where: { SoChungChi: SoChungChi }
      });

      if (existingDoctor) {
        return res.status(409).json({
          success: false,
          message: 'Số chứng chỉ đã tồn tại'
        });
      }

      // Create user
      const user = await NguoiDung.create({
        HoTen: HoTen,
        GioiTinh: GioiTinh || 'Khac',
        DienThoai: DienThoai,
        Email: Email,
        DiaChi: DiaChi
      });

      // Create doctor
      const doctor = await BacSi.create({
        NguoiDungId: user.NguoiDungId,
        SoChungChi: SoChungChi,
        CapHocVan: CapHocVan,
        NamKinhNghiem: NamKinhNghiem || 0,
        TieuSu: TieuSu,
        TrangThai: 'HoatDong'
      });

      // Add specialty if provided
      if (ChuyenKhoaId && !isNaN(ChuyenKhoaId)) {
        const chuyenKhoaIdNumber = parseInt(ChuyenKhoaId);
        
        // Verify specialty exists
        const chuyenKhoa = await ChuyenKhoa.findByPk(chuyenKhoaIdNumber);
        if (!chuyenKhoa) {
          return res.status(400).json({
            success: false,
            message: 'Chuyên khoa không tồn tại'
          });
        }
        
        await doctor.addChuyenKhoas([chuyenKhoaIdNumber], { through: { LaChuyenMonChinh: true } });
      }

      // Reload doctor with all relationships
      const createdDoctor = await BacSi.findByPk(doctor.BacSiId, {
        include: [
          { model: NguoiDung },
          {
            model: BacSiChuyenKhoa,
            attributes: ['ChuyenKhoaId', 'LaChuyenMonChinh'],
            include: [
              {
                model: ChuyenKhoa,
                attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Tạo bác sĩ thành công',
        data: createdDoctor
      });
    } catch (error) {
      console.error('Create doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Update doctor
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { HoTen, GioiTinh, DienThoai, Email, DiaChi, SoChungChi, CapHocVan, NamKinhNghiem, TieuSu, TrangThai, ChuyenKhoaId } = req.body;

      const doctor = await BacSi.findByPk(id, {
        include: [
          { model: NguoiDung },
          {
            model: BacSiChuyenKhoa,
            attributes: ['ChuyenKhoaId', 'LaChuyenMonChinh'],
            include: [
              {
                model: ChuyenKhoa,
                attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
              }
            ]
          }
        ]
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Bác sĩ không tìm thấy'
        });
      }

      // Update user info if provided
      if (HoTen || GioiTinh || DienThoai || Email || DiaChi) {
        await doctor.NguoiDung.update({
          HoTen: HoTen || doctor.NguoiDung.HoTen,
          GioiTinh: GioiTinh || doctor.NguoiDung.GioiTinh,
          DienThoai: DienThoai || doctor.NguoiDung.DienThoai,
          Email: Email || doctor.NguoiDung.Email,
          DiaChi: DiaChi || doctor.NguoiDung.DiaChi
        });
      }

      // Update doctor info
      await doctor.update({
        SoChungChi: SoChungChi || doctor.SoChungChi,
        CapHocVan: CapHocVan || doctor.CapHocVan,
        NamKinhNghiem: NamKinhNghiem !== undefined ? NamKinhNghiem : doctor.NamKinhNghiem,
        TieuSu: TieuSu || doctor.TieuSu,
        TrangThai: TrangThai || doctor.TrangThai
      });

      // Update specialty if provided
      if (ChuyenKhoaId && !isNaN(ChuyenKhoaId)) {
        const chuyenKhoaIdNumber = parseInt(ChuyenKhoaId);
        
        // Verify specialty exists
        const chuyenKhoa = await ChuyenKhoa.findByPk(chuyenKhoaIdNumber);
        if (!chuyenKhoa) {
          return res.status(400).json({
            success: false,
            message: 'Chuyên khoa không tồn tại'
          });
        }
        
        // Remove old specialty
        await doctor.setChuyenKhoas([]);
        // Add new specialty (expects array)
        await doctor.addChuyenKhoas([chuyenKhoaIdNumber], { through: { LaChuyenMonChinh: true } });
      }

      // Reload doctor with updated data
      const updatedDoctor = await BacSi.findByPk(id, {
        include: [
          { model: NguoiDung },
          {
            model: BacSiChuyenKhoa,
            attributes: ['ChuyenKhoaId', 'LaChuyenMonChinh'],
            include: [
              {
                model: ChuyenKhoa,
                attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
              }
            ]
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật bác sĩ thành công',
        data: updatedDoctor
      });
    } catch (error) {
      console.error('Update doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete doctor
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const doctor = await BacSi.findByPk(id, {
        include: [{ model: NguoiDung }]
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Bác sĩ không tìm thấy'
        });
      }

      const nguoiDungId = doctor.NguoiDungId;

      // Delete doctor
      await doctor.destroy();

      // Delete associated NguoiDung (user)
      if (nguoiDungId) {
        await NguoiDung.destroy({
          where: { NguoiDungId: nguoiDungId }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Xóa bác sĩ thành công'
      });
    } catch (error) {
      console.error('Delete doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Add specialty to doctor
  addSpecialty: async (req, res) => {
    try {
      const { id } = req.params;
      const { chuyenKhoaId, laChuyenMonChinh = false } = req.body;

      if (!chuyenKhoaId) {
        return res.status(400).json({
          success: false,
          message: 'Chuyên khoa không được để trống'
        });
      }

      const doctor = await BacSi.findByPk(id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Bác sĩ không tìm thấy'
        });
      }

      const specialty = await ChuyenKhoa.findByPk(chuyenKhoaId);
      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: 'Chuyên khoa không tìm thấy'
        });
      }

      // If this is primary specialty, remove primary status from others
      if (laChuyenMonChinh) {
        await BacSiChuyenKhoa.update(
          { LaChuyenMonChinh: false },
          { where: { BacSiId: id } }
        );
      }

      // Add or update specialty
      await BacSiChuyenKhoa.findOrCreate({
        where: { BacSiId: id, ChuyenKhoaId: chuyenKhoaId },
        defaults: { LaChuyenMonChinh: laChuyenMonChinh }
      });

      res.status(200).json({
        success: true,
        message: 'Thêm chuyên khoa thành công'
      });
    } catch (error) {
      console.error('Add specialty error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create BacSi record from existing NguoiDung (for upgrading account to doctor)
  createBacSiFromNguoiDung: async (req, res) => {
    try {
      const { nguoiDungId, soChungChi, capHocVan = 'Chưa cập nhật', namKinhNghiem = 0 } = req.body;

      // Validate input
      if (!nguoiDungId || !soChungChi) {
        return res.status(400).json({
          success: false,
          message: 'NguoiDungId và SoChungChi không được để trống'
        });
      }

      // Check if NguoiDung exists
      const nguoiDung = await NguoiDung.findByPk(nguoiDungId);
      if (!nguoiDung) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      // Check if already a BacSi
      const existingBacSi = await BacSi.findOne({
        where: { NguoiDungId: nguoiDungId }
      });
      if (existingBacSi) {
        return res.status(409).json({
          success: false,
          message: 'Người dùng này đã là bác sĩ'
        });
      }

      // Check if certificate number already exists
      const existingCert = await BacSi.findOne({
        where: { SoChungChi: soChungChi }
      });
      if (existingCert) {
        return res.status(409).json({
          success: false,
          message: 'Số chứng chỉ đã tồn tại'
        });
      }

      // Create BacSi record
      const bacSi = await BacSi.create({
        NguoiDungId: nguoiDungId,
        SoChungChi: soChungChi,
        CapHocVan: capHocVan,
        NamKinhNghiem: namKinhNghiem,
        TrangThai: 'HoatDong'
      });

      res.status(201).json({
        success: true,
        message: 'Tạo bác sĩ từ tài khoản thành công',
        data: bacSi
      });
    } catch (error) {
      console.error('Create BacSi from NguoiDung error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }
};

module.exports = BacSiController;
