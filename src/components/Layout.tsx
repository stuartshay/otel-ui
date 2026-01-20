import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout Component
 *
 * Shared layout with navigation sidebar and header
 */
export default function Layout({ children }: LayoutProps) {
  const { userProfile, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/testing', label: 'OTel Testing', icon: '🧪' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🔭</span>
            <span className="logo-text">otel-ui</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {(userProfile?.name?.[0] || userProfile?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{userProfile?.name || 'User'}</div>
              <div className="user-email">{userProfile?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div className="header-content">
            <h1 className="page-title">
              {navItems.find(item => item.path === location.pathname)?.label || 'otel-ui'}
            </h1>
            <div className="header-actions">
              <div className="env-badge">
                {import.meta.env.MODE === 'development' ? '🧪 DEV' : '🚀 PROD'}
              </div>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
