const { LichKham, BenhNhan, BacSi, ChuyenKhoa, TaiKhoan, NguoiDung } = require('../models');

// GET all lịch khám
exports.getAll = async (req, res) => {
  try {
    const lichKhamList = await LichKham.findAll({
      include: [
        {
          model: BenhNhan,
          attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai']
        },
        {
          model: BacSi,
          include: [
            {
              model: NguoiDung,
              attributes: ['HoTen']
            }
          ]
        },
        {
          model: ChuyenKhoa,
          attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
        }
      ],
      order: [['NgayKham', 'DESC']]
    });
    res.json({
      success: true,
      data: lichKhamList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch khám',
      error: error.message
    });
  }
};

// GET lịch khám by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const lichKham = await LichKham.findByPk(id, {
      include: [
        {
          model: BenhNhan,
          attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai']
        },
        {
          model: BacSi,
          include: [
            {
              model: NguoiDung,
              attributes: ['HoTen']
            }
          ]
        },
        {
          model: ChuyenKhoa,
          attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
        }
      ]
    });

    if (!lichKham) {
      return res.status(404).json({
        success: false,
        message: 'Lịch khám không tìm thấy'
      });
    }

    res.json({
      success: true,
      data: lichKham
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lịch khám',
      error: error.message
    });
  }
};

// CREATE lịch khám
exports.create = async (req, res) => {
  try {
    const { MaLichKham, BenhNhanId, BacSiId, ChuyenKhoaId, NgayKham, CaKham, TrieuChung, TaoBoi } = req.body;

    if (!MaLichKham || !BenhNhanId || !BacSiId || !ChuyenKhoaId || !NgayKham || !CaKham) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    const lichKham = await LichKham.create({
      MaLichKham,
      BenhNhanId,
      BacSiId,
      ChuyenKhoaId,
      NgayKham,
      CaKham,
      TrieuChung,
      TaoBoi,
      TrangThai: 'ChoXacNhan'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo lịch khám thành công',
      data: lichKham
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lịch khám',
      error: error.message
    });
  }
};

// UPDATE lịch khám
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const lichKham = await LichKham.findByPk(id);

    if (!lichKham) {
      return res.status(404).json({
        success: false,
        message: 'Lịch khám không tìm thấy'
      });
    }

    await lichKham.update(req.body);

    res.json({
      success: true,
      message: 'Cập nhật lịch khám thành công',
      data: lichKham
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch khám',
      error: error.message
    });
  }
};

// DELETE lịch khám
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const lichKham = await LichKham.findByPk(id);

    if (!lichKham) {
      return res.status(404).json({
        success: false,
        message: 'Lịch khám không tìm thấy'
      });
    }

    await lichKham.destroy();

    res.json({
      success: true,
      message: 'Xóa lịch khám thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch khám',
      error: error.message
    });
  }
};

// Xác nhận lịch khám
exports.confirm = async (req, res) => {
  try {
    const { id } = req.params;
    const { XacNhanBoi } = req.body;

    const lichKham = await LichKham.findByPk(id);

    if (!lichKham) {
      return res.status(404).json({
        success: false,
        message: 'Lịch khám không tìm thấy'
      });
    }

    await lichKham.update({
      TrangThai: 'DaXacNhan',
      XacNhanBoi,
      ThoiGianXacNhan: new Date()
    });

    res.json({
      success: true,
      message: 'Xác nhận lịch khám thành công',
      data: lichKham
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xác nhận lịch khám',
      error: error.message
    });
  }
};

// Hủy lịch khám
exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const { LyDoHuy, HuyBoi } = req.body;

    const lichKham = await LichKham.findByPk(id);

    if (!lichKham) {
      return res.status(404).json({
        success: false,
        message: 'Lịch khám không tìm thấy'
      });
    }

    await lichKham.update({
      TrangThai: 'DaHuy',
      LyDoHuy,
      HuyBoi,
      ThoiGianHuy: new Date()
    });

    res.json({
      success: true,
      message: 'Hủy lịch khám thành công',
      data: lichKham
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy lịch khám',
      error: error.message
    });
  }
};
