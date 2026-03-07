#!/bin/bash

# Generate JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiUXVhblRyaSIsImlhdCI6MTc3MjEwODUwOCwiZXhwIjoxNzcyNzEzMzA4fQ.AmK_oVRBoTg93buBWlBncSG8CVe-RCX4IgZv73gVeh8"

echo "Testing POST /api/bacsi with curl..."

curl -X POST http://localhost:5000/api/bacsi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "HoTen": "Test Curl",
    "SoChungChi": "CURL'$(date +%s)'",
    "DienThoai": "0123456789",
    "Email": "curl@test.com",
    "DiaChi": "Curl Test Address",
    "CapHocVan": "ThacSi",
    "NamKinhNghiem": 5,
    "ChuyenKhoaId": 1
  }'

echo ""
echo "Done"
