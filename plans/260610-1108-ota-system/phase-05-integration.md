# Phase 05: Integration & Port Sharing
Status: ✅ Complete
Dependencies: [phase-04-frontend.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-04-frontend.md)

## Objective
Tích hợp Frontend React vào Backend .NET để chạy chung 1 port duy nhất và hỗ trợ routing SPA (Single Page Application).

## Requirements
### Functional
- [x] Cấu hình ASP.NET Core phục vụ tệp tin tĩnh (HTML/JS/CSS) từ thư mục `wwwroot` khi có request truy cập trang chủ.
- [x] Cấu hình fallback routing: Các request không bắt đầu bằng `/api/` hoặc không trỏ đến file tĩnh sẽ tự động trả về `index.html` của React để React Router tự xử lý.
- [x] Viết script build tự động: Build React (`npm run build`), dọn dẹp thư mục `wwwroot` của .NET và sao chép các tệp đã build sang đó.

### Non-Functional
- SPA Fallback hoạt động trơn tru (reload trang không bị lỗi 404).
- Các API endpoints (`/api/*`) vẫn hoạt động bình thường.

## Implementation Steps
1. [x] Cấu hình trong `src/OtaServer.Api/Program.cs` để thêm `app.UseStaticFiles()` và `app.MapFallbackToFile("index.html")`.
2. [x] Tạo file shell script hoặc powershell `build-all.ps1` ở thư mục gốc của dự án để tự động build frontend và copy sang `wwwroot` của backend.
3. [x] Chạy thử kịch bản build chung và kiểm tra truy cập trang admin qua port của backend.

## Files to Create/Modify
- `src/OtaServer.Api/Program.cs` [MODIFY]
- `build-all.ps1` [NEW]

## Test Criteria
- [x] Khi chạy dự án backend và truy cập `http://localhost:<PORT>`, giao diện Admin React hiển thị đầy đủ.
- [x] Khi click chuyển trang (ví dụ sang trang chi tiết dự án) và thực hiện F5 (reload), trang vẫn tải bình thường (không lỗi 404).

---
Next Phase: [phase-06-testing.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-06-testing.md)
