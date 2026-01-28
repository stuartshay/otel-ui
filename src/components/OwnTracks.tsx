import { useState, useEffect } from 'react';
import Layout from './Layout';
import Toast from './Toast';
import { getConfig } from '../config/runtime';
import { ownTracksService, type Job } from '../services/owntracks';
import '../styles/OwnTracks.css';
import '../styles/Toast.css';

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
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Fetch jobs from API
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await ownTracksService.listJobs({
        limit: 50,
        offset: 0,
      });

      // Transform JobSummary[] to Job[] by fetching full status for each
      const fullJobs: Job[] = [];
      for (const jobSummary of response.jobs) {
        try {
          const fullJob = await ownTracksService.getJobStatus(jobSummary.job_id);
          fullJobs.push(fullJob);
        } catch (err) {
          // If we can't get full job details, use summary data
          console.error(`Failed to get full job details for ${jobSummary.job_id}:`, err);
          fullJobs.push(jobSummary as Job);
        }
      }

      setJobs(fullJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setToast({
        message: 'Failed to load job history. Please refresh the page.',
        type: 'error',
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Poll for job updates for processing jobs
  useEffect(() => {
    const processingJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued');

    if (processingJobs.length === 0) return;

    const pollInterval = setInterval(async () => {
      for (const job of processingJobs) {
        try {
          const updatedJob = await ownTracksService.getJobStatus(job.job_id);

          // Update job in state if status changed
          if (updatedJob.status !== job.status) {
            setJobs(prevJobs => prevJobs.map(j => (j.job_id === job.job_id ? updatedJob : j)));

            // Show toast on completion
            if (updatedJob.status === 'completed') {
              setToast({
                message: `Job ${updatedJob.job_id} completed successfully!`,
                type: 'success',
              });
            } else if (updatedJob.status === 'failed') {
              setToast({
                message: `Job ${updatedJob.job_id} failed: ${updatedJob.error_message || 'Unknown error'}`,
                type: 'error',
              });
            }
          }
        } catch (error) {
          console.error(`Failed to poll job ${job.job_id}:`, error);
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [jobs]);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // Call API to start distance calculation
      const response = await ownTracksService.calculateDistance(
        selectedDate,
        deviceId || undefined
      );

      // Add new job to state (in queued status)
      const newJob: Job = {
        job_id: response.job_id,
        status: 'queued' as const,
        date: selectedDate,
        device_id: deviceId,
        queued_at: response.queued_at,
      };

      setJobs(prevJobs => [newJob, ...prevJobs]);

      setToast({
        message: `Distance calculation job started!\nJob ID: ${response.job_id}\nDate: ${selectedDate}\nDevice: ${deviceId || 'All devices'}`,
        type: 'success',
      });

      // Switch to Jobs tab to see the new job
      setActiveTab('jobs');
    } catch (error) {
      console.error('Error starting calculation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToast({
        message: `Failed to start calculation job: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = (downloadUrl: string) => {
    // downloadUrl is already the full path from API (e.g., /api/distance/download/filename.csv)
    const apiBaseUrl = getConfig('API_BASE_URL');
    const fullUrl = `${apiBaseUrl}${downloadUrl}`;
    window.open(fullUrl, '_blank');
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
        <div className="tabs" role="tablist">
          <button
            id="calculate-tab"
            role="tab"
            aria-selected={activeTab === 'calculate'}
            aria-controls="calculate-panel"
            className={`tab ${activeTab === 'calculate' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculate')}
          >
            🎯 Calculate Distance
          </button>
          <button
            id="jobs-tab"
            role="tab"
            aria-selected={activeTab === 'jobs'}
            aria-controls="jobs-panel"
            className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            📋 Job History
          </button>
          <button
            id="analytics-tab"
            role="tab"
            aria-selected={activeTab === 'analytics'}
            aria-controls="analytics-panel"
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
            <div
              id="calculate-panel"
              role="tabpanel"
              aria-labelledby="calculate-tab"
              className="calculate-section"
            >
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
                  <span className="status-indicator success" aria-label="Status: Available"></span>
                  <div>
                    <strong>REST API Gateway</strong>
                    <p>Connected to otel-demo backend</p>
                  </div>
                </div>
                <div className="api-status-item">
                  <span className="status-indicator success" aria-label="Status: Available"></span>
                  <div>
                    <strong>CSV Download</strong>
                    <p>Available via /api/distance/download/</p>
                  </div>
                </div>
                <div className="api-status-item">
                  <span className="status-indicator success" aria-label="Status: Available"></span>
                  <div>
                    <strong>Job Status Polling</strong>
                    <p>Auto-refresh active (3s interval)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job History Tab */}
          {activeTab === 'jobs' && (
            <div
              id="jobs-panel"
              role="tabpanel"
              aria-labelledby="jobs-tab"
              className="jobs-section"
            >
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
                {loadingJobs ? (
                  <div className="empty-state">
                    <span className="spinner"></span>
                    <h4>Loading jobs...</h4>
                  </div>
                ) : filteredJobs.length === 0 ? (
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
                            onClick={() => handleDownloadCSV(job.result!.csv_download_url)}
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
            <div
              id="analytics-panel"
              role="tabpanel"
              aria-labelledby="analytics-tab"
              className="analytics-section"
            >
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
                  <div className="roadmap-item done">
                    <span className="roadmap-icon">✅</span>
                    <div>
                      <strong>Phase 3: UI Framework</strong>
                      <p>React component structure and design system</p>
                    </div>
                  </div>
                  <div className="roadmap-item done">
                    <span className="roadmap-icon">✅</span>
                    <div>
                      <strong>Phase 4: API Integration</strong>
                      <p>HTTP endpoints for job management and status polling</p>
                    </div>
                  </div>
                  <div className="roadmap-item current">
                    <span className="roadmap-icon">🚧</span>
                    <div>
                      <strong>Phase 5: Data Visualization</strong>
                      <p>Charts, maps, and interactive analytics dashboard (next)</p>
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

      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </Layout>
  );
}
