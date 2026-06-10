# Phase 01: Project Setup
Status: ✅ Complete
Dependencies: None

## Objective
Thiết lập môi trường phát triển cho cả Backend (.NET 8.0 Web API) và Frontend (React + TypeScript + Vite + Ant Design), sao cho cấu trúc sạch sẽ và sẵn sàng kết hợp.

## Requirements
### Functional
- [x] Khởi tạo ứng dụng .NET 8.0 Web API.
- [x] Khởi tạo ứng dụng React TypeScript sử dụng Vite.
- [x] Cài đặt các thư viện thiết yếu (Ant Design, Axios, Lucide React,...).
- [x] Lưu trữ sao lưu mã nguồn cũ (Node.js/Express) vào thư mục backup để tránh mất mát.

### Non-Functional
- Cấu trúc thư mục ngăn nắp, dễ quản lý:
  - `/src/OtaServer.Api` (Backend)
  - `/src/OtaServer.Ui` (Frontend)

## Implementation Steps
1. [x] Backup mã nguồn Node.js cũ trong `src` sang `backup_express_server/`.
2. [x] Tạo project .NET Web API bằng command: `dotnet new webapi -o src/OtaServer.Api`.
3. [x] Tạo project React TS bằng command: `npx -y create-vite@latest src/OtaServer.Ui --template react-ts`.
4. [x] Cài đặt các package cần thiết cho UI (`antd`, `@ant-design/icons`, `axios`, `react-router-dom`).
5. [x] Tạo tập lệnh build tự động hoặc kiểm thử chạy độc lập của 2 phần.

## Files to Create/Modify
- `src/OtaServer.Api/OtaServer.Api.csproj` [NEW]
- `src/OtaServer.Ui/package.json` [NEW]

## Test Criteria
- [x] Backend khởi động thành công và truy cập được Swagger UI / OpenAPI spec.
- [x] Frontend chạy dev mode thành công với Vite.

---
Next Phase: [phase-02-database.md](file:///c:/Users/ducbu/Documents/GitHub/STI.OTA/plans/260610-1108-ota-system/phase-02-database.md)
