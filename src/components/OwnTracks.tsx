import { useState, useEffect } from 'react';
import Layout from './Layout';
import '../styles/OwnTracks.css';

interface Job {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  date: string;
  device_id: string;
  queued_at: string;
  completed_at?: string;
  result?: {
    total_distance_km: number;
    total_locations: number;
    max_distance_km: number;
    min_distance_km: number;
    csv_path: string;
    processing_time_ms: number;
  };
}

/**
 * OwnTracks Operations Component
 *
 * Manage GPS tracking data and distance calculations
 */
export default function OwnTracks() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'calculate' | 'jobs' | 'analytics'>('calculate');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data for demonstration - will be replaced with real API calls
  const mockJobs: Job[] = [
    {
      job_id: 'job_2026-01-25_abc123',
      status: 'completed',
      date: '2026-01-25',
      device_id: 'iphone_stuart',
      queued_at: '2026-01-25T10:30:00Z',
      completed_at: '2026-01-25T10:30:15Z',
      result: {
        total_distance_km: 42.5,
        total_locations: 1440,
        max_distance_km: 15.2,
        min_distance_km: 0.1,
        csv_path: 'distance_20260125_iphone_stuart.csv',
        processing_time_ms: 1250,
      },
    },
    {
      job_id: 'job_2026-01-24_def456',
      status: 'completed',
      date: '2026-01-24',
      device_id: '',
      queued_at: '2026-01-24T08:15:00Z',
      completed_at: '2026-01-24T08:15:22Z',
      result: {
        total_distance_km: 58.3,
        total_locations: 2880,
        max_distance_km: 18.7,
        min_distance_km: 0.0,
        csv_path: 'distance_20260124.csv',
        processing_time_ms: 2150,
      },
    },
    {
      job_id: 'job_2026-01-26_ghi789',
      status: 'processing',
      date: '2026-01-26',
      device_id: '',
      queued_at: '2026-01-26T12:00:00Z',
    },
  ];

  useEffect(() => {
    // TODO: Fetch real jobs from API
    setJobs(mockJobs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // TODO: Call API endpoint to trigger calculation
      console.log('Calculate distance for:', { date: selectedDate, deviceId });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(
        `✅ Distance calculation job started!\n\nDate: ${selectedDate}\nDevice: ${deviceId || 'All devices'}\n\nNote: API integration pending`
      );
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to start calculation job');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = (csvPath: string) => {
    // Use the existing CSV download proxy endpoint
    const filename = csvPath.split('/').pop() || csvPath;
    const downloadUrl = `https://otel.lab.informationcart.com/download/${filename}`;
    window.open(downloadUrl, '_blank');
  };

  const filteredJobs =
    statusFilter === 'all' ? jobs : jobs.filter(job => job.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'queued':
        return '🕐';
      case 'failed':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'queued':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  return (
    <Layout>
      <div className="owntracks">
        {/* Header with Stats */}
        <div className="owntracks-header">
          <div className="header-content">
            <h2>📍 OwnTracks Operations</h2>
            <p>Manage GPS tracking data and distance calculations from home</p>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-icon">📊</div>
              <div>
                <div className="stat-label">Total Jobs</div>
                <div className="stat-value">{jobs.length}</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-label">Completed</div>
                <div className="stat-value">
                  {jobs.filter(j => j.status === 'completed').length}
                </div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">⏳</div>
              <div>
                <div className="stat-label">Processing</div>
                <div className="stat-value">
                  {jobs.filter(j => j.status === 'processing').length}
                </div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🏠</div>
              <div>
                <div className="stat-label">Home Location</div>
                <div className="stat-value" style={{ fontSize: '12px' }}>
                  40.74°N, 74.04°W
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'calculate' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculate')}
          >
            🎯 Calculate Distance
          </button>
          <button
            className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            📋 Job History
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Calculate Distance Tab */}
          {activeTab === 'calculate' && (
            <div className="calculate-section">
              <div className="form-card">
                <h3>🚀 Start Distance Calculation</h3>
                <p>Calculate distance-from-home metrics for OwnTracks GPS data</p>

                <div className="form-group">
                  <label htmlFor="date">Select Date</label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <small>Choose a date to analyze GPS tracking data</small>
                </div>

                <div className="form-group">
                  <label htmlFor="device">Device ID (Optional)</label>
                  <input
                    type="text"
                    id="device"
                    value={deviceId}
                    onChange={e => setDeviceId(e.target.value)}
                    placeholder="e.g., iphone_stuart, pixel8"
                  />
                  <small>Leave empty to process all devices</small>
                </div>

                <button onClick={handleCalculate} disabled={loading} className="btn-primary">
                  {loading ? (
                    <>
                      <span className="spinner"></span> Processing...
                    </>
                  ) : (
                    <>🎯 Calculate Distance</>
                  )}
                </button>

                <div className="info-box">
                  <strong>ℹ️ What this does:</strong>
                  <ul>
                    <li>Queries PostgreSQL for GPS locations on the selected date</li>
                    <li>Calculates distance from home (40.736097°N, 74.039373°W)</li>
                    <li>Generates CSV report with timestamps and metrics</li>
                    <li>Processes asynchronously via job queue</li>
                  </ul>
                </div>
              </div>

              <div className="api-status-card">
                <h3>🔌 API Status</h3>
                <div className="api-status-item">
                  <span className="status-indicator pending"></span>
                  <div>
                    <strong>gRPC Gateway</strong>
                    <p>Pending HTTP proxy implementation</p>
                  </div>
                </div>
                <div className="api-status-item">
                  <span className="status-indicator success"></span>
                  <div>
                    <strong>CSV Download</strong>
                    <p>Available via /download/ endpoint</p>
                  </div>
                </div>
                <div className="api-status-item">
                  <span className="status-indicator pending"></span>
                  <div>
                    <strong>Job Status Polling</strong>
                    <p>WebSocket or SSE integration planned</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job History Tab */}
          {activeTab === 'jobs' && (
            <div className="jobs-section">
              <div className="jobs-header">
                <h3>📋 Distance Calculation Jobs</h3>
                <div className="filter-group">
                  <label>Filter by status:</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="queued">Queued</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="jobs-list">
                {filteredJobs.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <h4>No jobs found</h4>
                    <p>Start a new calculation to see results here</p>
                  </div>
                ) : (
                  filteredJobs.map(job => (
                    <div key={job.job_id} className="job-card">
                      <div className="job-header">
                        <div className="job-main">
                          <span className={`badge badge-${getStatusColor(job.status)}`}>
                            {getStatusIcon(job.status)} {job.status.toUpperCase()}
                          </span>
                          <h4>{job.date}</h4>
                          {job.device_id && <span className="device-badge">{job.device_id}</span>}
                        </div>
                        <div className="job-id">
                          <code>{job.job_id}</code>
                        </div>
                      </div>

                      {job.result && (
                        <div className="job-metrics">
                          <div className="metric">
                            <span className="metric-icon">📏</span>
                            <div>
                              <div className="metric-label">Total Distance</div>
                              <div className="metric-value">
                                {job.result.total_distance_km.toFixed(1)} km
                              </div>
                            </div>
                          </div>
                          <div className="metric">
                            <span className="metric-icon">📌</span>
                            <div>
                              <div className="metric-label">Locations</div>
                              <div className="metric-value">
                                {job.result.total_locations.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="metric">
                            <span className="metric-icon">🎯</span>
                            <div>
                              <div className="metric-label">Max Distance</div>
                              <div className="metric-value">
                                {job.result.max_distance_km.toFixed(1)} km
                              </div>
                            </div>
                          </div>
                          <div className="metric">
                            <span className="metric-icon">⚡</span>
                            <div>
                              <div className="metric-label">Processing Time</div>
                              <div className="metric-value">
                                {formatDuration(job.result.processing_time_ms)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="job-footer">
                        <div className="job-timestamps">
                          <small>Queued: {new Date(job.queued_at).toLocaleString()}</small>
                          {job.completed_at && (
                            <small>Completed: {new Date(job.completed_at).toLocaleString()}</small>
                          )}
                        </div>
                        {job.status === 'completed' && job.result && (
                          <button
                            className="btn-download"
                            onClick={() => handleDownloadCSV(job.result!.csv_path)}
                          >
                            📥 Download CSV
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <div className="feature-grid">
                <div className="feature-card coming-soon">
                  <span className="feature-icon">📈</span>
                  <h3>Distance Timeline</h3>
                  <p>Visualize your movement patterns over time with interactive charts</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>

                <div className="feature-card coming-soon">
                  <span className="feature-icon">🗺️</span>
                  <h3>Location Heatmap</h3>
                  <p>See where you spend most of your time with geographic heatmaps</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>

                <div className="feature-card coming-soon">
                  <span className="feature-icon">📊</span>
                  <h3>Daily Statistics</h3>
                  <p>Average distance, peak times, and movement insights</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>

                <div className="feature-card coming-soon">
                  <span className="feature-icon">🎪</span>
                  <h3>Activity Patterns</h3>
                  <p>Identify commute patterns and frequently visited locations</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>

                <div className="feature-card coming-soon">
                  <span className="feature-icon">📅</span>
                  <h3>Monthly Reports</h3>
                  <p>Comprehensive monthly summary with trends and comparisons</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>

                <div className="feature-card coming-soon">
                  <span className="feature-icon">🔔</span>
                  <h3>Alerts & Notifications</h3>
                  <p>Get notified when you cross distance thresholds or patterns change</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>

              <div className="roadmap-card">
                <h3>🛣️ Development Roadmap</h3>
                <div className="roadmap-items">
                  <div className="roadmap-item done">
                    <span className="roadmap-icon">✅</span>
                    <div>
                      <strong>Phase 1: gRPC Service</strong>
                      <p>Distance calculation service with job queue (otel-worker)</p>
                    </div>
                  </div>
                  <div className="roadmap-item done">
                    <span className="roadmap-icon">✅</span>
                    <div>
                      <strong>Phase 2: CSV Downloads</strong>
                      <p>HTTP proxy endpoint for downloading calculation results</p>
                    </div>
                  </div>
                  <div className="roadmap-item current">
                    <span className="roadmap-icon">🚧</span>
                    <div>
                      <strong>Phase 3: UI Framework</strong>
                      <p>React component structure and design system (current)</p>
                    </div>
                  </div>
                  <div className="roadmap-item">
                    <span className="roadmap-icon">⏳</span>
                    <div>
                      <strong>Phase 4: API Integration</strong>
                      <p>HTTP endpoints for job management and status polling</p>
                    </div>
                  </div>
                  <div className="roadmap-item">
                    <span className="roadmap-icon">📊</span>
                    <div>
                      <strong>Phase 5: Data Visualization</strong>
                      <p>Charts, maps, and interactive analytics dashboard</p>
                    </div>
                  </div>
                  <div className="roadmap-item">
                    <span className="roadmap-icon">🤖</span>
                    <div>
                      <strong>Phase 6: Advanced Features</strong>
                      <p>Real-time updates, WebSocket integration, ML insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
