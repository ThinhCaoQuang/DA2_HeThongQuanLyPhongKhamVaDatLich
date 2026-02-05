const { BenhNhan } = require('../models');

// GET all bệnh nhân
exports.getAll = async (req, res) => {
  try {
    const benhNhanList = await BenhNhan.findAll({
      order: [['CreatedAt', 'DESC']]
    });
    res.json({
      success: true,
      data: benhNhanList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bệnh nhân',
      error: error.message
    });
  }
};

// GET bệnh nhân by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const benhNhan = await BenhNhan.findByPk(id);
    
    if (!benhNhan) {
      return res.status(404).json({
        success: false,
        message: 'Bệnh nhân không tìm thấy'
      });
    }

    res.json({
      success: true,
      data: benhNhan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin bệnh nhân',
      error: error.message
    });
  }
};

// CREATE bệnh nhân
exports.create = async (req, res) => {
  try {
    const { MaBenhNhan, HoTen, NgaySinh, GioiTinh, DienThoai, Email, DiaChi, ThanhPho } = req.body;

    // Validation
    if (!MaBenhNhan || !HoTen) {
      return res.status(400).json({
        success: false,
        message: 'Mã bệnh nhân và họ tên là bắt buộc'
      });
    }

    const benhNhan = await BenhNhan.create({
      MaBenhNhan,
      HoTen,
      NgaySinh,
      GioiTinh,
      DienThoai,
      Email,
      DiaChi,
      ThanhPho
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bệnh nhân thành công',
      data: benhNhan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo bệnh nhân',
      error: error.message
    });
  }
};

// UPDATE bệnh nhân
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const benhNhan = await BenhNhan.findByPk(id);

    if (!benhNhan) {
      return res.status(404).json({
        success: false,
        message: 'Bệnh nhân không tìm thấy'
      });
    }

    await benhNhan.update(req.body);

    res.json({
      success: true,
      message: 'Cập nhật bệnh nhân thành công',
      data: benhNhan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật bệnh nhân',
      error: error.message
    });
  }
};

// DELETE bệnh nhân
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const benhNhan = await BenhNhan.findByPk(id);

    if (!benhNhan) {
      return res.status(404).json({
        success: false,
        message: 'Bệnh nhân không tìm thấy'
      });
    }

    await benhNhan.destroy();

    res.json({
      success: true,
      message: 'Xóa bệnh nhân thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bệnh nhân',
      error: error.message
    });
  }
};
