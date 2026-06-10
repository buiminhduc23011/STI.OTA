# Phase 03: Backend API Development
Status: ✅ Complete
Dependencies: [phase-02-database.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-02-database.md)

## Objective
Xây dựng các API Endpoint để quản lý dự án, thiết bị, upload phiên bản phần mềm, và API công khai cho các thiết bị check cập nhật / tải xuống.

## Requirements
### Functional
- [x] Dịch vụ quản lý tệp tin (File Storage Service) lưu file cập nhật vào `wwwroot/uploads`.
- [x] Các Controller quản trị:
  - `ProjectsController` (CRUD dự án).
  - `DevicesController` (Thêm/Xóa/Sửa thiết bị được phép theo dự án).
  - `VersionsController` (Upload file cập nhật, lấy lịch sử phiên bản của từng ứng dụng).
- [x] Public API: `/api/ota/check?project={projectCode}&device={deviceName}&app={appType}&version={currentVersion}`
  - Logic check:
    1. Kiểm tra mã dự án (`projectCode`) và loại ứng dụng (`appType`) có tồn tại không.
    2. Kiểm tra tên thiết bị (`deviceName`) có nằm trong danh sách thiết bị được phép cập nhật của dự án đó hay không.
    3. Tìm phiên bản có `versionCode` cao nhất đang được kích hoạt (`IsActive = true`).
    4. Trả về thông tin phiên bản mới nếu `versionCode` lớn hơn của thiết bị gửi lên.
- [x] API lấy file/Tải xuống (Serve file tải về thông qua link tĩnh hoặc Controller stream).

### Non-Functional
- Hỗ trợ lưu trữ file dung lượng lớn (cấu hình Kestrel / IIS limits).
- Trả về thông tin rõ ràng dạng JSON.

## Implementation Steps
1. [x] Tạo thư mục `wwwroot/uploads` để chứa file.
2. [x] Viết `Controllers/ProjectsController.cs` quản lý dự án.
3. [x] Viết `Controllers/DevicesController.cs` quản lý thiết bị được phép theo dự án.
4. [x] Viết `Controllers/VersionsController.cs` xử lý tải lên file (`[FromForm] IFormFile file`) và cập nhật thông tin phiên bản.
5. [x] Viết `Controllers/OtaController.cs` xử lý check update của thiết bị. Cần sinh ra URL tải xuống dựa trên Base URL cấu hình hoặc Host từ Request hiện tại.

## Files to Create/Modify
- `src/OtaServer.Api/Controllers/ProjectsController.cs` [NEW]
- `src/OtaServer.Api/Controllers/DevicesController.cs` [NEW]
- `src/OtaServer.Api/Controllers/VersionsController.cs` [NEW]
- `src/OtaServer.Api/Controllers/OtaController.cs` [NEW]
- `src/OtaServer.Api/Controllers/SystemSettingsController.cs` [NEW]

## Test Criteria
- [x] Sử dụng Postman hoặc swagger để test upload file thành công, file lưu đúng thư mục.
- [x] Test API `/api/ota/check` trả về thông tin bản mới nhất khi điền đúng thông số, trả về lỗi khi thiết bị không được phép hoặc không có bản cập nhật.

---
Next Phase: [phase-04-frontend.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-04-frontend.md)
