# deploy/build-all.ps1
# Script build nhanh giao dien React + backend .NET (khong deploy)
# Co the chay tu: thu muc goc hoac tu thu muc deploy/

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = if ((Split-Path -Leaf $ScriptDir) -eq "deploy") { Split-Path -Parent $ScriptDir } else { $ScriptDir }
Set-Location $ProjectRoot

Write-Host "=============================================" -ForegroundColor Green
Write-Host "OTA SERVER - BAT DAU QUY TRINH BUILD"         -ForegroundColor Green
Write-Host "Project Root: $ProjectRoot"                   -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Green

# 1. Build React UI
Write-Host "`n[1/3] Dang build giao dien React (pnpm)..." -ForegroundColor Cyan
Set-Location -Path "$ProjectRoot\src\OtaServer.Ui"
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi trong qua trinh build UI!" -ForegroundColor Red
    Set-Location $ProjectRoot
    Exit 1
}
Set-Location $ProjectRoot

# 2. Copy UI dist -> wwwroot
Write-Host "`n[2/3] Dang copy file tinh vao wwwroot cua Backend..." -ForegroundColor Cyan
$wwwrootPath = "src\OtaServer.Api\wwwroot"
if (Test-Path -Path $wwwrootPath) {
    Remove-Item -Recurse -Force -Path "$wwwrootPath\*" -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Force -Path $wwwrootPath | Out-Null
}
Copy-Item -Path "src\OtaServer.Ui\dist\*" -Destination $wwwrootPath -Recurse -Force

# 3. Build .NET Backend
Write-Host "`n[3/3] Dang compile Backend .NET (Release)..." -ForegroundColor Cyan
dotnet build src/OtaServer.Api/OtaServer.Api.csproj -c Release

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "BUILD HOAN THANH!"                             -ForegroundColor Green
Write-Host "Chay thu cuc bo: dotnet run --project src/OtaServer.Api" -ForegroundColor Cyan
Write-Host "Deploy len server: .\deploy\deploy-to-server.ps1"        -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Green
