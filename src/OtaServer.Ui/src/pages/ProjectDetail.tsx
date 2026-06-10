import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftOutlined, 
  DeleteOutlined, 
  UploadOutlined, 
  DownloadOutlined, 
  InfoCircleOutlined,
  LaptopOutlined,
  AndroidOutlined,
  SettingOutlined,
  ClusterOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Form, 
  Space, 
  Switch, 
  Typography, 
  message, 
  Tag, 
  Modal, 
  Radio, 
  Upload, 
  Progress,
  Tooltip,
  theme
} from 'antd';
const { useToken } = theme;
import { otaApi } from '../services/api';
import type { ProjectDetail as IProjectDetail, AppVersion } from '../services/api';

const { Title, Text, Paragraph } = Typography;

const APP_TYPES = [
  { label: 'Webserver', value: 'webserver', icon: <GlobalOutlined /> },
  { label: 'Windows', value: 'windows', icon: <LaptopOutlined /> },
  { label: 'Android', value: 'android', icon: <AndroidOutlined /> },
  { label: 'AGV Controller', value: 'agv', icon: <SettingOutlined /> },
  { label: 'IoT Device', value: 'iot', icon: <ClusterOutlined /> }
];

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<IProjectDetail | null>(null);
  const { token } = useToken();
  const [loading, setLoading] = useState(true);
  

  
  // Version state
  const [selectedAppType, setSelectedAppType] = useState('webserver');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [versionForm] = Form.useForm();

  // Settings for URL generator
  const [hostUrl, setHostUrl] = useState('');

  const loadProjectData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await otaApi.getProjectDetail(id);
      setProject(data);
    } catch (error: any) {
      message.error('Không thể tải thông tin dự án: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadHostSettings = () => {
    setHostUrl('http://mes.stivietnam.com:2016');
  };

  useEffect(() => {
    loadProjectData();
    loadHostSettings();
  }, [id]);



  // Handle Versions
  const handleToggleVersion = async (versionId: string) => {
    try {
      await otaApi.toggleVersion(versionId);
      message.success('Đã thay đổi trạng thái phiên bản.');
      loadProjectData();
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    Modal.confirm({
      title: 'Xóa phiên bản này?',
      content: 'Tệp tin cài đặt trên máy chủ sẽ bị xóa vĩnh viễn!',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await otaApi.deleteVersion(versionId);
          message.success('Đã xóa phiên bản.');
          loadProjectData();
        } catch (error: any) {
          message.error('Lỗi khi xóa phiên bản: ' + (error.response?.data?.message || error.message));
        }
      }
    });
  };

  const handleUploadVersion = async (values: any) => {
    if (!id || fileList.length === 0) {
      message.error('Vui lòng chọn file cập nhật.');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const file = fileList[0];
      await otaApi.uploadVersion(
        id,
        selectedAppType,
        file,
        values.versionName,
        parseInt(values.versionCode, 10),
        values.changelog || '',
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      );
      
      message.success('Đã tải lên phiên bản mới thành công!');
      setUploadModalOpen(false);
      setFileList([]);
      versionForm.resetFields();
      loadProjectData();
    } catch (error: any) {
      message.error('Lỗi tải lên: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading && !project) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Progress type="circle" percent={30} status="active" />
        <div style={{ marginTop: '16px' }}>Đang tải thông tin dự án...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Card>
          <Paragraph>Không tìm thấy dự án hoặc dự án đã bị xóa.</Paragraph>
          <Link to="/">
            <Button type="primary">Quay lại trang danh sách</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Filter versions by appType
  const filteredVersions = project.appVersions.filter(v => v.appType === selectedAppType);

  // Generate URL for device update check (Clean trailing slash from hostUrl)
  const cleanHostUrl = hostUrl.replace(/\/+$/, '');
  
  const apiCheckLink = `${cleanHostUrl}/api/ota/check?project=${project.code}&app=${selectedAppType}&version=latest`;



  // Columns for Versions Table
  const versionColumns = [
    {
      title: 'Mã phiên bản (Code)',
      dataIndex: 'versionCode',
      key: 'versionCode',
      width: 150,
      render: (code: number) => <Tag color="purple">v{code}</Tag>
    },
    {
      title: 'Tên phiên bản (Name)',
      dataIndex: 'versionName',
      key: 'versionName',
      width: 150,
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: 'Nhật ký cập nhật (Changelog)',
      dataIndex: 'changelog',
      key: 'changelog',
      ellipsis: true,
      render: (changelog: string) => <Text type="secondary">{changelog}</Text>
    },
    {
      title: 'Tên tệp tin',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name: string, record: AppVersion) => {
        // Construct absolute path
        const absoluteUrl = `${cleanHostUrl}${record.downloadUrl}`;
        return (
          <Space>
            <Text style={{ fontSize: '13px' }}>{name}</Text>
            <Tooltip title="Tải xuống tệp">
              <a href={absoluteUrl} target="_blank" rel="noreferrer">
                <Button type="text" shape="circle" size="small" icon={<DownloadOutlined />} />
              </a>
            </Tooltip>
          </Space>
        );
      }
    },
    {
      title: 'Ngày tải lên',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean, record: AppVersion) => (
        <Switch checked={active} onChange={() => handleToggleVersion(record.id)} />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: AppVersion) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleDeleteVersion(record.id)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* Back button & Title inline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
        <Space align="center" size="middle">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontWeight: 500, fontSize: '14px' }}>
            <ArrowLeftOutlined style={{ marginRight: '8px' }} /> Quay lại
          </Link>
          <span style={{ color: token.colorBorderSecondary }}>|</span>
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>{project.name}</Title>
          <Tag color="blue" style={{ fontWeight: 600, margin: 0 }}>{project.code}</Tag>
        </Space>
      </div>

      {/* Compact App Type selection row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
        <Text strong style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>Loại ứng dụng:</Text>
        <Radio.Group 
          value={selectedAppType} 
          onChange={(e: any) => setSelectedAppType(e.target.value)} 
          optionType="button" 
          buttonStyle="solid"
          size="small"
        >
          {APP_TYPES.map((type) => (
            <Radio.Button key={type.value} value={type.value} style={{ padding: '0 12px' }}>
              <Space size={4}>
                {type.icon}
                {type.label}
              </Space>
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      {/* Compact API Link Box */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        background: token.colorBgLayout, 
        padding: '8px 16px', 
        borderRadius: '8px', 
        border: `1px solid ${token.colorBorderSecondary}`,
        marginBottom: '16px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', minWidth: '280px' }}>
          <Text strong type="secondary" style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
            <InfoCircleOutlined style={{ marginRight: '4px' }} /> API Link:
          </Text>
          <Paragraph copyable={{ text: apiCheckLink }} style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}`, padding: '4px 8px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'nowrap', width: '100%' }}>
            {apiCheckLink}
          </Paragraph>
        </div>
        <Button 
          type="primary" 
          icon={<UploadOutlined />} 
          onClick={() => setUploadModalOpen(true)}
          style={{ borderRadius: '6px' }}
          size="middle"
        >
          Upload bản mới
        </Button>
      </div>

      <Table 
        dataSource={filteredVersions} 
        columns={versionColumns} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        style={{ overflowX: 'auto' }}
        size="small"
      />

      {/* Modal Upload Version */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Upload Bản Cập Nhật Mới ({selectedAppType.toUpperCase()})</Title>}
        open={uploadModalOpen}
        onCancel={() => {
          if (!uploading) {
            setUploadModalOpen(false);
            setFileList([]);
            versionForm.resetFields();
          }
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={versionForm}
          layout="vertical"
          onFinish={handleUploadVersion}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="versionCode"
            label="Mã phiên bản (Version Code - Số nguyên)"
            rules={[
              { required: true, message: 'Vui lòng nhập mã phiên bản!' },
              { pattern: /^[0-9]+$/, message: 'Mã phiên bản phải là số nguyên dương!' }
            ]}
            help="Ví dụ: 100, 101, 102. Thiết bị sẽ so sánh số này để quyết định có cập nhật hay không."
          >
            <Input type="number" placeholder="Ví dụ: 102" size="large" />
          </Form.Item>

          <Form.Item
            name="versionName"
            label="Tên phiên bản hiển thị (Version Name)"
            rules={[{ required: true, message: 'Vui lòng nhập tên phiên bản!' }]}
            help="Ví dụ: v1.0.2, Release-2026"
          >
            <Input placeholder="Ví dụ: 1.0.2" size="large" />
          </Form.Item>

          <Form.Item
            name="changelog"
            label="Nội dung cập nhật (Changelog)"
          >
            <Input.TextArea placeholder="Nhập các thay đổi trong phiên bản này..." rows={4} />
          </Form.Item>

          <Form.Item label="Chọn tệp tin cài đặt (.apk, .exe, .zip...)">
            <Upload
              beforeUpload={(file: any) => {
                setFileList([file]);
                return false; // Ngăn tự động upload mặc định
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} size="large">Chọn file từ máy tính</Button>
            </Upload>
          </Form.Item>

          {uploading && (
            <div style={{ margin: '16px 0' }}>
              <Text style={{ display: 'block', marginBottom: '8px' }}>Đang tải lên...</Text>
              <Progress percent={uploadProgress} status="active" />
            </div>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setUploadModalOpen(false)} disabled={uploading}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={uploading} style={{ borderRadius: '8px' }}>Tải lên & Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
