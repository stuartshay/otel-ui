import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Callback from './components/Callback';
import Dashboard from './components/Dashboard';
import OTelTesting from './components/OTelTesting';
import OwnTracks from './components/OwnTracks';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * Main App Component
 *
 * Sets up routing and authentication context
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/testing"
            element={
              <ProtectedRoute>
                <OTelTesting />
                <Route
                  path="/owntracks"
                  element={
                    <ProtectedRoute>
                      <OwnTracks />
                    </ProtectedRoute>
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* Default route - redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
