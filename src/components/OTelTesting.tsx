import { useState } from 'react';
import Layout from './Layout';
import { apiService } from '../services/api';
import type {
  HealthResponse,
  ReadyResponse,
  InfoResponse,
  ChainResponse,
  SlowResponse,
} from '../services/api';
import '../styles/OTelTesting.css';

interface TestResult {
  endpoint: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: unknown;
  error?: string;
  traceId?: string;
  duration?: number;
}

/**
 * OTel Testing Component
 *
 * Interactive testing page for all otel-demo API endpoints
 * Displays responses, trace IDs, and timing information
 */
export default function OTelTesting() {
  const [results, setResults] = useState<Record<string, TestResult>>({});

  const updateResult = (endpoint: string, update: Partial<TestResult>) => {
    setResults(prev => ({
      ...prev,
      [endpoint]: { ...prev[endpoint], endpoint, ...update },
    }));
  };

  const testEndpoint = async (endpoint: string, fn: () => Promise<unknown>) => {
    updateResult(endpoint, { status: 'loading', data: undefined, error: undefined });
    const startTime = performance.now();

    try {
      const data = await fn();
      const duration = performance.now() - startTime;

      // Extract trace ID if available
      const traceId =
        data && typeof data === 'object' && 'traceId' in data
          ? (data as { traceId?: string }).traceId
          : undefined;

      updateResult(endpoint, {
        status: 'success',
        data,
        traceId,
        duration: Math.round(duration),
      });
    } catch (err) {
      const duration = performance.now() - startTime;
      updateResult(endpoint, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        duration: Math.round(duration),
      });
    }
  };

  const endpoints = [
    {
      name: 'Health Check',
      endpoint: '/health',
      description: 'Basic health status check',
      fn: () => apiService.health() as Promise<HealthResponse>,
      icon: '💚',
      category: 'monitoring',
    },
    {
      name: 'Readiness Check',
      endpoint: '/ready',
      description: 'Readiness probe for K8s',
      fn: () => apiService.ready() as Promise<ReadyResponse>,
      icon: '✅',
      category: 'monitoring',
    },
    {
      name: 'Service Info',
      endpoint: '/info',
      description: 'Service metadata and version',
      fn: () => apiService.getServiceInfo() as Promise<InfoResponse>,
      icon: 'ℹ️',
      category: 'info',
    },
    {
      name: 'Chain Demo',
      endpoint: '/chain',
      description: 'Nested spans demonstration (3 levels)',
      fn: () => apiService.getChainDemo() as Promise<ChainResponse>,
      icon: '⛓️',
      category: 'tracing',
    },
    {
      name: 'Slow Endpoint',
      endpoint: '/slow',
      description: 'Simulated latency (0.5-2s)',
      fn: () => apiService.getSlowDemo() as Promise<SlowResponse>,
      icon: '🐌',
      category: 'performance',
    },
    {
      name: 'Error Demo',
      endpoint: '/error',
      description: 'Intentional error for testing (returns 500)',
      fn: () => apiService.getErrorDemo(),
      icon: '❌',
      category: 'error',
    },
    {
      name: 'Database Locations',
      endpoint: '/database/locations',
      description: 'Fetch locations from database',
      fn: () => apiService.get('/database/locations'),
      icon: '📍',
      category: 'database',
    },
    {
      name: 'Database Status',
      endpoint: '/database/status',
      description: 'Database connection status',
      fn: () => apiService.get('/database/status'),
      icon: '🗄️',
      category: 'database',
    },
  ];

  const categories = [
    { id: 'monitoring', label: 'Monitoring', color: '#28a745' },
    { id: 'info', label: 'Information', color: '#17a2b8' },
    { id: 'tracing', label: 'Tracing', color: '#667eea' },
    { id: 'performance', label: 'Performance', color: '#fd7e14' },
    { id: 'error', label: 'Error Handling', color: '#dc3545' },
    { id: 'database', label: 'Database', color: '#6610f2' },
  ];

  const testAllEndpoints = () => {
    endpoints.forEach(({ endpoint, fn }) => {
      testEndpoint(endpoint, fn);
    });
  };

  return (
    <Layout>
      <div className="otel-testing">
        {/* Header Section */}
        <div className="testing-header">
          <div className="header-text">
            <h2>OpenTelemetry API Testing</h2>
            <p>Test all otel-demo endpoints and view distributed tracing information</p>
          </div>
          <button onClick={testAllEndpoints} className="btn btn-primary btn-large">
            🚀 Test All Endpoints
          </button>
        </div>

        {/* Category Legend */}
        <div className="category-legend">
          {categories.map(cat => (
            <div key={cat.id} className="category-badge" style={{ borderColor: cat.color }}>
              <span className="category-dot" style={{ backgroundColor: cat.color }}></span>
              {cat.label}
            </div>
          ))}
        </div>

        {/* Endpoints Grid */}
        <div className="endpoints-grid">
          {endpoints.map(({ name, endpoint, description, fn, icon, category }) => {
            const result = results[endpoint];
            const categoryInfo = categories.find(c => c.id === category);

            return (
              <div key={endpoint} className={`endpoint-card ${result?.status || 'idle'}`}>
                <div className="card-header">
                  <div className="endpoint-info">
                    <span className="endpoint-icon">{icon}</span>
                    <div>
                      <h3 className="endpoint-name">{name}</h3>
                      <code className="endpoint-path">{endpoint}</code>
                    </div>
                  </div>
                  {categoryInfo && (
                    <span
                      className="category-tag"
                      style={{
                        backgroundColor: `${categoryInfo.color}15`,
                        color: categoryInfo.color,
                        borderColor: categoryInfo.color,
                      }}
                    >
                      {categoryInfo.label}
                    </span>
                  )}
                </div>

                <p className="endpoint-description">{description}</p>

                <button
                  onClick={() => testEndpoint(endpoint, fn)}
                  disabled={result?.status === 'loading'}
                  className="btn btn-test"
                >
                  {result?.status === 'loading' ? (
                    <>
                      <span className="spinner"></span> Testing...
                    </>
                  ) : (
                    <>🧪 Test Endpoint</>
                  )}
                </button>

                {/* Results Section */}
                {(() => {
                  if (!result || result.status === 'idle') return null;

                  return (
                    <div className={`result-section ${result.status}`}>
                      {/* Status Badge */}
                      <div className="result-header">
                        <span className={`status-badge ${result.status}`}>
                          {result.status === 'loading' ? '⏳ Loading' : null}
                          {result.status === 'success' ? '✅ Success' : null}
                          {result.status === 'error' ? '❌ Error' : null}
                        </span>
                        {result.duration !== undefined ? (
                          <span className="duration-badge">{result.duration}ms</span>
                        ) : null}
                      </div>

                      {/* Trace ID */}
                      {result.traceId ? (
                        <div className="trace-id">
                          <span className="trace-label">🔍 Trace ID:</span>
                          <code className="trace-value">{result.traceId}</code>
                        </div>
                      ) : null}

                      {/* Error Message */}
                      {result.error ? (
                        <div className="error-message">
                          <strong>Error:</strong> {result.error}
                        </div>
                      ) : null}

                      {/* Response Data */}
                      {result.data ? (
                        <details className="response-details">
                          <summary>View Response Data</summary>
                          <pre className="response-data">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3>📚 About This Page</h3>
          <ul>
            <li>
              <strong>Distributed Tracing:</strong> Each request generates a unique trace ID for
              tracking across services
            </li>
            <li>
              <strong>Span Hierarchy:</strong> The Chain Demo shows nested spans (parent → child →
              grandchild)
            </li>
            <li>
              <strong>Error Tracking:</strong> Errors are captured and associated with trace IDs for
              debugging
            </li>
            <li>
              <strong>Performance:</strong> Response times help identify slow endpoints
            </li>
            <li>
              <strong>New Relic:</strong> All traces are exported to New Relic for visualization and
              analysis
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
