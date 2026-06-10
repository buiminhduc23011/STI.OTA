import React, { useEffect, useState } from 'react';
import { 
  PlusOutlined, 
  FolderOutlined, 
  DeleteOutlined, 
  ArrowRightOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Button, Modal, Form, Input, Space, Tooltip, message, Typography, Empty, Spin, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { otaApi } from '../services/api';
import type { ProjectSummary } from '../services/api';

const { Title, Text } = Typography;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await otaApi.getProjects();
      setProjects(data);
    } catch (error: any) {
      message.error('Không thể tải danh sách dự án: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (values: { name: string; code?: string }) => {
    try {
      const newProj = await otaApi.createProject(values.name, values.code);
      message.success(`Đã tạo dự án "${newProj.name}" thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      loadProjects();
    } catch (error: any) {
      message.error('Lỗi khi tạo dự án: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chuyển trang khi click icon xóa
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa dự án này?',
      content: 'Tất cả các tệp tin cập nhật và cấu hình thiết bị liên quan sẽ bị xóa vĩnh viễn!',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await otaApi.deleteProject(id);
          message.success('Đã xóa dự án thành công.');
          loadProjects();
        } catch (error: any) {
          message.error('Lỗi khi xóa dự án: ' + (error.response?.data?.message || error.message));
        }
      }
    });
  };

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Danh sách dự án</Title>
          <Text type="secondary">Quản lý và cấp phát cập nhật OTA cho các phần mềm trong hệ thống</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsModalOpen(true)}
          style={{ borderRadius: '8px' }}
        >
          Tạo Dự Án Mới
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" tip="Đang tải danh sách dự án..." />
        </div>
      ) : projects.length === 0 ? (
        <Card style={{ borderRadius: '12px', border: `1px dashed ${token.colorBorder}`, padding: '40px 0', background: token.colorBgContainer }}>
          <Empty 
            description="Chưa có dự án nào được tạo trong hệ thống"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ borderRadius: '8px' }}>Khởi tạo ngay</Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {projects.map((proj) => (
            <Col xs={24} sm={12} md={8} key={proj.id}>
              <Card
                className="hover-scale"
                hoverable
                style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: `1px solid ${token.colorBorderSecondary}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: token.colorBgContainer
                }}
                styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 } }}
                onClick={() => navigate(`/projects/${proj.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <Space align="center">
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '8px', 
                      background: token.colorPrimaryBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: token.colorPrimary,
                      fontSize: '20px'
                    }}>
                      <FolderOutlined />
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0, fontSize: '18px' }}>{proj.name}</Title>
                      <Text code style={{ fontSize: '12px' }}>{proj.code}</Text>
                    </div>
                  </Space>

                  <Tooltip title="Xóa dự án">
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={(e) => handleDelete(proj.id, e)}
                    />
                  </Tooltip>
                </div>

                <div style={{ flexGrow: 1, marginBottom: '20px' }}>
                  <div style={{ background: token.colorBgLayout, padding: '12px', borderRadius: '8px', marginBottom: '12px', textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Bản cập nhật</Text>
                    <Title level={4} style={{ margin: '4px 0 0' }}>{proj.versionsCount}</Title>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', color: token.colorTextDescription, fontSize: '12px' }}>
                    <CalendarOutlined style={{ marginRight: '6px' }} />
                    Tạo lúc: {new Date(proj.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: '12px', marginTop: 'auto' }}>
                  <Text style={{ color: token.colorPrimary, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    Chi tiết <ArrowRightOutlined style={{ marginLeft: '6px' }} />
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal create project */}
      <Modal
        title={<Title level={3} style={{ margin: 0 }}>Tạo Dự Án Mới</Title>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="name"
            label="Tên dự án"
            rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
          >
            <Input placeholder="Ví dụ: STI Tablet App, AGV Controller..." size="large" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã định danh dự án (Không bắt buộc)"
            help="Dùng để sinh link API check cập nhật. Nếu để trống, hệ thống tự động sinh từ tên dự án. Ví dụ: mes-sti-app"
          >
            <Input placeholder="Ví dụ: tablet-sti" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)} size="large">Hủy</Button>
              <Button type="primary" htmlType="submit" size="large" style={{ borderRadius: '8px' }}>Tạo dự án</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
