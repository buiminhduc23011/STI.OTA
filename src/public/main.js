document.addEventListener('DOMContentLoaded', () => {
  const machinesList = document.getElementById('machines-list');
  const uploadForm = document.getElementById('upload-form');
  const machineSelect = document.getElementById('machineId');
  const newMachineGroup = document.getElementById('new-machine-group');
  const newMachineInput = document.getElementById('newMachineId');
  const apkInput = document.getElementById('apkFile');
  const dropArea = document.getElementById('drop-area');
  const fileInfo = document.getElementById('file-info');
  const adminPassword = document.getElementById('adminPassword');
  const submitBtn = document.getElementById('submit-btn');

  const alertSuccess = document.getElementById('alert-success');
  const alertError = document.getElementById('alert-error');

  const progressWrapper = document.getElementById('progress-wrapper');
  const progressPercent = document.getElementById('progress-percent');
  const progressFill = document.getElementById('progress-fill');
  const progressStatus = document.getElementById('progress-status');

  // Load danh sách dòng máy khi mở trang
  loadMachines();

  // Sự kiện khi chọn dòng máy (Dropdown)
  machineSelect.addEventListener('change', () => {
    if (machineSelect.value === 'new-machine') {
      newMachineGroup.style.display = 'flex';
      newMachineInput.setAttribute('required', 'true');
    } else {
      newMachineGroup.style.display = 'none';
      newMachineInput.removeAttribute('required');
      newMachineInput.value = '';
    }
  });

  // Hiển thị tên file APK đã chọn
  apkInput.addEventListener('change', () => {
    showFileInfo();
  });

  // Xử lý kéo thả file APK
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropArea.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropArea.classList.remove('dragover');
    }, false);
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0 && files[0].name.endsWith('.apk')) {
      apkInput.files = files;
      showFileInfo();
    } else {
      showError('Chỉ hỗ trợ file ứng dụng có định dạng .apk');
    }
  });

  function showFileInfo() {
    if (apkInput.files.length > 0) {
      const file = apkInput.files[0];
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
      fileInfo.textContent = `Đã chọn: ${file.name} (${fileSizeMb} MB)`;
      fileInfo.style.display = 'block';
    } else {
      fileInfo.style.display = 'none';
    }
  }

  // Fetch danh sách dòng máy
  async function loadMachines() {
    try {
      const res = await fetch('/api/machines');
      const data = await res.json();

      if (data.success) {
        renderMachines(data.machines);
      } else {
        machinesList.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--fault);">${data.message}</td></tr>`;
      }
    } catch (error) {
      machinesList.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--fault);">Không thể kết nối đến API server.</td></tr>`;
    }
  }

  // Render danh sách máy vào bảng HTML
  function renderMachines(machines) {
    if (machines.length === 0) {
      machinesList.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Chưa có bản cập nhật nào trên server.</td></tr>`;
      return;
    }

    machinesList.innerHTML = machines.map(m => {
      // Xác định tên hiển thị thân thiện
      let displayName = m.id;
      if (m.id === 'gear-lathe-feeder') displayName = 'Lathe Feeder';
      if (m.id === 'gear-post-heat-feeder') displayName = 'Post Heat Feeder';

      return `
        <tr>
          <td>
            <div class="machine-badge">${displayName}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${m.id}</div>
          </td>
          <td><span class="version-tag">v${m.versionName}</span></td>
          <td>${m.versionCode}</td>
          <td>${m.updateTime || 'Chưa rõ'}</td>
          <td>
            <a href="/ota/${m.id}/update.json" target="_blank" class="link-btn">JSON config</a>
            <span style="color: var(--border); margin: 0 8px;">|</span>
            <a href="/ota/${m.id}/app-release.apk" class="link-btn">Tải APK</a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Xử lý submit Form Upload
  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    hideAlerts();

    // Xác định machineId
    let machineId = machineSelect.value;
    if (machineId === 'new-machine') {
      machineId = newMachineInput.value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      if (!machineId) {
        showError('Vui lòng nhập ID cho dòng máy mới.');
        return;
      }
    }

    const apkFile = apkInput.files[0];
    if (!apkFile) {
      showError('Vui lòng chọn file APK.');
      return;
    }

    const formData = new FormData();
    formData.append('machineId', machineId);
    formData.append('versionName', document.getElementById('versionName').value.trim());
    formData.append('versionCode', document.getElementById('versionCode').value);
    formData.append('changelog', document.getElementById('changelog').value.trim());
    formData.append('password', adminPassword.value);
    formData.append('apk', apkFile);

    // Sử dụng XMLHttpRequest để theo dõi tiến độ upload
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    progressWrapper.style.display = 'flex';
    submitBtn.disabled = true;
    submitBtn.style.opacity = 0.5;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        if (percent === 100) {
          progressStatus.textContent = 'Đang lưu file và tạo cấu hình trên server...';
        } else {
          progressStatus.textContent = 'Đang tải file APK lên server...';
        }
      }
    };

    xhr.onload = () => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = 1;
      progressWrapper.style.display = 'none';
      progressFill.style.width = '0%';

      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.success) {
          showSuccess(response.message);
          uploadForm.reset();
          newMachineGroup.style.display = 'none';
          fileInfo.style.display = 'none';
          loadMachines(); // Tải lại danh sách
        } else {
          showError(response.message || 'Có lỗi xảy ra.');
        }
      } catch (err) {
        showError('Phản hồi từ máy chủ không hợp lệ.');
      }
    };

    xhr.onerror = () => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = 1;
      progressWrapper.style.display = 'none';
      showError('Kết nối mạng thất bại hoặc không thể gửi file.');
    };

    xhr.send(formData);
  });

  function showSuccess(msg) {
    alertSuccess.textContent = msg;
    alertSuccess.style.display = 'block';
    setTimeout(() => {
      alertSuccess.style.display = 'none';
    }, 5000);
  }

  function showError(msg) {
    alertError.textContent = msg;
    alertError.style.display = 'block';
  }

  function hideAlerts() {
    alertSuccess.style.display = 'none';
    alertError.style.display = 'none';
  }
});
