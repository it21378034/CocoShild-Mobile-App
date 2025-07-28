// API Configuration
// Update this IP address to match your computer's IP address
export const API_BASE_URL = 'http://192.168.18.73:8001';

// API Endpoints
export const API_ENDPOINTS = {
  TREATMENTS: `${API_BASE_URL}/treatments`,
  DIAGNOSE: `${API_BASE_URL}/diagnose-multiple`,
  VALIDATE: `${API_BASE_URL}/validate-coconut-leaf`,
  HISTORY: `${API_BASE_URL}/history`,
  OFFICERS: `${API_BASE_URL}/officers`,
  REPORT: `${API_BASE_URL}/report`,
  ALERTS: `${API_BASE_URL}/alerts`,
  WEATHER: `${API_BASE_URL}/weather`,
  WEATHER_RISK: `${API_BASE_URL}/weather-risk`,
  FARM_STATS: `${API_BASE_URL}/farm-stats`,
  TEST: `${API_BASE_URL}/test`,
};

// API Configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
}; 