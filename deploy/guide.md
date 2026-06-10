# 🚀 Hướng dẫn Deploy — STI OTA Server

Thư mục này chứa toàn bộ công cụ build & deploy hệ thống STI OTA Server.

---

## 📁 Cấu trúc thư mục

```
deploy/
├── guide.md               ← Tài liệu này
├── deploy-to-server.ps1   ← Script tự động build + deploy lên server Linux
├── build-all.ps1          ← Script chỉ build (không deploy)
└── deploy-linux.md        ← Hướng dẫn cài đặt thủ công chi tiết
```

---

## 🛠️ Yêu cầu môi trường (Cài 1 lần)

Trước khi build hoặc deploy, máy tính cần cài sẵn các công cụ sau:

| Công cụ | Version | Tải về |
|---------|---------|--------|
| **.NET SDK** | 10.0+ | https://dotnet.microsoft.com/download |
| **Node.js** | 20+ | https://nodejs.org |
| **pnpm** | 9+ | `npm install -g pnpm` |
| **OpenSSH** | (Windows 10+) | Có sẵn trong Windows, hoặc cài Git for Windows |

> **Kiểm tra nhanh** — Mở PowerShell chạy:
> ```powershell
> dotnet --version    # phải ra 10.x.x
> node --version      # phải ra v20.x.x
> pnpm --version      # phải ra 9.x.x
> ssh -V              # phải có kết quả
> ```

---

## 🏗️ Cài dependencies lần đầu

Chỉ cần làm 1 lần sau khi clone dự án:

```powershell
# Cài Node packages cho frontend
cd src\OtaServer.Ui
pnpm install
cd ..\..
```

---

## ⚡ Cách dùng nhanh (Deploy 1 lệnh)

Chạy từ **thư mục gốc dự án** hoặc từ bên trong `deploy/`:



```powershell
# Từ thư mục gốc:
powershell -ExecutionPolicy Bypass -File deploy\deploy-to-server.ps1

# Hoặc từ trong thư mục deploy/:
powershell -ExecutionPolicy Bypass -File deploy-to-server.ps1
```

Script sẽ tự động thực hiện toàn bộ 5 bước:

| Bước | Mô tả |
|------|-------|
| **1** | Kiểm tra port 2016 trên server |
| **2** | Build UI React + Publish .NET self-contained cho Linux x64 |
| **3** | Copy toàn bộ file lên `/opt/ota-server/` qua SCP |
| **4** | Cấu hình Systemd service `ota-server` |
| **5** | Restart service và kiểm tra trạng thái |

> **Lưu ý:** Nếu port 2016 đang được dùng bởi chính `ota-server` (deploy lại), script tự động dừng service cũ và tiếp tục — **không cần xác nhận thủ công**.

---

## 🏗️ Chỉ Build (không deploy)

Dùng khi muốn test build local hoặc kiểm tra lỗi trước khi deploy:

```powershell
powershell -ExecutionPolicy Bypass -File deploy\build-all.ps1
```

---

## 🖥️ Thông tin Server Production

| Mục | Giá trị |
|-----|---------|
| **IP** | `103.179.190.33` |
| **Port ứng dụng** | `2016` |
| **URL truy cập** | http://mes.stivietnam.com:2016 |
| **Thư mục cài đặt** | `/opt/ota-server` |
| **File thực thi** | `/opt/ota-server/OtaServer.Api` |
| **Database SQLite** | `/opt/ota-server/ota.db` |
| **File upload** | `/opt/ota-server/wwwroot/uploads/` |
| **Tên Service** | `ota-server` (systemd) |
| **SSH User** | `root` |

---

## 🔧 Lệnh quản lý nhanh trên Server

```bash
# Xem trạng thái
systemctl status ota-server

# Restart
systemctl restart ota-server

# Dừng
systemctl stop ota-server

# Xem log thời gian thực
journalctl -u ota-server -f
```

SSH vào server:
```powershell
ssh -o StrictHostKeyChecking=no root@103.179.190.33
```

---

## 🔑 Thông tin đăng nhập hệ thống

| Mục | Giá trị |
|-----|---------|
| **Mật khẩu mặc định** | `09052016` |
| **Đổi mật khẩu** | Vào **User Profile** trên giao diện web |

---

## ⚠️ Lưu ý quan trọng khi update

- **Không xóa** `/opt/ota-server/ota.db` — chứa toàn bộ dữ liệu dự án & phiên bản
- **Không xóa** `/opt/ota-server/wwwroot/uploads/` — chứa các file cài đặt đã upload
- Script deploy **chỉ ghi đè** binary và config, dữ liệu được giữ nguyên

---

*Xem hướng dẫn cài đặt thủ công chi tiết tại [deploy-linux.md](./deploy-linux.md)*
