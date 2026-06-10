# deploy/deploy-to-server.ps1
# Script tu dong build va deploy STI.OTA len Server Linux thong qua SSH/SCP
# Co the chay tu: thu muc goc hoac tu thu muc deploy/

# --- Tu dong tim thu muc goc du an ---
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = if ((Split-Path -Leaf $ScriptDir) -eq "deploy") { Split-Path -Parent $ScriptDir } else { $ScriptDir }
Set-Location $ProjectRoot

$IP         = "103.179.190.33"
$USER       = "root"
$PORT       = "2016"
$REMOTE_DIR = "/opt/ota-server"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "KHOI CHAY TIEN TRINH TU DONG BUILD & DEPLOY OTA SERVER"     -ForegroundColor Green
Write-Host "Server Target: $USER@$IP"                                    -ForegroundColor Green
Write-Host "Port Target  : $PORT"                                        -ForegroundColor Green
Write-Host "Project Root : $ProjectRoot"                                 -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

# Step 1: Kiem tra port tren remote server
Write-Host "`n[1/5] Dang kiem tra trang thai port $PORT tren remote server..." -ForegroundColor Cyan
Write-Host "Vui long nhap mat khau root neu duoc yeu cau (MK: Q0sCdAIL4n88pB3r)" -ForegroundColor Yellow

$portCheck = ssh -o StrictHostKeyChecking=no "$USER@$IP" "ss -tulpn | grep :$PORT" 2>$null

if ($portCheck) {
    # Join thanh 1 chuoi de tranh loi khi SSH tra ve mang nhieu dong
    $portCheckStr = ($portCheck | Out-String)

    # Neu port dang dung boi chinh dich vu ota-server -> stop roi deploy lai (binh thuong khi update)
    if ($portCheckStr -match "OtaServer" -or $portCheckStr -match "ota-server") {
        Write-Host "[OK] Port $PORT dang dung boi ota-server. Tu dong dung service de deploy lai..." -ForegroundColor Green
        ssh -o StrictHostKeyChecking=no "$USER@$IP" "systemctl stop ota-server" 2>$null
        Start-Sleep -Seconds 2
    } else {
        Write-Host "[CANH BAO] Port $PORT dang bi chiem boi mot dich vu KHAC:" -ForegroundColor Red
        Write-Host $portCheck -ForegroundColor Red
        $choice = Read-Host "Ban co muon tiep tuc ghi de khong? (y/n)"
        if ($choice -ne "y") {
            Write-Host "Da huy qua trinh deploy." -ForegroundColor Yellow
            Exit 1
        }
    }
} else {
    Write-Host "[OK] Port $PORT hoan toan ranh roi." -ForegroundColor Green
}

# Step 2: Build React UI + publish .NET
Write-Host "`n[2/5] Dang build giao dien React va publish backend .NET..." -ForegroundColor Cyan

# Build frontend
Set-Location -Path "$ProjectRoot\src\OtaServer.Ui"
pnpm run build
if ($LASTEXITCODE -ne 0) { Write-Host "[LOI] Build UI that bai!" -ForegroundColor Red; Exit 1 }
Set-Location $ProjectRoot

# Copy UI vao wwwroot
$wwwroot = "src\OtaServer.Api\wwwroot"
if (Test-Path $wwwroot) { Remove-Item -Recurse -Force "$wwwroot\*" -ErrorAction SilentlyContinue }
else { New-Item -ItemType Directory -Force -Path $wwwroot | Out-Null }
Copy-Item -Path "src\OtaServer.Ui\dist\*" -Destination $wwwroot -Recurse -Force

# Publish .NET self-contained linux-x64
dotnet publish src/OtaServer.Api/OtaServer.Api.csproj -c Release -r linux-x64 --self-contained -o dist/linux-x64
if ($LASTEXITCODE -ne 0) { Write-Host "[LOI] Publish .NET that bai!" -ForegroundColor Red; Exit 1 }
Write-Host "[OK] Build & Publish thanh cong." -ForegroundColor Green

# Step 3: Copy len server (bao ve thu muc uploads/ chua APK da upload)
Write-Host "`n[3/5] Dang sao chep file len server (SCP)..." -ForegroundColor Cyan
ssh  -o StrictHostKeyChecking=no "$USER@$IP" "mkdir -p $REMOTE_DIR"

# Backup thu muc uploads tren server truoc khi ghi de
Write-Host "  [*] Backup thu muc uploads tren server..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no "$USER@$IP" @"
  if [ -d $REMOTE_DIR/wwwroot/uploads ]; then
    cp -r $REMOTE_DIR/wwwroot/uploads /tmp/ota_uploads_backup
    echo '[OK] Da backup uploads.'
  else
    echo '[INFO] Chua co thu muc uploads, bo qua backup.'
  fi
"@

# SCP toan bo binary + wwwroot moi (chua APK cu bi xoa)
scp  -o StrictHostKeyChecking=no -r dist/linux-x64/* "${USER}@${IP}:${REMOTE_DIR}/"
if ($LASTEXITCODE -ne 0) { Write-Host "[LOI] SCP that bai!" -ForegroundColor Red; Exit 1 }

# Khoi phuc thu muc uploads tu backup
Write-Host "  [*] Khoi phuc thu muc uploads..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no "$USER@$IP" @"
  if [ -d /tmp/ota_uploads_backup ]; then
    mkdir -p $REMOTE_DIR/wwwroot/uploads
    cp -rn /tmp/ota_uploads_backup/. $REMOTE_DIR/wwwroot/uploads/
    rm -rf /tmp/ota_uploads_backup
    echo '[OK] Da khoi phuc uploads thanh cong.'
  fi
"@

Write-Host "[OK] Da copy xong toan bo file (uploads duoc bao toan)." -ForegroundColor Green

# Step 4: Cau hinh Systemd service
Write-Host "`n[4/5] Dang cap nhat Systemd service..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no "$USER@$IP" "chmod +x $REMOTE_DIR/OtaServer.Api"

$serviceContent = @"
[Unit]
Description=STI OTA Update Server
After=network.target

[Service]
WorkingDirectory=$REMOTE_DIR
ExecStart=$REMOTE_DIR/OtaServer.Api
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=ota-server
User=root
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://*:2016

[Install]
WantedBy=multi-user.target
"@

$tmpFile = Join-Path $ProjectRoot "deploy\service.tmp"
$serviceContent | Out-File -FilePath $tmpFile -Encoding utf8
scp -o StrictHostKeyChecking=no $tmpFile "${USER}@${IP}:/etc/systemd/system/ota-server.service"
Remove-Item $tmpFile

# Step 5: Restart service
Write-Host "`n[5/5] Dang khoi dong lai ota-server..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no "$USER@$IP" "systemctl daemon-reload && systemctl enable ota-server && systemctl restart ota-server"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "DEPLOY HOAN THANH CONG!"                                      -ForegroundColor Green
Write-Host "Ung dung dang chay tai: http://${IP}:${PORT}"                 -ForegroundColor Green
Write-Host "Kiem tra: ssh root@$IP 'systemctl status ota-server'"          -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
