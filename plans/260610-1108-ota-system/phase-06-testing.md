# Phase 06: Testing & Cross-Platform Deployment
Status: ✅ Complete
Dependencies: [phase-05-integration.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-05-integration.md)

## Objective
Biên dịch dự án thành 2 dạng Windows và Linux, chạy thử nghiệm hệ thống hoàn chỉnh và hướng dẫn cài đặt lên máy chủ Linux.

## Requirements
### Functional
- [x] Xây dựng script biên dịch .NET Core thành package chạy trên Linux (Self-contained, không cần cài .NET runtime trên host) và Windows.
- [x] Chạy thử file thực thi và cấu hình biến môi trường để tùy biến Port và Base URL (Ví dụ: `ASPNETCORE_URLS=http://*:2016` và `OtaSettings__BaseUrl=http://mes.stivietnam.com:2016`).
- [x] Tạo file hướng dẫn cấu hình và chạy dạng Service (systemd) trên máy chủ Linux.

### Non-Functional
- Ứng dụng chạy nhẹ nhàng, chiếm ít tài nguyên hệ thống.
- Khởi động nhanh và tự động chạy lại khi server Linux restart.

## Implementation Steps
1. [x] Viết lệnh biên dịch Windows: `dotnet publish src/OtaServer.Api/OtaServer.Api.csproj -c Release -r win-x64 --self-contained true -o dist/win-x64`.
2. [x] Viết lệnh biên dịch Linux: `dotnet publish src/OtaServer.Api/OtaServer.Api.csproj -c Release -r linux-x64 --self-contained true -o dist/linux-x64`.
3. [x] Viết file hướng dẫn `deploy-linux.md` bao gồm:
   - Cách tạo service Systemd để chạy nền trên Linux.
   - Cách cấu hình port (ví dụ 2016) và cấu hình Nginx proxy nếu cần.
   - Cấu hình file `appsettings.json` cho đường dẫn URL tĩnh.

## Files to Create/Modify
- `deploy-linux.md` [NEW]
- `src/OtaServer.Api/appsettings.json` [MODIFY]

## Test Criteria
- [x] File thực thi trên Linux có thể chạy bằng lệnh `./OtaServer.Api` (sau khi chmod +x) và phục vụ bình thường trên cổng cấu hình.
- [x] Thử nghiệm tải phiên bản phần mềm lên và tải xuống qua API kiểm tra cập nhật trên Linux thành công.
