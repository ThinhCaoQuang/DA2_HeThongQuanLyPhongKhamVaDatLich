const { ChuyenKhoa } = require('../models');

// GET all chuyên khoa
exports.getAll = async (req, res) => {
  try {
    const chuyenKhoaList = await ChuyenKhoa.findAll({
      where: { TrangThai: 'HoatDong' },
      order: [['CreatedAt', 'DESC']]
    });
    res.json({
      success: true,
      data: chuyenKhoaList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chuyên khoa',
      error: error.message
    });
  }
};

// GET chuyên khoa by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const chuyenKhoa = await ChuyenKhoa.findByPk(id);
    
    if (!chuyenKhoa) {
      return res.status(404).json({
        success: false,
        message: 'Chuyên khoa không tìm thấy'
      });
    }

    res.json({
      success: true,
      data: chuyenKhoa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin chuyên khoa',
      error: error.message
    });
  }
};

// CREATE chuyên khoa
exports.create = async (req, res) => {
  try {
    const { TenChuyenKhoa, MoTa } = req.body;

    if (!TenChuyenKhoa) {
      return res.status(400).json({
        success: false,
        message: 'Tên chuyên khoa là bắt buộc'
      });
    }

    const chuyenKhoa = await ChuyenKhoa.create({
      TenChuyenKhoa,
      MoTa
    });

    res.status(201).json({
      success: true,
      message: 'Tạo chuyên khoa thành công',
      data: chuyenKhoa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo chuyên khoa',
      error: error.message
    });
  }
};

// UPDATE chuyên khoa
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const chuyenKhoa = await ChuyenKhoa.findByPk(id);

    if (!chuyenKhoa) {
      return res.status(404).json({
        success: false,
        message: 'Chuyên khoa không tìm thấy'
      });
    }

    await chuyenKhoa.update(req.body);

    res.json({
      success: true,
      message: 'Cập nhật chuyên khoa thành công',
      data: chuyenKhoa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật chuyên khoa',
      error: error.message
    });
  }
};

// DELETE chuyên khoa
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const chuyenKhoa = await ChuyenKhoa.findByPk(id);

    if (!chuyenKhoa) {
      return res.status(404).json({
        success: false,
        message: 'Chuyên khoa không tìm thấy'
      });
    }

    await chuyenKhoa.destroy();

    res.json({
      success: true,
      message: 'Xóa chuyên khoa thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa chuyên khoa',
      error: error.message
    });
  }
};
