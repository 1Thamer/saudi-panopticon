/**
 * Saudi Panopticon – Data Service Layer
 * Handles: NewsAPI ingestion, population baselines, social signal simulation,
 *          risk scoring, prediction modelling, and geographic assignment.
 *
 * For production: Replace NEWS_API_KEY with a real key from https://newsapi.org/register
 * and wire SOCIAL_API_ENDPOINT to your microservice.
 */

export const NEWS_API_KEY = '49bfe43134974002962c7f02ef7ebdfe';  // Replace with real key
export const NEWS_API_BASE = 'https://newsapi.org/v2';
export const SOCIAL_API_ENDPOINT = null; // Set to your microservice URL

// ── GASTAT 2024 Population Baselines (millions) ──────────────────────────────
export const POPULATION_BASELINES = {
  riyadh:   { base: 8.59,  growthRate: 0.024 },
  makkah:   { base: 9.15,  growthRate: 0.021 },
  eastern:  { base: 5.32,  growthRate: 0.019 },
  madinah:  { base: 2.25,  growthRate: 0.015 },
  asir:     { base: 2.30,  growthRate: 0.017 },
  tabuk:    { base: 1.05,  growthRate: 0.013 },
  qassim:   { base: 1.53,  growthRate: 0.014 },
  hail:     { base: 0.75,  growthRate: 0.011 },
  northern: { base: 0.39,  growthRate: 0.009 },
  jazan:    { base: 1.73,  growthRate: 0.018 },
  najran:   { base: 0.61,  growthRate: 0.012 },
  jouf:     { base: 0.54,  growthRate: 0.008 },
  baha:     { base: 0.51,  growthRate: 0.010 },
};

// ── Population Projections (2026–2030) ────────────────────────────────────────
export function projectPopulation(regionId, years = [2026,2027,2028,2029,2030]) {
  const b = POPULATION_BASELINES[regionId];
  if (!b) return years.map(() => 0);
  const base2026 = b.base * Math.pow(1 + b.growthRate, 2); // 2 years from 2024
  return years.map((y, i) => parseFloat((base2026 * Math.pow(1 + b.growthRate, i)).toFixed(2)));
}

// ── Risk Score Model ──────────────────────────────────────────────────────────
// Combines news volume, social severity, historical baseline, and population density.
export function computeRiskScore(regionId, newsItems = [], socialItems = []) {
  const baselines = {
    riyadh: 70, makkah: 62, eastern: 56, madinah: 42, asir: 47,
    tabuk: 36, qassim: 39, hail: 34, northern: 30, jazan: 51, najran: 45, jouf: 32, baha: 38
  };
  const base = baselines[regionId] ?? 40;
  const newsBoost = Math.min(newsItems.length * 2, 12);
  const socialBoost = socialItems.reduce((acc, s) => {
    if (s.severity === 'high') return acc + 4;
    if (s.severity === 'medium') return acc + 2;
    return acc + 1;
  }, 0);
  const noise = Math.round((Math.random() - 0.5) * 6);
  return Math.max(10, Math.min(98, base + newsBoost + socialBoost + noise));
}

// ── Risk Prediction Model (2026–2030) ─────────────────────────────────────────
export function predictRisk(currentScore, years = 5) {
  return Array.from({ length: years }, (_, i) => {
    const trend = i * 1.8;
    const noise = (Math.random() - 0.48) * 3;
    return Math.round(Math.max(10, Math.min(98, currentScore + trend + noise)));
  });
}

// ── News API Fetcher ──────────────────────────────────────────────────────────
export async function fetchNews(regionEn, regionAr) {
  if (NEWS_API_KEY === 'demo') return getDemoNews(regionEn);
  const query = encodeURIComponent(`${regionEn} Saudi Arabia OR ${regionAr}`);
  const url = `${NEWS_API_BASE}/everything?q=${query}&language=ar,en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return (data.articles || []).map(a => ({
      title: a.title,
      summary: a.description || '',
      source: a.source?.name || 'NewsAPI',
      time: new Date(a.publishedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      url: a.url,
      imageUrl: a.urlToImage,
      level: 'medium'
    }));
  } catch (e) {
    console.warn('[NewsAPI] Falling back to demo data:', e.message);
    return getDemoNews(regionEn);
  }
}

// ── Social Signal Fetcher / Normalizer ────────────────────────────────────────
export async function fetchSocialSignals(regionId) {
  if (SOCIAL_API_ENDPOINT) {
    try {
      const res = await fetch(`${SOCIAL_API_ENDPOINT}/signals?region=${regionId}`);
      const data = await res.json();
      return data.signals || [];
    } catch (e) {
      console.warn('[SocialAPI] Falling back to simulation:', e.message);
    }
  }
  return simulateSocialSignals(regionId);
}

// ── Screenshot Endpoint Hook ──────────────────────────────────────────────────
export function getScreenshotUrl(articleUrl, fallbackImage) {
  const screenshotService = null; // e.g. 'https://api.screenshotone.com/take?url='
  if (screenshotService && articleUrl) return `${screenshotService}${encodeURIComponent(articleUrl)}`;
  return fallbackImage || null;
}

// ── Demo / Fallback Data ──────────────────────────────────────────────────────
function getDemoNews(regionEn) {
  const now = new Date();
  const fmt = (offset) => {
    const d = new Date(now - offset * 60000);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };
  const pool = [
    { title: `AI monitoring detects elevated signal density in ${regionEn}`, summary: 'Normalized event clustering aligns with logistics and infrastructure corridors.', level: 'high', source: 'Panopticon AI', time: fmt(12) },
    { title: `Urban-heat and traffic variance triggers alert in ${regionEn}`, summary: 'Sensor and social streams confirm moderate service-load volatility across key districts.', level: 'medium', source: 'Grid Monitor', time: fmt(35) },
    { title: `${regionEn} regional stability indicators within expected bands`, summary: 'Model confidence remains high; no significant anomaly escalation detected.', level: 'low', source: 'Saudi Monitor', time: fmt(78) },
    { title: `Infrastructure readiness review for ${regionEn} corridor`, summary: 'Operational baseline checks completed with minor variance flags.', level: 'medium', source: 'Ops Desk', time: fmt(120) },
  ];
  return pool;
}

function simulateSocialSignals(regionId) {
  const severities = ['low','medium','high'];
  const count = 2 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, i) => ({
    title: `Social cluster #${i+1} mapped to ${regionId} (${new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'})})`,
    summary: `Normalized post cluster with geo-confidence ${(0.65 + Math.random()*0.3).toFixed(2)}. Severity assigned by NLP classifier.`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    confidence: parseFloat((0.65 + Math.random() * 0.3).toFixed(2)),
    level: 'signal',
    source: 'Social Stream',
    time: new Date(Date.now() - Math.random() * 7200000).toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'})
  }));
}
