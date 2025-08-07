// App configuration for different environments
export const APP_CONFIG = {
  // Server URL - will be used for APK builds
  SERVER_URL: import.meta.env.VITE_SERVER_URL || window.location.origin,
  
  // WebSocket URL
  getWebSocketUrl: () => {
    const serverUrl = APP_CONFIG.SERVER_URL;
    const url = new URL(serverUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}/ws`;
  },
  
  // API base URL
  getApiUrl: () => {
    return `${APP_CONFIG.SERVER_URL}/api`;
  },
  
  // Check if running in Capacitor (native app)
  isNative: () => {
    return !!(window as any).Capacitor;
  },
  
  // Environment detection
  isDevelopment: () => {
    return import.meta.env.DEV;
  },
  
  isProduction: () => {
    return import.meta.env.PROD;
  }
};