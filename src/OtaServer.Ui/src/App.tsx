import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Input,
  Form,
  Modal,
  Space,
  Typography,
  message,
  ConfigProvider,
  theme,
  Avatar
} from 'antd';
import {
  FolderOutlined,
  LogoutOutlined,
  KeyOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Profile from './pages/Profile';
import './App.css';

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text } = Typography;

// Inner App component to use React Router hooks
const AppContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginForm] = Form.useForm();
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 991px)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) {
        setCollapsed(true);
      }
    };
    
    // Initial check
    handleMediaChange(mediaQuery);

    // Listen to changes
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    // Check if password exists in localStorage
    const savedPassword = localStorage.getItem('sti_ota_admin_password');
    if (savedPassword) {
      setIsAuthenticated(true);
    } else {
      setLoginModalOpen(true);
    }

    // Listen to global unauthorized event
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setLoginModalOpen(true);
      message.warning('Mật khẩu quản trị không đúng hoặc đã thay đổi. Vui lòng nhập lại.');
    };

    window.addEventListener('ota-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ota-unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = (values: { password: string }) => {
    localStorage.setItem('sti_ota_admin_password', values.password);
    setIsAuthenticated(true);
    setLoginModalOpen(false);
    loginForm.resetFields();
    message.success('Đăng nhập thành công!');
    // Reload projects after login
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('sti_ota_admin_password');
    setIsAuthenticated(false);
    setLoginModalOpen(true);
    message.info('Đã đăng xuất tài khoản quản trị.');
  };

  // Get active menu key based on pathname
  const getSelectedKey = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/projects')) {
      return 'projects';
    }
    if (location.pathname === '/profile') {
      return 'profile';
    }
    return 'projects';
  };

  // Get dynamic page title for Header
  const getPageTitle = () => {
    if (location.pathname === '/' || location.pathname === '/projects') {
      return 'Danh sách dự án';
    }
    if (location.pathname.startsWith('/projects/')) {
      return 'Chi tiết dự án';
    }
    if (location.pathname === '/profile') {
      return 'User Profile';
    }
    return 'OTA Server Dashboard';
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Backdrop for mobile when sidebar is expanded */}
      {isMobile && !collapsed && (
        <div 
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 9,
            transition: 'opacity 0.2s'
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        collapsedWidth={isMobile ? 0 : 80}
        trigger={null}
        theme="dark"
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          background: '#001529',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.2s'
        }}>
          <Space size={collapsed ? 0 : 8}>
            <img src="/Logo.png" alt="STI Logo" style={{ height: '32px', objectFit: 'contain' }} />
            {!collapsed && (
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                OTA Server
              </Title>
            )}
          </Space>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          style={{ marginTop: '16px' }}
        >
          <Menu.Item key="projects" icon={<FolderOutlined />}>
            <Link to="/">Danh sách dự án</Link>
          </Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            <Link to="/profile">User Profile</Link>
          </Menu.Item>
        </Menu>

        {isAuthenticated && (
          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: collapsed ? '0' : '16px', 
            right: collapsed ? '0' : '16px',
            textAlign: 'center'
          }}>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              style={{ 
                width: collapsed ? '40px' : '100%', 
                margin: collapsed ? '0 auto' : '0',
                color: '#ff4d4f', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: collapsed ? '0' : undefined
              }}
              onClick={handleLogout}
              title={collapsed ? "Đăng xuất" : undefined}
            >
              {!collapsed && 'Đăng xuất'}
            </Button>
          </div>
        )}
      </Sider>

      {/* Main Content Layout */}
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), height: '100vh', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', overflow: 'hidden' }} className="main-layout-responsive">
        <Header style={{ background: token.colorBgContainer, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Space size="middle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>{getPageTitle()}</Title>
          </Space>
          <Space size="large" align="center">
            {/* Theme Toggle Button */}
            <Button 
              type="text" 
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} 
              onClick={() => {
                const newTheme = isDarkMode ? 'light' : 'dark';
                localStorage.setItem('sti_ota_theme', newTheme);
                window.dispatchEvent(new Event('sti-theme-changed'));
                message.success(`Đã chuyển sang giao diện ${newTheme === 'dark' ? 'Tối' : 'Sáng'}`);
              }} 
              style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
            <span style={{ color: token.colorBorderSecondary }}>|</span>
            <Space size="small">
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: isAuthenticated ? token.colorPrimary : '#8c8c8c' }} />
              <Text strong>{isAuthenticated ? 'Quản trị viên' : 'Chưa đăng nhập'}</Text>
            </Space>
          </Space>
        </Header>

        <Content style={{ margin: '24px 16px 0', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: 24, background: token.colorBgContainer, borderRadius: '12px', border: `1px solid ${token.colorBorderSecondary}`, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', color: isDarkMode ? '#64748b' : '#94a3b8', padding: '16px 50px', background: token.colorBgLayout }}>
          STI.Automation | Release date 10/06/2026
        </Footer>
      </Layout>

      {/* Login Password Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', paddingBottom: '12px' }}>
            <img src="/Logo.png" alt="STI Logo" style={{ height: '48px', marginBottom: '8px', objectFit: 'contain' }} />
            <Title level={4} style={{ margin: 0 }}>Xác Thực Quyền Quản Trị</Title>
          </div>
        }
        open={loginModalOpen}
        footer={null}
        closable={false}
        maskClosable={false}
        width={400}
        centered
      >
        <Form
          form={loginForm}
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="Nhập mật khẩu quản trị hệ thống"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<KeyOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Mật khẩu mặc định là 09052016"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: '100%' }}
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

// Main App Wrapper
const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('sti_ota_theme') === 'dark';
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem('sti_ota_theme') === 'dark');
    };
    window.addEventListener('sti-theme-changed', handleThemeChange);
    return () => window.removeEventListener('sti-theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          borderRadius: 12,
          colorPrimary: isDarkMode ? '#177ddc' : '#1677ff',
          colorSuccess: isDarkMode ? '#34d399' : '#10b981',
          colorWarning: isDarkMode ? '#fbbf24' : '#f59e0b',
          colorError: isDarkMode ? '#f87171' : '#ef4444',
          colorInfo: isDarkMode ? '#60a5fa' : '#3b82f6',
          colorBgContainer: isDarkMode ? '#151b26' : '#ffffff',
          colorBgLayout: isDarkMode ? '#0b0f17' : '#f8fafc',
        }
      }}
    >
      <BrowserRouter>
        <AppContent isDarkMode={isDarkMode} />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
