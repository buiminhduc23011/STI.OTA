const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
// Mật khẩu quản trị mặc định là 'sti2026', có thể đổi qua biến môi trường ADMIN_PASSWORD
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sti2026';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đảm bảo các thư mục cần thiết tồn tại
const dirs = ['ota', 'temp_uploads'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Cấu hình Multer lưu file tạm thời
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'temp_uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'temp-' + uniqueSuffix + '.apk');
  }
});
const upload = multer({ storage: storage });

// Serve thư mục /ota tĩnh chứa update.json và app-release.apk
app.use('/ota', express.static(path.join(__dirname, 'ota')));

// Serve trang web quản trị tĩnh trong thư mục /public
app.use(express.static(path.join(__dirname, 'public')));

/**
 * API Lấy danh sách các dòng máy đang có cấu hình cập nhật
 */
app.get('/api/machines', (req, res) => {
  try {
    const otaDir = path.join(__dirname, 'ota');
    const folders = fs.readdirSync(otaDir);
    const machines = [];

    folders.forEach(folder => {
      const folderPath = path.join(otaDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const jsonPath = path.join(folderPath, 'update.json');
        let config = { versionName: 'Chưa có', versionCode: 0, changelog: '', updateTime: '' };

        if (fs.existsSync(jsonPath)) {
          try {
            const fileData = fs.readFileSync(jsonPath, 'utf8');
            config = JSON.parse(fileData);
            
            // Lấy thời gian sửa đổi file
            const stats = fs.statSync(jsonPath);
            config.updateTime = stats.mtime.toLocaleString('vi-VN');
          } catch (e) {
            console.error(`Lỗi đọc file JSON của máy ${folder}:`, e);
          }
        }
        
        machines.push({
          id: folder,
          ...config
        });
      }
    });

    res.json({ success: true, machines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * API Upload file APK mới và cập nhật file update.json
 */
app.post('/api/upload', upload.single('apk'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn file APK để tải lên.' });
  }

  const { machineId, versionName, versionCode, changelog, password } = req.body;

  // Xác thực mật khẩu
  if (password !== ADMIN_PASSWORD) {
    // Xóa file tạm vừa upload lên để dọn dẹp bộ nhớ
    fs.unlinkSync(file.path);
    return res.status(401).json({ success: false, message: 'Mật khẩu quản trị không đúng.' });
  }

  if (!machineId || !versionName || !versionCode) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ success: false, message: 'Thiếu thông tin tên máy, số phiên bản hoặc mã phiên bản.' });
  }

  // Định dạng lại machineId thành slug viết thường, không dấu, không khoảng trắng
  const safeMachineId = machineId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  try {
    const targetFolder = path.join(__dirname, 'ota', safeMachineId);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const targetApkPath = path.join(targetFolder, 'app-release.apk');
    const targetJsonPath = path.join(targetFolder, 'update.json');

    // Chuyển file APK từ thư mục tạm sang thư mục ota/machineId/
    if (fs.existsSync(targetApkPath)) {
      fs.unlinkSync(targetApkPath); // Xóa bản cũ nếu có
    }
    fs.renameSync(file.path, targetApkPath);

    // Xác định URL của file APK
    // Nếu bạn deploy lên https://stivietnam.com/ota, URL sẽ là: https://stivietnam.com/ota/safeMachineId/app-release.apk
    // Chúng ta tạo link tương đối dựa trên hostname của client request để tự động linh hoạt
    const host = req.get('host');
    const protocol = req.protocol;
    // URL sẽ tự động mapping theo tên miền thực tế (hoặc domain ota phụ)
    const apkUrl = `${protocol}://${host}/ota/${safeMachineId}/app-release.apk`;

    // Tạo file update.json mới
    const updateConfig = {
      versionName: versionName.trim(),
      versionCode: parseInt(versionCode, 10),
      changelog: changelog ? changelog.trim() : 'Bản cập nhật mới.',
      apkUrl: apkUrl
    };

    fs.writeFileSync(targetJsonPath, JSON.stringify(updateConfig, null, 2), 'utf8');

    res.json({
      success: true,
      message: `Cập nhật thành công cho máy ${safeMachineId}!`,
      data: updateConfig
    });

  } catch (error) {
    // Xóa file tạm nếu di chuyển thất bại
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lưu file cập nhật: ' + error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`OTA Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`Thư mục cập nhật tĩnh: http://localhost:${PORT}/ota`);
  console.log(`========================================================`);
});
