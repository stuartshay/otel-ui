import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { HealthResponse, InfoResponse } from '../services/api';
import { getConfig } from '../config/runtime';
import Layout from './Layout';
import '../styles/Dashboard.css';

/**
 * Dashboard Component
 *
 * Protected main application page
 * Displays user information and API health status
 */
export default function Dashboard() {
  const { userProfile } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [serviceInfo, setServiceInfo] = useState<InfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [health, info] = await Promise.all([
          apiService.health(),
          apiService.getServiceInfo(),
        ]);
        setHealthStatus(health);
        setServiceInfo(info);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch API status');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="dashboard">
        {loading && (
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading dashboard data...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-avatar">
                {(userProfile?.name?.[0] || userProfile?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="welcome-content">
                <h2>Welcome back, {userProfile?.name || 'User'}! 👋</h2>
                <p>You're successfully authenticated and ready to explore.</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#e7f3ff', color: '#0066cc' }}>
                  👤
                </div>
                <div className="stat-content">
                  <div className="stat-label">User Email</div>
                  <div className="stat-value">{userProfile?.email || 'N/A'}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                  🆔
                </div>
                <div className="stat-content">
                  <div className="stat-label">User ID</div>
                  <div className="stat-value" style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                    {userProfile?.sub?.substring(0, 18) || 'N/A'}...
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: healthStatus?.status === 'healthy' ? '#d4edda' : '#f8d7da',
                    color: healthStatus?.status === 'healthy' ? '#155724' : '#721c24',
                  }}
                >
                  {healthStatus?.status === 'healthy' ? '✅' : '❌'}
                </div>
                <div className="stat-content">
                  <div className="stat-label">API Status</div>
                  <div className="stat-value">
                    {healthStatus?.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#e7f5e7', color: '#28a745' }}>
                  🚀
                </div>
                <div className="stat-content">
                  <div className="stat-label">API Version</div>
                  <div className="stat-value">{serviceInfo?.version || 'N/A'}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#f0e6ff', color: '#6f42c1' }}>
                  🖥️
                </div>
                <div className="stat-content">
                  <div className="stat-label">Frontend Version</div>
                  <div className="stat-value">{getConfig('APP_VERSION', 'dev')}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-grid">
                <Link to="/testing" className="action-card">
                  <span className="action-icon">🧪</span>
                  <div className="action-content">
                    <h4>OTel Testing</h4>
                    <p>Test API endpoints and view trace IDs</p>
                  </div>
                </Link>

                <a
                  href="https://otel.lab.informationcart.com/apidocs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-card"
                >
                  <span className="action-icon">📚</span>
                  <div className="action-content">
                    <h4>API Documentation</h4>
                    <p>Explore OpenAPI specs</p>
                  </div>
                </a>

                <a
                  href="https://one.newrelic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-card"
                >
                  <span className="action-icon">📊</span>
                  <div className="action-content">
                    <h4>New Relic</h4>
                    <p>View distributed traces</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Service Info */}
            {serviceInfo && (
              <div className="info-card">
                <h3>📡 Service Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Service Name:</span>
                    <span className="info-value">{serviceInfo.service || 'otel-demo'}</span>
                  </div>

                  {serviceInfo.version && (
                    <div className="info-item">
                      <span className="info-label">Version:</span>
                      <span className="info-value">{serviceInfo.version}</span>
                    </div>
                  )}
                  {serviceInfo.trace_id && (
                    <div className="info-item">
                      <span className="info-label">Trace ID:</span>
                      <code className="info-value">{serviceInfo.trace_id}</code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
