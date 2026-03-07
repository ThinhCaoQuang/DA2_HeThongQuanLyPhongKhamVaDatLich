# PowerShell script to test benhnhan API

# Step 1: Register new test user
Write-Host "Step 1: Registering test user..." -ForegroundColor Cyan
$testUsername = "testuser_$(Get-Random)"
$testPassword = "Test@123456"

$registerBody = @{
  tenDangNhap = $testUsername
  matKhau = $testPassword
  hoTen = "Test User"
  email = "test@example.com"
  dienThoai = "0912345678"
} | ConvertTo-Json

try {
  $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerBody
  Write-Host "Register successful, user: $testUsername" -ForegroundColor Green
  Write-Host "Register Response: " -ForegroundColor Yellow
  $registerResponse | ConvertTo-Json | Write-Host
  $token = $registerResponse.token
  Write-Host "Token: $token" -ForegroundColor Green
} catch {
  Write-Host "Register failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# Step 2: Test GET benhnhan
Write-Host "`nStep 2: Testing GET /api/benhnhan..." -ForegroundColor Cyan
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

try {
  $response = Invoke-RestMethod -Uri "http://localhost:5000/api/benhnhan" `
    -Method Get `
    -Headers $headers
  Write-Host "GET Response: " -ForegroundColor Green
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "GET Error: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Step 3: Test POST benhnhan - capture full error details
Write-Host "`nStep 3: Testing POST /api/benhnhan..." -ForegroundColor Cyan
$patientData = @{
  HoTen = "Nguyen Van A"
  DienThoai = "0912345678"
  Email = "test@example.com"
  DiaChi = "123 Nguyen Hue"
} | ConvertTo-Json

Write-Host "Request Body: $patientData" -ForegroundColor Yellow

$uri = "http://localhost:5000/api/benhnhan"
Write-Host "Posting to: $uri" -ForegroundColor Yellow

# Use web request method for better error handling
$request = [System.Net.HttpWebRequest]::Create($uri)
$request.Method = 'POST'
$request.Headers.Add('Authorization', "Bearer $token")
$request.ContentType = 'application/json'

$streamWriter = [System.IO.StreamWriter]::new($request.GetRequestStream())
$streamWriter.Write($patientData)
$streamWriter.Close()

try {
  $response = $request.GetResponse()
  $streamReader = [System.IO.StreamReader]::new($response.GetResponseStream())
  $content = $streamReader.ReadToEnd()
  $streamReader.Close()
  Write-Host "POST Response: " -ForegroundColor Green
  $content | ConvertFrom-Json | ConvertTo-Json | Write-Host
} catch {
  $ex = $_.Exception
  if ($ex.Response) {
    $statusCode = $ex.Response.StatusCode
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    $streamReader = [System.IO.StreamReader]::new($ex.Response.GetResponseStream())
    $errorBody = $streamReader.ReadToEnd()
    $streamReader.Close()
    Write-Host "Response Body: $errorBody" -ForegroundColor Red
  } else {
    Write-Host "Error: $($ex.Message)" -ForegroundColor Red
  }
}
