import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach password header
apiClient.interceptors.request.use(
  (config) => {
    const password = localStorage.getItem('sti_ota_admin_password') || '';
    if (config.headers) {
      config.headers['X-Admin-Password'] = password;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authorization errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear password and let the UI know
      localStorage.removeItem('sti_ota_admin_password');
      window.dispatchEvent(new Event('ota-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  devicesCount: number;
  versionsCount: number;
}

export interface AllowedDevice {
  id: string;
  deviceName: string;
  isActive: boolean;
  lastCheckedAt: string | null;
}

export interface AppVersion {
  id: string;
  appType: string;
  versionName: string;
  versionCode: number;
  changelog: string;
  fileName: string;
  downloadUrl: string;
  isActive: boolean;
  uploadedAt: string;
}

export interface ProjectDetail {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  allowedDevices: AllowedDevice[];
  appVersions: AppVersion[];
}

export interface SystemSettings {
  baseUrl: string;
  adminPassword?: string;
}

export const otaApi = {
  // Projects
  getProjects: () => apiClient.get<ProjectSummary[]>('/projects').then(res => res.data),
  getProjectDetail: (id: string) => apiClient.get<ProjectDetail>(`/projects/${id}`).then(res => res.data),
  createProject: (name: string, code?: string) => apiClient.post<ProjectSummary>('/projects', { name, code }).then(res => res.data),
  updateProject: (id: string, name: string) => apiClient.put<ProjectSummary>(`/projects/${id}`, { name }).then(res => res.data),
  deleteProject: (id: string) => apiClient.delete(`/projects/${id}`).then(res => res.data),

  // Devices
  getDevices: (projectId: string) => apiClient.get<AllowedDevice[]>(`/projects/${projectId}/devices`).then(res => res.data),
  addDevice: (projectId: string, deviceName: string) => apiClient.post<AllowedDevice>(`/projects/${projectId}/devices`, { deviceName }).then(res => res.data),
  toggleDevice: (id: string) => apiClient.put<AllowedDevice>(`/devices/${id}/toggle`).then(res => res.data),
  deleteDevice: (id: string) => apiClient.delete(`/devices/${id}`).then(res => res.data),

  // Versions
  getVersions: (projectId: string, appType: string) => apiClient.get<AppVersion[]>(`/projects/${projectId}/apps/${appType}/versions`).then(res => res.data),
  uploadVersion: (
    projectId: string,
    appType: string,
    file: File,
    versionName: string,
    versionCode: number,
    changelog: string,
    onUploadProgress?: (progressEvent: any) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('versionName', versionName);
    formData.append('versionCode', versionCode.toString());
    formData.append('changelog', changelog);

    return apiClient.post<AppVersion>(`/projects/${projectId}/apps/${appType}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }).then(res => res.data);
  },
  toggleVersion: (id: string) => apiClient.put<AppVersion>(`/versions/${id}/toggle`).then(res => res.data),
  deleteVersion: (id: string) => apiClient.delete(`/versions/${id}`).then(res => res.data),

  // Settings
  getSettings: () => apiClient.get<SystemSettings>('/systemsettings').then(res => res.data),
  saveSettings: (settings: SystemSettings) => apiClient.post('/systemsettings', settings).then(res => res.data),
};
