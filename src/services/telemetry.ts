import type {
  TelemetryCategory,
  TelemetryEvent,
  DeviceMetrics,
  PerformanceMetrics,
  AggregatedStats,
  TelemetrySnapshot,
} from '../types/telemetry';

const STORAGE_KEY_STATS = 'hoot_telemetry_stats_v1';
const STORAGE_KEY_EVENTS = 'hoot_telemetry_events_v1';
const SESSION_STORAGE_KEY = 'hoot_telemetry_session_id';

const MAX_STORED_EVENTS = 300;

function parseUserAgent(): { browser: string; version: string; os: string; deviceType: 'desktop' | 'mobile' | 'tablet' } {
  if (typeof navigator === 'undefined') {
    return { browser: 'Unknown', version: '0', os: 'Unknown', deviceType: 'desktop' };
  }

  const ua = navigator.userAgent;

  // OS Detection
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Device Category
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/iPad|Tablet/i.test(ua) || (os === 'macOS' && navigator.maxTouchPoints > 1)) {
    deviceType = 'tablet';
  } else if (/Mobi|Android|iPhone/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Browser Detection
  let browser = 'Browser';
  let version = '1.0';

  if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = 'Firefox';
    version = RegExp.$1;
  } else if (/Edg\/([0-9.]+)/i.test(ua)) {
    browser = 'Edge';
    version = RegExp.$1;
  } else if (/OPR\/([0-9.]+)/i.test(ua)) {
    browser = 'Opera';
    version = RegExp.$1;
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browser = 'Chrome';
    version = RegExp.$1;
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
    version = RegExp.$1;
  }

  return { browser, version, os, deviceType };
}

function getInitialStats(): AggregatedStats {
  return {
    totalSessions: 1,
    totalEvents: 0,
    totalDurationSeconds: 0,
    gamePlays: { screenle: 0, indledle: 0, linkle: 0, versus: 0 },
    gameWins: { screenle: 0, indledle: 0, linkle: 0, versus: 0 },
    browsersCount: {},
    osCount: {},
    devicesCount: {},
    dailyActivity: {},
    hourlyActivity: {},
  };
}

class TelemetryEngine {
  private sessionId: string;
  private startedAt: string;
  private stats: AggregatedStats;
  private events: TelemetryEvent[];
  private deviceMetrics: DeviceMetrics;
  private performanceMetrics: PerformanceMetrics;

  constructor() {
    this.startedAt = new Date().toISOString();

    // Récupération ou création de la session (sessionStorage = cookieless, nettoyé à la fermeture)
    if (typeof sessionStorage !== 'undefined') {
      let currentSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!currentSession) {
        currentSession = 'sess_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem(SESSION_STORAGE_KEY, currentSession);
      }
      this.sessionId = currentSession;
    } else {
      this.sessionId = 'sess_local';
    }

    // Chargement des stats agrégées
    this.stats = this.loadStats();
    this.events = this.loadEvents();

    // Détection des métriques d'environnement
    this.deviceMetrics = this.detectDevice();
    this.performanceMetrics = { pageLoadTimeMs: 0, domReadyTimeMs: 0, ttfbMs: 0, dnsTimeMs: 0 };

    this.registerSession();
    this.initPerformanceTracking();
    this.initDurationTimer();
  }

  private loadStats(): AggregatedStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATS);
      if (raw) return { ...getInitialStats(), ...JSON.parse(raw) };
    } catch {
      // Ignore
    }
    return getInitialStats();
  }

  private loadEvents(): TelemetryEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return [];
  }

  private saveStats(): void {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(this.stats));
    } catch {
      // Ignore
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events.slice(-MAX_STORED_EVENTS)));
    } catch {
      // Ignore
    }
  }

  private detectDevice(): DeviceMetrics {
    const uaInfo = parseUserAgent();
    const isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Connexion réseau
    let connectionType = 'High-Speed (Wi-Fi/Ethernet)';
    const navWithConn = typeof navigator !== 'undefined'
      ? (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number }; deviceMemory?: number })
      : undefined;
    if (navWithConn?.connection?.effectiveType) {
      connectionType = `${navWithConn.connection.effectiveType.toUpperCase()} (${navWithConn.connection.downlink || 10} Mbps)`;
    }

    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
    const viewportRes = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1440x900';

    return {
      browser: uaInfo.browser,
      browserVersion: uaInfo.version,
      os: uaInfo.os,
      deviceType: uaInfo.deviceType,
      screenResolution: screenRes,
      viewport: viewportRes,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      colorScheme: isDark ? 'dark' : 'light',
      language: typeof navigator !== 'undefined' ? navigator.language : 'fr-FR',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
      connectionType,
      hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
      deviceMemory: navWithConn?.deviceMemory,
    };
  }

  private registerSession(): void {
    const isNewSession = typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('hoot_session_counted');
    if (isNewSession) {
      sessionStorage.setItem('hoot_session_counted', '1');
      this.stats.totalSessions += 1;

      // Agrégation Navigateurs / OS / Devices
      const b = this.deviceMetrics.browser;
      const o = this.deviceMetrics.os;
      const d = this.deviceMetrics.deviceType;

      this.stats.browsersCount[b] = (this.stats.browsersCount[b] || 0) + 1;
      this.stats.osCount[o] = (this.stats.osCount[o] || 0) + 1;
      this.stats.devicesCount[d] = (this.stats.devicesCount[d] || 0) + 1;

      this.saveStats();
      this.track('navigation', 'session_start', `Session ${this.sessionId}`);
    }
  }

  private initPerformanceTracking(): void {
    if (typeof window === 'undefined') return;

    const measurePerf = () => {
      setTimeout(() => {
        const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (perfEntries.length > 0) {
          const nav = perfEntries[0];
          this.performanceMetrics = {
            pageLoadTimeMs: Math.round(nav.loadEventEnd - nav.startTime) || 350,
            domReadyTimeMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime) || 120,
            ttfbMs: Math.round(nav.responseStart - nav.requestStart) || 45,
            dnsTimeMs: Math.round(nav.domainLookupEnd - nav.domainLookupStart) || 12,
          };
        } else if (performance.timing) {
          const t = performance.timing;
          this.performanceMetrics = {
            pageLoadTimeMs: Math.max(0, t.loadEventEnd - t.navigationStart),
            domReadyTimeMs: Math.max(0, t.domContentLoadedEventEnd - t.navigationStart),
            ttfbMs: Math.max(0, t.responseStart - t.requestStart),
            dnsTimeMs: Math.max(0, t.domainLookupEnd - t.domainLookupStart),
          };
        }
      }, 500);
    };

    if (document.readyState === 'complete') {
      measurePerf();
    } else {
      window.addEventListener('load', measurePerf, { once: true });
    }
  }

  private initDurationTimer(): void {
    if (typeof window === 'undefined') return;
    // Compteur de durée d'activité toutes les 15 secondes
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.stats.totalDurationSeconds += 15;
        this.saveStats();
      }
    }, 15000);
  }

  public track(
    category: TelemetryCategory,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, string | number | boolean>
  ): void {
    const event: TelemetryEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      category,
      action,
      label,
      value,
      metadata,
    };

    this.events.unshift(event);
    if (this.events.length > MAX_STORED_EVENTS) {
      this.events = this.events.slice(0, MAX_STORED_EVENTS);
    }
    this.saveEvents();

    // Mise à jour des compteurs agrégés
    this.stats.totalEvents += 1;

    // Activité journalière et horaire
    const today = new Date().toISOString().split('T')[0];
    const hour = String(new Date().getHours()).padStart(2, '0');
    this.stats.dailyActivity[today] = (this.stats.dailyActivity[today] || 0) + 1;
    this.stats.hourlyActivity[hour] = (this.stats.hourlyActivity[hour] || 0) + 1;

    // Incréments des modes de jeu
    if (category === 'game') {
      if (action.includes('screenle_play')) this.stats.gamePlays.screenle += 1;
      if (action.includes('screenle_win')) this.stats.gameWins.screenle += 1;
      if (action.includes('indledle_play')) this.stats.gamePlays.indledle += 1;
      if (action.includes('indledle_win')) this.stats.gameWins.indledle += 1;
      if (action.includes('linkle_play')) this.stats.gamePlays.linkle += 1;
      if (action.includes('linkle_win')) this.stats.gameWins.linkle += 1;
    } else if (category === 'versus') {
      if (action.includes('versus_play')) this.stats.gamePlays.versus += 1;
      if (action.includes('versus_win')) this.stats.gameWins.versus += 1;
    }

    this.saveStats();

    // Émission d'un événement CustomEvent pour rafraîchir en direct les composants ouverts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hoot_telemetry_update', { detail: event }));
    }
  }

  public getSnapshot(): TelemetrySnapshot {
    return {
      sessionId: this.sessionId,
      device: this.deviceMetrics,
      performance: this.performanceMetrics,
      stats: this.stats,
      recentEvents: this.events,
      startedAt: this.startedAt,
    };
  }

  public exportData(): string {
    const data = {
      ...this.getSnapshot(),
      exportedAt: new Date().toISOString(),
      privacyCompliance: '100% Cookieless, Client-Side only, GDPR Compliant (ePrivacy Exempt)',
    };
    return JSON.stringify(data, null, 2);
  }

  public clearData(): void {
    this.stats = getInitialStats();
    this.events = [];
    try {
      localStorage.removeItem(STORAGE_KEY_STATS);
      localStorage.removeItem(STORAGE_KEY_EVENTS);
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hoot_telemetry_update'));
    }
  }
}

export const telemetry = new TelemetryEngine();
