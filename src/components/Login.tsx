import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login Component
 *
 * Displays login button that redirects to AWS Cognito hosted UI
 * Shows loading state during authentication
 */
export default function Login() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '40px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '10px', fontSize: '24px' }}>Welcome to otel-ui</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Sign in with your AWS Cognito account to continue
        </p>

        {error && (
          <div
            style={{
              padding: '10px',
              marginBottom: '20px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: isLoading ? '#999' : '#007bff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseLeave={e => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          {isLoading ? 'Loading...' : 'Sign In with Cognito'}
        </button>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
          You will be redirected to AWS Cognito for authentication
        </p>
      </div>
    </div>
  );
}
