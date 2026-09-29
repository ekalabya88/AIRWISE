export interface User {
  id: string;
  name: string;
  email: string;
  home_city: string;
  sensitivity_group: string;
  alert_threshold: string;
  notify_enabled: boolean;
  saved_locations?: string[];
  created_at?: string;
}

export interface PollutantDetail {
  value: number;
  unit: string;
  label: string;
}

export interface WeatherData {
  temperature: number;
  temperature_formatted: string;
  humidity: number;
  humidity_formatted: string;
  wind_speed: number;
  wind_formatted: string;
  condition: string;
  summary: string;
}

export interface StationData {
  id: string;
  name: string;
  city: string;
  area: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  sensor_type: string;
  base_aqi?: number;
  aqi?: number;
  category?: string;
  tier?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  color?: string;
  main_pollutant?: string;
  last_updated?: string;
  data_available?: boolean;
}

export interface CurrentAQIResponse {
  station: StationData;
  aqi: number;
  category: string;
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  color: string;
  meaning: string;
  source: string;
  is_sensor_live: boolean;
  data_status: string;
  last_updated: string;
  pollutants: {
    pm25: PollutantDetail;
    pm10: PollutantDetail;
    co: PollutantDetail;
    no2: PollutantDetail;
    so2: PollutantDetail;
    o3: PollutantDetail;
  };
  weather: WeatherData;
}

export interface NearbyLocationItem {
  id: string;
  name: string;
  full_name: string;
  city: string;
  aqi: number;
  category: string;
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  color: string;
  sensor_type: string;
  distance: string;
}

export interface HealthAdvisoryData {
  aqi: number;
  category: string;
  tier: string;
  color: string;
  sensitivity_group: string;
  location: string;
  advisory: string;
  what_to_do: string[];
  what_not_to_do: string[];
  disclaimer: string;
}

export interface DailyTrendPoint {
  day: string;
  aqi: number;
  pm25: number;
}

export interface WeeklyHistoryMetrics {
  city: string;
  period: string;
  average_aqi: number;
  lowest_aqi: number;
  highest_aqi: number;
  average_pm25: number;
  low_days: number;
  medium_days: number;
  high_days: number;
  daily_trend: DailyTrendPoint[];
}

export interface MonthlyTrendPoint {
  week: string;
  aqi: number;
  pm25: number;
}

export interface MonthlyHistoryMetrics {
  city: string;
  month_name: string;
  average_aqi: number;
  previous_month_avg: number;
  highest_pollution_day: string;
  lowest_pollution_day: string;
  high_aqi_days: number;
  pm25_trend: string;
  trend_statement: string;
  is_improved: boolean;
  monthly_trend: MonthlyTrendPoint[];
}

export interface NotificationAlert {
  id: string;
  user_id: string;
  location: string;
  aqi: number;
  category: string;
  title: string;
  precautions: string[];
  read: boolean;
  created_at: string;
}
