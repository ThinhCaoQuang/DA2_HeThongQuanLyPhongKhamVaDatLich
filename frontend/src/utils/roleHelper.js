export const getRoleDisplayName = (role) => {
  const roleMap = {
    LeTan: 'Lễ tân',
    BacSi: 'Bác sĩ',
    QuanTri: 'Quản trị viên',
  }
  return roleMap[role] || role
}
