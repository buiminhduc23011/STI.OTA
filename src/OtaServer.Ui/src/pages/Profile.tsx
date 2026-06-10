import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, theme } from 'antd';
import { LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { otaApi } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

const Profile: React.FC = () => {
  const [passwordForm] = Form.useForm();
  const [savingPassword, setSavingPassword] = useState(false);
  const { token } = useToken();

  const handleSavePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setSavingPassword(true);
    try {
      await otaApi.saveSettings({
        baseUrl: '', // Not updating BaseUrl here
        adminPassword: values.newPassword.trim()
      });
      message.success('Đã đổi mật khẩu quản trị thành công!');
      
      // Update saved password in localStorage to keep user authenticated
      localStorage.setItem('sti_ota_admin_password', values.newPassword.trim());
      passwordForm.resetFields();
    } catch (error: any) {
      message.error('Lỗi khi đổi mật khẩu: ' + (error.response?.data?.message || error.message));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ padding: '12px 0', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Hồ Sơ Quản Trị</Title>
        <Paragraph type="secondary">
          Thay đổi mật khẩu truy cập cho tài khoản quản trị OTA Server
        </Paragraph>
      </div>

      <Card 
        style={{ 
          borderRadius: '12px', 
          border: `1px solid ${token.colorBorderSecondary}`, 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          background: token.colorBgContainer
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleSavePassword}
          autoComplete="off"
        >
          <Form.Item
            name="newPassword"
            label={<Text strong>Mật khẩu mới</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải chứa ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: token.colorTextDescription }} />}
              placeholder="Nhập mật khẩu quản trị mới" 
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<Text strong>Xác nhận mật khẩu mới</Text>}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: token.colorTextDescription }} />}
              placeholder="Nhập lại mật khẩu mới để xác nhận" 
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px', textAlign: 'right' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={savingPassword}
              size="large"
              style={{ width: '100%', borderRadius: '8px' }}
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
