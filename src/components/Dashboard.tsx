import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { HealthResponse } from '../services/api';

/**
 * Dashboard Component
 *
 * Protected main application page
 * Displays user information and API health status
 */
export default function Dashboard() {
  const { userProfile, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const health = await apiService.health();
        setHealthStatus(health);
        setError(null);
      } catch (err) {
        console.error('Error fetching health:', err);
        setError('Failed to fetch API health status');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #ddd',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px' }}>otel-ui Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {userProfile?.name || userProfile?.email || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{userProfile?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                color: '#fff',
                backgroundColor: '#dc3545',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#c82333';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#dc3545';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {/* Welcome Card */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Welcome, {userProfile?.name || 'User'}!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            You are successfully authenticated with AWS Cognito.
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <div>
              <strong>Email:</strong> {userProfile?.email}
            </div>
            <div>
              <strong>User ID:</strong> {userProfile?.sub}
            </div>
          </div>
        </div>

        {/* API Health Status Card */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>API Health Status</h2>

          {loading && <p>Loading health status...</p>}

          {error && (
            <div
              style={{
                padding: '15px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                color: '#c33',
              }}
            >
              {error}
            </div>
          )}

          {healthStatus && (
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: healthStatus.status === 'healthy' ? '#d4edda' : '#f8d7da',
                  color: healthStatus.status === 'healthy' ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                }}
              >
                Status: {healthStatus.status?.toUpperCase() || 'UNKNOWN'}
              </div>

              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Details</h3>
                <pre
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '14px',
                  }}
                >
                  {JSON.stringify(healthStatus, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div
          style={{
            backgroundColor: '#e7f3ff',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '30px',
            border: '1px solid #b3d9ff',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#004085' }}>Next Steps</h3>
          <ul style={{ color: '#004085', margin: 0 }}>
            <li>Explore API endpoints and trace IDs</li>
            <li>View distributed tracing in New Relic</li>
            <li>Test token refresh and session management</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
