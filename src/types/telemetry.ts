export type TelemetryCategory =
  | 'navigation'
  | 'game'
  | 'versus'
  | 'interaction'
  | 'social'
  | 'system';

export interface TelemetryEvent {
  id: string;
  timestamp: string; // ISO 8601
  category: TelemetryCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface DeviceMetrics {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;
  viewport: string;
  pixelRatio: number;
  colorScheme: 'dark' | 'light';
  language: string;
  timezone: string;
  connectionType: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
}

export interface PerformanceMetrics {
  pageLoadTimeMs: number;
  domReadyTimeMs: number;
  ttfbMs: number;
  dnsTimeMs: number;
}

export interface AggregatedStats {
  totalSessions: number;
  totalEvents: number;
  totalDurationSeconds: number;
  gamePlays: {
    screenle: number;
    indledle: number;
    linkle: number;
    versus: number;
  };
  gameWins: {
    screenle: number;
    indledle: number;
    linkle: number;
    versus: number;
  };
  browsersCount: Record<string, number>;
  osCount: Record<string, number>;
  devicesCount: Record<string, number>;
  dailyActivity: Record<string, number>; // "YYYY-MM-DD" -> count
  hourlyActivity: Record<string, number>; // "HH" -> count
}

export interface TelemetrySnapshot {
  sessionId: string;
  device: DeviceMetrics;
  performance: PerformanceMetrics;
  stats: AggregatedStats;
  recentEvents: TelemetryEvent[];
  startedAt: string;
}
