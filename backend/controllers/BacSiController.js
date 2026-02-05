const { BacSi, NguoiDung, BacSiChuyenKhoa, ChuyenKhoa } = require('../models');

// GET all bác sĩ
exports.getAll = async (req, res) => {
  try {
    const bacSiList = await BacSi.findAll({
      include: [
        {
          model: NguoiDung,
          attributes: ['NguoiDungId', 'HoTen', 'DienThoai', 'Email']
        },
        {
          model: BacSiChuyenKhoa,
          include: [
            {
              model: ChuyenKhoa,
              attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
            }
          ]
        }
      ],
      order: [['CreatedAt', 'DESC']]
    });
    res.json({
      success: true,
      data: bacSiList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bác sĩ',
      error: error.message
    });
  }
};

// GET bác sĩ by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const bacSi = await BacSi.findByPk(id, {
      include: [
        {
          model: NguoiDung,
          attributes: ['NguoiDungId', 'HoTen', 'DienThoai', 'Email']
        },
        {
          model: BacSiChuyenKhoa,
          include: [
            {
              model: ChuyenKhoa,
              attributes: ['ChuyenKhoaId', 'TenChuyenKhoa']
            }
          ]
        }
      ]
    });

    if (!bacSi) {
      return res.status(404).json({
        success: false,
        message: 'Bác sĩ không tìm thấy'
      });
    }

    res.json({
      success: true,
      data: bacSi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin bác sĩ',
      error: error.message
    });
  }
};

// UPDATE bác sĩ
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const bacSi = await BacSi.findByPk(id);

    if (!bacSi) {
      return res.status(404).json({
        success: false,
        message: 'Bác sĩ không tìm thấy'
      });
    }

    await bacSi.update(req.body);

    res.json({
      success: true,
      message: 'Cập nhật thông tin bác sĩ thành công',
      data: bacSi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật bác sĩ',
      error: error.message
    });
  }
};

// DELETE bác sĩ
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const bacSi = await BacSi.findByPk(id);

    if (!bacSi) {
      return res.status(404).json({
        success: false,
        message: 'Bác sĩ không tìm thấy'
      });
    }

    await bacSi.destroy();

    res.json({
      success: true,
      message: 'Xóa bác sĩ thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bác sĩ',
      error: error.message
    });
  }
};
