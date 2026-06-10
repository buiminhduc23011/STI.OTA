# Hướng dẫn triển khai hệ thống STI OTA trên Máy chủ Linux

Tài liệu này hướng dẫn cách build ứng dụng và cài đặt chạy nền dạng Service (systemd) cùng cấu hình proxy ngược qua Nginx trên máy chủ Linux.

---

> [!IMPORTANT]
> **Thông tin cấu hình thực tế cài đặt trên Server (103.179.190.33):**
> - **Thư mục cài đặt:** `/opt/ota-server`
> - **File chạy chính (Executable):** `/opt/ota-server/OtaServer.Api`
> - **Cơ sở dữ liệu SQLite:** `/opt/ota-server/ota.db` (Lưu lịch sử dự án, phiên bản)
> - **Thư mục lưu trữ tệp tin upload:** `/opt/ota-server/wwwroot/uploads` (Các file cài đặt cập nhật .apk, .exe...)
> - **Tên Service Systemd:** `ota-server` (Chạy ở cổng `2016`)
>
> **Các lệnh quản lý nhanh trên Server:**
> - Xem trạng thái: `systemctl status ota-server`
> - Restart dịch vụ: `systemctl restart ota-server`
> - Xem log thời gian thực: `journalctl -u ota-server -f`

---

## Hướng dẫn cập nhật phiên bản mới (Update)

Mỗi khi bạn sửa đổi mã nguồn hoặc cập nhật giao diện của hệ thống OTA và muốn đẩy bản mới lên Server, bạn có thể thực hiện theo 2 cách:

### Cách 1: Sử dụng Script tự động (Khuyến nghị)
Chỉ cần chạy lệnh sau từ cửa sổ dòng lệnh (PowerShell) tại thư mục dự án trên máy tính của bạn:
```powershell
powershell -ExecutionPolicy Bypass -File deploy-to-server.ps1
```
*Script sẽ tự động build giao diện React, đóng gói backend .NET cho Linux x64, copy đè tệp tin và restart service `ota-server` trên server chỉ trong vài giây.*

### Cách 2: Cập nhật thủ công
Nếu bạn muốn thực hiện từng bước bằng tay:
1. Build dự án tĩnh và xuất bản bản phân phối trên máy local:
   ```powershell
   powershell -ExecutionPolicy Bypass -File build-all.ps1
   dotnet publish src/OtaServer.Api/OtaServer.Api.csproj -c Release -r linux-x64 --self-contained -o dist/linux-x64
   ```
2. Copy các tệp tin mới đè lên thư mục `/opt/ota-server` của Server (lưu ý không cần xóa thư mục cũ để giữ lại file DB `ota.db` và các file cập nhật đã upload):
   ```bash
   scp -o StrictHostKeyChecking=no -r dist/linux-x64/* root@103.179.190.33:/opt/ota-server/
   ```
3. Restart lại service để áp dụng bản cập nhật mới:
   ```bash
   ssh -o StrictHostKeyChecking=no root@103.179.190.33 "systemctl restart ota-server"
   ```

---

## 1. Biên dịch ứng dụng (Publish)

Bạn có thể thực hiện biên dịch trực tiếp trên máy phát triển (Windows/macOS) thành gói chạy độc lập (Self-contained) cho Linux. Nghĩa là máy chủ Linux **không cần cài đặt trước .NET SDK hay Runtime** vẫn có thể chạy được.

Chạy lệnh sau tại thư mục gốc của dự án:

```bash
# Build frontend và copy vào wwwroot trước
powershell -ExecutionPolicy Bypass -File build-all.ps1

# Biên dịch thành một thư mục chạy độc lập cho Linux x64
dotnet publish src/OtaServer.Api/OtaServer.Api.csproj -c Release -r linux-x64 --self-contained true -o dist/linux-x64
```

Sau khi chạy xong, thư mục `dist/linux-x64` sẽ chứa toàn bộ các file cần thiết (bao gồm cả file thực thi binary `OtaServer.Api` chạy trên Linux).

---

## 2. Copy ứng dụng lên Server Linux

Nén thư mục `dist/linux-x64` thành file `.tar.gz` hoặc `.zip`, sau đó sử dụng `SCP` hoặc `SFTP` để tải lên máy chủ Linux.

Ví dụ:
```bash
tar -czvf ota-server.tar.gz -C dist/linux-x64 .
scp ota-server.tar.gz user@your-linux-server:/home/user/
```

Trên máy chủ Linux, giải nén ứng dụng vào thư mục hoạt động mong muốn (Ví dụ: `/var/www/sti-ota`):

```bash
sudo mkdir -p /var/www/sti-ota
sudo tar -xzvf /home/user/ota-server.tar.gz -C /var/www/sti-ota
```

### Cấp quyền thực thi và quyền ghi cho thư mục lưu trữ:
```bash
# Cấp quyền chạy cho file thực thi của .NET
sudo chmod +x /var/www/sti-ota/OtaServer.Api

# Cấp quyền ghi cho SQLite DB và thư mục tải lên cập nhật
sudo chown -R www-data:www-data /var/www/sti-ota
sudo chmod -R 775 /var/www/sti-ota
```

---

## 3. Tạo Service chạy nền (systemd)

Để ứng dụng tự động chạy ngầm và tự khởi động lại khi server Linux restart, ta cấu hình một systemd service.

Tạo file service mới:
```bash
sudo nano /etc/systemd/system/sti-ota.service
```

Dán nội dung sau vào file:
```ini
[Unit]
Description=STI Vietnam OTA Update Management System
After=network.target

[Service]
WorkingDirectory=/var/www/sti-ota
ExecStart=/var/www/sti-ota/OtaServer.Api
Restart=always
# Khởi động lại sau 10 giây nếu app bị crash
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=sti-ota-server
User=www-data

# CẤU HÌNH PORT VÀ BIẾN MÔI TRƯỜNG
# Chạy app chung trên port 2016
Environment=ASPNETCORE_URLS=http://*:2016
# Môi trường Production
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

Lưu và đóng file (Nhấn `Ctrl + O`, `Enter` và `Ctrl + X` trong nano).

### Kích hoạt và chạy Service:
```bash
# Tải lại cấu hình systemd
sudo systemctl daemon-reload

# Bật tính năng tự động chạy khi boot
sudo systemctl enable sti-ota.service

# Khởi động service ngay lập tức
sudo systemctl start sti-ota.service

# Kiểm tra trạng thái hoạt động
sudo systemctl status sti-ota.service
```

---

## 4. Cấu hình Nginx làm Reverse Proxy (Tùy chọn)

Nếu bạn muốn cấu hình chạy tên miền đẹp dạng `http://mes.stivietnam.com:2016` hoặc chạy cổng 80/443 proxy vào cổng nội bộ của app.

Tạo file cấu hình site mới trong Nginx:
```bash
sudo nano /etc/nginx/sites-available/sti-ota
```

Cấu hình mẫu:
```nginx
server {
    listen 80;
    server_name mes.stivietnam.com;

    # Cấu hình giới hạn dung lượng tải lên file (ví dụ: 500MB)
    client_max_body_size 500M;

    location / {
        proxy_pass         http://127.0.0.1:2016;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt cấu hình và restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sti-ota /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Xem Log ứng dụng

Để theo dõi log hoạt động của hệ thống (lịch sử tải lên, lịch sử thiết bị check update):
```bash
sudo journalctl -u sti-ota.service -f
```
