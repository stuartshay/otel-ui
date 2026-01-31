import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { paths } from '@stuartshay/otel-types';
import { authService } from './auth';
import { getConfig } from '../config/runtime';

// Extract response types from OpenAPI schema
export type HealthResponse = paths['/health']['get']['responses']['200']['content']['*/*'];
export type ReadyResponse = paths['/ready']['get']['responses']['200']['content']['*/*'];
export type InfoResponse = paths['/info']['get']['responses']['200']['content']['*/*'];
export type ChainResponse = paths['/chain']['get']['responses']['200']['content']['*/*'];
export type ErrorResponse = paths['/error']['get']['responses']['500']['content']['*/*'];
export type SlowResponse = paths['/slow']['get']['responses']['200']['content']['*/*'];

// Database endpoint types - derived from OpenAPI schema
export type DatabaseStatusResponse =
  paths['/db/status']['get']['responses']['200']['content']['*/*'];
export type DatabaseLocationsResponse =
  paths['/db/locations']['get']['responses']['200']['content']['*/*'];
export type LocationsQueryParams = paths['/db/locations']['get']['parameters']['query'];

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

// Generic API response type with trace ID (for custom endpoints)
export type ApiResponse = {
  trace_id?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
};

/**
 * API Client Service for otel-demo backend
 *
 * Features:
 * - Axios instance with base URL configuration
 * - Request interceptor for Authorization header
 * - Response interceptor for 401/403 handling
 * - Type-safe endpoints using @stuartshay/otel-types OpenAPI schema
 * - Trace ID extraction from x-trace-id header
 */

const baseURL = getConfig('API_BASE_URL');

/**
 * Create Axios instance with default configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add Authorization header with access token
 */
axiosInstance.interceptors.request.use(
  async config => {
    const token = await authService.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateRetryDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

/**
 * Check if request should be retried based on error
 */
function shouldRetry(error: AxiosError): boolean {
  // For network errors (no response), only retry on connection timeout or abort errors
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  }

  // Retry on specific status codes
  return RETRY_CONFIG.retryStatusCodes.includes(error.response.status);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Response interceptor - Handle errors, extract trace IDs, and implement retry logic
 */
axiosInstance.interceptors.response.use(
  response => {
    // Extract trace ID from response header
    const traceId = response.headers['x-trace-id'];
    if (traceId) {
      console.log(
        `[Trace ID: ${traceId}] ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }

    // Attach trace ID to response data for components
    if (response.data && typeof response.data === 'object') {
      response.data.traceId = traceId;
    }

    // Reset retry count on success
    delete (response.config as InternalAxiosRequestConfig & { __retryCount?: number }).__retryCount;

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };
    const traceId = error.response?.headers['x-trace-id'];

    if (traceId) {
      console.error(`[Trace ID: ${traceId}] Error:`, error.message);
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.error('Unauthorized (401) - Redirecting to login');
      await authService.logout();
      return Promise.reject(new Error('Authentication required'));
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error('Forbidden (403) - Insufficient permissions');
      return Promise.reject(new Error('Access denied'));
    }

    // Implement retry logic for transient errors
    if (config && shouldRetry(error)) {
      config.__retryCount = config.__retryCount || 0;

      if (config.__retryCount < RETRY_CONFIG.maxRetries) {
        config.__retryCount += 1;
        const delay = calculateRetryDelay(config.__retryCount - 1);

        console.log(
          `[Retry ${config.__retryCount}/${RETRY_CONFIG.maxRetries}] ` +
            `Retrying ${config.method?.toUpperCase()} ${config.url} in ${Math.round(delay)}ms`
        );

        await sleep(delay);
        return axiosInstance(config);
      }

      console.error(
        `[Max Retries Exceeded] Failed after ${RETRY_CONFIG.maxRetries} retries: ${config.url}`
      );
    }

    // Log other errors with trace ID if available
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      traceId,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);

/**
 * API Client Service
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axiosInstance;
  }

  /**
   * Health check endpoint
   * GET /health
   */
  async health(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await this.client.get('/health');
    return response.data;
  }

  /**
   * Readiness check endpoint
   * GET /ready
   */
  async ready(): Promise<ReadyResponse> {
    const response = await this.client.get('/ready');
    return response.data;
  }

  /**
   * Get service information
   * GET /info
   */
  async getServiceInfo(): Promise<InfoResponse> {
    const response: AxiosResponse<InfoResponse> = await this.client.get('/info');
    return response.data;
  }

  /**
   * Chain demo - Nested spans demonstration
   * GET /chain
   */
  async getChainDemo(): Promise<ChainResponse> {
    const response: AxiosResponse<ChainResponse> = await this.client.get('/chain');
    return response.data;
  }

  /**
   * Error demo - Trigger error for testing
   * GET /error
   */
  async getErrorDemo(): Promise<ErrorResponse> {
    const response: AxiosResponse<ErrorResponse> = await this.client.get('/error');
    return response.data;
  }

  /**
   * Slow endpoint demo - Latency testing
   * GET /slow
   */
  async getSlowDemo(): Promise<SlowResponse> {
    const response: AxiosResponse<SlowResponse> = await this.client.get('/slow');
    return response.data;
  }

  /**
   * Database status endpoint
   * GET /db/status
   * Returns database connection status and version info
   */
  async getDatabaseStatus(): Promise<DatabaseStatusResponse> {
    const response: AxiosResponse<DatabaseStatusResponse> = await this.client.get('/db/status');
    return response.data;
  }

  /**
   * Database locations endpoint
   * GET /db/locations
   * Returns paginated list of location records from OwnTracks database
   *
   * @param params - Query parameters for pagination and sorting
   */
  async getDatabaseLocations(params?: LocationsQueryParams): Promise<DatabaseLocationsResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
    }

    const queryString = queryParams.toString();
    const url = `/db/locations${queryString ? `?${queryString}` : ''}`;

    const response: AxiosResponse<DatabaseLocationsResponse> = await this.client.get(url);
    return response.data;
  }

  /**
   * Generic GET request
   */
  async get<T = unknown>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T = unknown>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }

  /**
   * Get Axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
