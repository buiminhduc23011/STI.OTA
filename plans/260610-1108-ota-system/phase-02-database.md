# Phase 02: Database Schema (EF Core & SQLite)
Status: ✅ Complete
Dependencies: [phase-01-setup.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-01-setup.md)

## Objective
Thiết lập cơ sở dữ liệu SQLite và cấu hình Entity Framework Core trong backend .NET để quản lý dữ liệu.

## Requirements
### Functional
- [x] Cài đặt các thư viện EF Core cho SQLite (`Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.EntityFrameworkCore.Design`).
- [x] Thiết kế các thực thể (Entities): `Project`, `AllowedDevice`, `AppVersion`.
- [x] Tạo database context `OtaDbContext`.
- [x] Tạo bản migration đầu tiên và áp dụng vào cơ sở dữ liệu SQLite.

### Non-Functional
- SQLite database được lưu ở thư mục gốc của ứng dụng backend (ví dụ: `ota.db`).
- Entity relationships rõ ràng (1 Project có nhiều AllowedDevice, 1 Project có nhiều AppVersion).

## Implementation Steps
1. [x] Cài đặt các package NuGet cần thiết vào dự án `OtaServer.Api`.
2. [x] Tạo thư mục `Models` và định nghĩa các class `Project.cs`, `AllowedDevice.cs`, `AppVersion.cs`.
3. [x] Tạo class `Data/OtaDbContext.cs` cấu hình các bảng và quan hệ giữa chúng.
4. [x] Cấu hình Connection String trỏ tới file SQLite (`DataSource=ota.db`) trong `appsettings.json` và cấu hình DbContext trong `Program.cs`.
5. [x] Tạo migration: `dotnet ef migrations add InitialCreate --project src/OtaServer.Api` (hoặc chạy qua CLI).
6. [x] Chạy migration để sinh file database `ota.db`: `dotnet ef database update --project src/OtaServer.Api`.

## Files to Create/Modify
- `src/OtaServer.Api/Models/Project.cs` [NEW]
- `src/OtaServer.Api/Models/AllowedDevice.cs` [NEW]
- `src/OtaServer.Api/Models/AppVersion.cs` [NEW]
- `src/OtaServer.Api/Data/OtaDbContext.cs` [NEW]
- `src/OtaServer.Api/appsettings.json` [MODIFY]
- `src/OtaServer.Api/Program.cs` [MODIFY]

## Test Criteria
- [x] File SQLite `ota.db` được sinh ra tự động khi chạy ứng dụng.
- [x] Có thể kết nối và truy vấn thử vào cơ sở dữ liệu.

---
Next Phase: [phase-03-backend.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-03-backend.md)
