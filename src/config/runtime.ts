/**
 * Runtime Configuration Helper
 * Reads configuration from window.__ENV__ (injected at container startup)
 * Falls back to import.meta.env for development
 */

interface RuntimeConfig {
  API_BASE_URL: string;
  COGNITO_DOMAIN: string;
  COGNITO_CLIENT_ID: string;
  COGNITO_REDIRECT_URI: string;
  COGNITO_ISSUER: string;
  APP_VERSION: string;
  APP_NAME: string;
}

declare global {
  interface Window {
    __ENV__?: RuntimeConfig;
  }
}

/**
 * Get configuration value with runtime override support
 * Priority: window.__ENV__ > import.meta.env > default
 */
export function getConfig<K extends keyof RuntimeConfig>(key: K, fallback?: string): string {
  // Try runtime config first (from config.js)
  if (typeof window !== 'undefined' && window.__ENV__) {
    const value = window.__ENV__[key];
    if (value) return value;
  }

  // Fall back to build-time env vars
  const envKey = `VITE_${key}`;
  const envValue = import.meta.env[envKey];
  if (envValue) return envValue;

  // Use fallback if provided
  if (fallback) return fallback;

  throw new Error(`Missing required configuration: ${key}`);
}

/**
 * Get all configuration values
 */
export function getAllConfig(): RuntimeConfig {
  return {
    API_BASE_URL: getConfig('API_BASE_URL'),
    COGNITO_DOMAIN: getConfig('COGNITO_DOMAIN'),
    COGNITO_CLIENT_ID: getConfig('COGNITO_CLIENT_ID'),
    COGNITO_REDIRECT_URI: getConfig('COGNITO_REDIRECT_URI'),
    COGNITO_ISSUER: getConfig('COGNITO_ISSUER'),
    APP_VERSION: getConfig('APP_VERSION', 'dev'),
    APP_NAME: getConfig('APP_NAME', 'otel-ui'),
  };
}
