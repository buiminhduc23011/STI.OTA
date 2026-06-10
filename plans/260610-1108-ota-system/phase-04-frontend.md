# Phase 04: Frontend UI Development
Status: ✅ Complete
Dependencies: [phase-03-backend.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-03-backend.md)

## Objective
Xây dựng giao diện Web Admin bằng React, TypeScript và thư viện Ant Design để quản trị toàn bộ hệ thống.

## Requirements
### Functional
- [x] Giao diện Layout chính: Sidebar điều hướng, Header hiển thị thông tin chung.
- [x] Trang danh sách dự án: Hiển thị danh sách dự án, nút tạo dự án mới, chỉnh sửa dự án.
- [x] Trang chi tiết dự án:
  - Tab 1: Cấu hình thiết bị (Allowed Devices) - cho phép thêm danh sách tên máy được quyền tải cập nhật.
  - Tab 2: Quản lý ứng dụng & các phiên bản (App Types & Versions) - giao diện trực quan hiển thị các loại app (Android, AGV, Windows...) và các bản cập nhật đã upload, có nút tải file trực tiếp, nút upload phiên bản mới với progress bar.
- [x] Trang Cài đặt chung (Settings): Cài đặt URL mặc định, Port, Mật khẩu quản trị.

### Non-Functional
- Giao diện đẹp, hiện đại (sử dụng phối màu chuyên nghiệp của Ant Design, hiệu ứng Hover, loading, thông báo thành công/thất bại rõ ràng).
- Tương thích tốt trên màn hình máy tính và thiết bị di động cơ bản.

## Implementation Steps
1. [x] Cấu hình routing cho React bằng `react-router-dom`.
2. [x] Thiết kế `src/frontend/src/layouts/AdminLayout.tsx` với Menu Antd.
3. [x] Viết trang `src/frontend/src/pages/Projects.tsx` quản lý danh sách dự án.
4. [x] Viết trang `src/frontend/src/pages/ProjectDetail.tsx` quản lý chi tiết dự án, chứa form upload file và cấu hình danh sách thiết bị.
5. [x] Viết trang `src/frontend/src/pages/Settings.tsx` cấu hình các tham số hệ thống.
6. [x] Tạo Axios client cấu hình base URL động và xử lý lỗi.

## Files to Create/Modify
- `src/OtaServer.Ui/src/main.tsx` [MODIFY]
- `src/OtaServer.Ui/src/App.tsx` [MODIFY]
- `src/OtaServer.Ui/src/pages/Projects.tsx` [NEW]
- `src/OtaServer.Ui/src/pages/ProjectDetail.tsx` [NEW]
- `src/OtaServer.Ui/src/pages/Settings.tsx` [NEW]
- `src/OtaServer.Ui/src/services/api.ts` [NEW]

## Test Criteria
- [x] Giao diện hiển thị đúng chuẩn Ant Design, các form validate thông tin đầy đủ.
- [x] Gọi mock API hoặc API thực tế mượt mà, hiển thị spinner khi đang load.

---
Next Phase: [phase-05-integration.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-05-integration.md)
