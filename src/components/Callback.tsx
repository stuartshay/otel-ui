import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

/**
 * Callback Component
 *
 * Handles OAuth callback from AWS Cognito
 * Processes authorization code and exchanges it for tokens
 * Redirects to dashboard on success
 */
export default function Callback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const callbackProcessed = useRef(false);

  useEffect(() => {
    // Prevent processing callback multiple times (React Strict Mode or rerenders)
    if (callbackProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      callbackProcessed.current = true;

      try {
        // Handle the OAuth callback
        await authService.handleCallback();

        // Refresh the auth context with the new user
        await refreshUser();

        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed. Please try again.');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  if (error) {
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
            border: '1px solid #fcc',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            backgroundColor: '#fee',
          }}
        >
          <h2 style={{ color: '#c33', marginBottom: '20px' }}>Authentication Error</h2>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }}
        />
        <h2>Processing authentication...</h2>
        <p style={{ color: '#666' }}>Please wait while we log you in.</p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
