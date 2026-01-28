import { apiService } from './api';

/**
 * OwnTracks API Service
 *
 * Provides methods to interact with the distance calculation API
 * endpoints exposed by otel-demo backend.
 */

// Type definitions matching the API responses

export interface JobResult {
  csv_download_url: string;
  total_distance_km: number;
  total_locations: number;
  max_distance_km: number;
  min_distance_km: number;
  processing_time_ms: number;
  date: string;
  device_id: string;
}

export interface Job {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  date: string;
  device_id: string;
  queued_at: string;
  started_at?: string;
  completed_at?: string;
  result?: JobResult;
  error_message?: string;
  trace_id?: string;
}

export interface CalculateDistanceRequest {
  date: string;
  device_id?: string;
}

export interface CalculateDistanceResponse {
  job_id: string;
  status: string;
  queued_at: string;
  status_url: string;
  trace_id: string;
}

export type GetJobStatusResponse = Job;

export interface JobSummary {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  date: string;
  device_id: string;
  queued_at: string;
  completed_at?: string;
}

export interface ListJobsResponse {
  jobs: JobSummary[];
  total_count: number;
  limit: number;
  offset: number;
  next_offset: number | null;
  trace_id: string;
}

export interface ListJobsFilters {
  status?: 'queued' | 'processing' | 'completed' | 'failed';
  date?: string;
  device_id?: string;
  limit?: number;
  offset?: number;
}

/**
 * OwnTracks API Service
 */
class OwnTracksService {
  /**
   * Start a distance calculation job
   *
   * @param date - Date in YYYY-MM-DD format
   * @param deviceId - Optional device identifier to filter locations
   * @returns Job creation response with job_id
   */
  async calculateDistance(date: string, deviceId?: string): Promise<CalculateDistanceResponse> {
    const payload: CalculateDistanceRequest = {
      date,
      ...(deviceId && { device_id: deviceId }),
    };

    return await apiService.post<CalculateDistanceResponse>('/api/distance/calculate', payload);
  }

  /**
   * Get the status and results of a distance calculation job
   *
   * @param jobId - UUID of the job to query
   * @returns Job status with results if completed
   */
  async getJobStatus(jobId: string): Promise<GetJobStatusResponse> {
    return await apiService.get<GetJobStatusResponse>(`/api/distance/jobs/${jobId}`);
  }

  /**
   * List distance calculation jobs with optional filtering
   *
   * @param filters - Optional filters (status, date, device_id, limit, offset)
   * @returns Paginated list of jobs
   */
  async listJobs(filters?: ListJobsFilters): Promise<ListJobsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      if (filters.device_id) params.append('device_id', filters.device_id);
      if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
      if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = `/api/distance/jobs${queryString ? `?${queryString}` : ''}`;

    return await apiService.get<ListJobsResponse>(url);
  }

  /**
   * Poll job status until it reaches a terminal state (completed or failed)
   *
   * @param jobId - UUID of the job to poll
   * @param onUpdate - Callback invoked on each status check
   * @param maxAttempts - Maximum polling attempts (default: 60)
   * @param intervalMs - Polling interval in milliseconds (default: 2000)
   * @returns Final job status
   */
  async pollJobStatus(
    jobId: string,
    onUpdate?: (job: GetJobStatusResponse) => void,
    maxAttempts: number = 60,
    intervalMs: number = 2000
  ): Promise<GetJobStatusResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getJobStatus(jobId);

      if (onUpdate) {
        onUpdate(job);
      }

      // Check if job reached terminal state
      if (job.status === 'completed' || job.status === 'failed') {
        return job;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }

    throw new Error(`Job ${jobId} did not complete within ${maxAttempts} attempts`);
  }
}

// Export singleton instance
export const ownTracksService = new OwnTracksService();
export default ownTracksService;
