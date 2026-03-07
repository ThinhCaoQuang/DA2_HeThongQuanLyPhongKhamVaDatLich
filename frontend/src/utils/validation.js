export const validateBenhNhan = (data) => {
  const errors = {}

  // Validate hoTen
  if (!data.hoTen || !data.hoTen.trim()) {
    errors.hoTen = 'Vui lòng nhập họ tên'
  } else if (data.hoTen.trim().length < 3) {
    errors.hoTen = 'Họ tên phải ít nhất 3 ký tự'
  } else if (data.hoTen.trim().length > 100) {
    errors.hoTen = 'Họ tên không được quá 100 ký tự'
  }

  // Validate dienThoai (REQUIRED)
  if (!data.dienThoai || !data.dienThoai.trim()) {
    errors.dienThoai = 'Vui lòng nhập số điện thoại'
  } else {
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/
    if (!phoneRegex.test(data.dienThoai.trim())) {
      errors.dienThoai = 'Số điện thoại không hợp lệ (vd: 0123456789 hoặc +84123456789)'
    }
  }

  // Validate email
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Email không hợp lệ'
    } else if (data.email.trim().length > 100) {
      errors.email = 'Email không được quá 100 ký tự'
    }
  }

  // Validate diaChi
  if (data.diaChi && data.diaChi.trim().length > 255) {
    errors.diaChi = 'Địa chỉ không được quá 255 ký tự'
  }

  // Validate ngaySinh
  if (!data.ngaySinh || !data.ngaySinh.trim()) {
    errors.ngaySinh = 'Vui lòng nhập ngày sinh'
  } else {
    const birthDate = new Date(data.ngaySinh)
    const currentYear = new Date().getFullYear()
    if (birthDate.getFullYear() > currentYear) {
      errors.ngaySinh = 'Năm sinh không được lớn hơn năm hiện tại'
    }
  }

  // Validate gioiTinh
  if (!data.gioiTinh || !data.gioiTinh.trim()) {
    errors.gioiTinh = 'Vui lòng chọn giới tính'
  }

  // Validate cccd
  if (!data.cccd || !data.cccd.trim()) {
    errors.cccd = 'Vui lòng nhập căn cước công dân'
  } else {
    const cccdRegex = /^[0-9]{12}$/
    if (!cccdRegex.test(data.cccd.trim())) {
      errors.cccd = 'Căn cước công dân phải là 12 số'
    }
  }

  return errors
}

export const validateLichKham = (data) => {
  const errors = {}

  // Validate benhnhanid (required)
  if (!data.benhnhanid) {
    errors.benhnhanid = 'Vui lòng chọn bệnh nhân'
  }

  // Validate chuyenkhoanid (required)
  if (!data.chuyenkhoanid) {
    errors.chuyenkhoanid = 'Vui lòng chọn chuyên khoa'
  }

  // Validate thoigianhatdau (required)
  if (!data.thoigianhatdau) {
    errors.thoigianhatdau = 'Vui lòng chọn thời gian khám'
  } else {
    const appointmentDate = new Date(data.thoigianhatdau)
    const now = new Date()
    // Thời gian khám phải từ 30 phút sau hiện tại
    const minTime = new Date(now.getTime() + 30 * 60000)
    if (appointmentDate < minTime) {
      errors.thoigianhatdau = 'Thời gian khám phải từ 30 phút sau hiện tại'
    }
  }

  // Validate trieuChung (optional but if provided, validate)
  if (data.trieuChung && data.trieuChung.trim().length > 500) {
    errors.trieuChung = 'Triệu chứng không được quá 500 ký tự'
  }

  return errors
}

export const validateAppointment = (data) => {
  const errors = {}

  // Validate benhNhanId (required)
  if (!data.benhNhanId) {
    errors.benhNhanId = 'Vui lòng chọn bệnh nhân'
  }

  // Validate chuyenKhoaId (required)
  if (!data.chuyenKhoaId) {
    errors.chuyenKhoaId = 'Vui lòng chọn chuyên khoa'
  }

  // Validate thoiGianBatDau (required)
  if (!data.thoiGianBatDau) {
    errors.thoiGianBatDau = 'Vui lòng chọn thời gian khám'
  } else {
    const appointmentDate = new Date(data.thoiGianBatDau)
    const now = new Date()
    // Thời gian khám phải từ 30 phút sau hiện tại
    const minTime = new Date(now.getTime() + 30 * 60000)
    if (appointmentDate < minTime) {
      errors.thoiGianBatDau = 'Thời gian khám phải từ 30 phút sau hiện tại'
    }
  }

  // Validate trieuChung (optional but if provided, validate)
  if (data.trieuChung && data.trieuChung.trim().length > 500) {
    errors.trieuChung = 'Triệu chứng không được quá 500 ký tự'
  }

  return errors
}

export const validateBacSi = (data) => {
  const errors = {}

  // Validate hoTen
  if (!data.hoTen || !data.hoTen.trim()) {
    errors.hoTen = 'Vui lòng nhập họ tên'
  } else if (data.hoTen.trim().length < 3) {
    errors.hoTen = 'Họ tên phải ít nhất 3 ký tự'
  } else if (data.hoTen.trim().length > 100) {
    errors.hoTen = 'Họ tên không được quá 100 ký tự'
  }

  // Validate dienThoai (REQUIRED)
  if (!data.dienThoai || !data.dienThoai.trim()) {
    errors.dienThoai = 'Vui lòng nhập số điện thoại'
  } else {
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/
    if (!phoneRegex.test(data.dienThoai.trim())) {
      errors.dienThoai = 'Số điện thoại không hợp lệ'
    }
  }

  // Validate email
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Email không hợp lệ'
    }
  }

  // Validate soChungChi (required)
  if (!data.soChungChi || !data.soChungChi.trim()) {
    errors.soChungChi = 'Vui lòng nhập số chứng chỉ'
  }

  // Validate chuyenKhoaId (required)
  if (!data.chuyenKhoaId) {
    errors.chuyenKhoaId = 'Vui lòng chọn chuyên khoa'
  }

  return errors
}

export const validateMedicalRecord = (data) => {
  const errors = {}

  // Validate trieuChung (required)
  if (!data.trieuChung || !data.trieuChung.trim()) {
    errors.trieuChung = 'Vui lòng nhập triệu chứng'
  } else if (data.trieuChung.trim().length < 5) {
    errors.trieuChung = 'Triệu chứng phải ít nhất 5 ký tự'
  } else if (data.trieuChung.trim().length > 500) {
    errors.trieuChung = 'Triệu chứng không được quá 500 ký tự'
  }

  // Validate chanDoan (required)
  if (!data.chanDoan || !data.chanDoan.trim()) {
    errors.chanDoan = 'Vui lòng nhập chẩn đoán'
  } else if (data.chanDoan.trim().length < 5) {
    errors.chanDoan = 'Chẩn đoán phải ít nhất 5 ký tự'
  } else if (data.chanDoan.trim().length > 500) {
    errors.chanDoan = 'Chẩn đoán không được quá 500 ký tự'
  }

  // Validate keHoachDieuTri (optional but if provided, validate)
  if (data.keHoachDieuTri && data.keHoachDieuTri.trim().length > 1000) {
    errors.keHoachDieuTri = 'Kế hoạch điều trị không được quá 1000 ký tự'
  }

  // Validate ketLuan (optional)
  if (data.ketLuan && data.ketLuan.trim().length > 500) {
    errors.ketLuan = 'Kết luận không được quá 500 ký tự'
  }

  // Validate ghiChu (optional)
  if (data.ghiChu && data.ghiChu.trim().length > 500) {
    errors.ghiChu = 'Ghi chú không được quá 500 ký tự'
  }

  return errors
}

export const validateSchedule = (data, userRole) => {
  const errors = {}

  // For non-BacSi users, validate bacSiId is selected
  // BacSi users don't need to select - it's forced from backend
  if (userRole !== 'BacSi') {
    if (!data.bacSiId || (typeof data.bacSiId === 'string' && !data.bacSiId.trim())) {
      errors.bacSiId = 'Vui lòng chọn bác sĩ'
    }
  }

  // Validate ngayLamViec
  if (!data.ngayLamViec) {
    errors.ngayLamViec = 'Vui lòng chọn ngày làm việc'
  } else {
    const selectedDate = new Date(data.ngayLamViec)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      errors.ngayLamViec = 'Không thể chọn ngày trong quá khứ'
    }
  }

  // Validate caLam
  if (!data.caLam) {
    errors.caLam = 'Vui lòng chọn ca làm'
  }

  // Validate gioBatDau
  if (!data.gioBatDau) {
    errors.gioBatDau = 'Vui lòng nhập giờ bắt đầu'
  }

  // Validate gioKetThuc
  if (!data.gioKetThuc) {
    errors.gioKetThuc = 'Vui lòng nhập giờ kết thúc'
  } else if (data.gioBatDau && data.gioKetThuc <= data.gioBatDau) {
    errors.gioKetThuc = 'Giờ kết thúc phải sau giờ bắt đầu'
  }

  // Validate soBenhNhanToiDa
  if (!data.soBenhNhanToiDa) {
    errors.soBenhNhanToiDa = 'Vui lòng nhập số bệnh nhân tối đa'
  } else if (parseInt(data.soBenhNhanToiDa) < 1) {
    errors.soBenhNhanToiDa = 'Số bệnh nhân tối đa phải >= 1'
  }

  return errors
}

export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0
}

export const getFirstError = (errors) => {
  const keys = Object.keys(errors)
  return keys.length > 0 ? errors[keys[0]] : null
}
