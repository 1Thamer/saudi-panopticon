# 🇸🇦 Saudi AI Panopticon

A modern, bilingual (Arabic/English) AI-powered regional risk intelligence dashboard for Saudi Arabia.

## 🌐 Live Demo
https://1thamer.github.io/saudi-panopticon/

## Features
- Interactive Saudi Arabia choropleth map with live risk scoring
- Per-region refresh controls for on-demand AI ingestion
- Real-time news via NewsAPI (Saudi-focused)
- Population data from GASTAT open baselines (2024–2030 projections)
- Social signal normalization (severity, confidence, geo-assignment)
- Multi-year risk predictions (2026–2030)
- Bilingual UI (Arabic / English) with RTL support
- Screenshot endpoint hook for source previews
- Production-ready for GeoJSON boundary API joins

## Data Sources
| Source | Purpose |
|--------|--------|
| NewsAPI.org | Saudi news ingestion (live) |
| GASTAT 2024 Census | Population baselines |
| GeoJSON-Saudi regions | Choropleth boundary data |
| Social Signal Service | Normalized social media scores |

## Deployment
Auto-deployed via GitHub Pages from `main` branch.

To run locally:
```bash
npx serve .
```

## Configuration
Set your API key in `api.js`:
```js
const NEWS_API_KEY = 'YOUR_KEY_HERE';
```
Free keys: https://newsapi.org/register

## Production Integration
Replace the `fetchNews()` and `fetchSocialSignals()` functions in `api.js` with your production endpoints. The schema expected:
```json
{
  "region": "riyadh",
  "confidence": 0.87,
  "severity": "high",
  "timestamp": "2026-06-06T20:00:00Z",
  "title": "...",
  "summary": "..."
}
```
