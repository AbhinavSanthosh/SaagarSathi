// Central API helper: uses Vite proxy (/api) first, falls back to direct backend.
// This fixes "Service unreachable" when preview/dist is served without proxy,
// and surfaces a clear error telling the user to start the backend.

const DIRECT_FALLBACK = 'http://localhost:3000';

// API contract version. Bump whenever a response shape changes in a way old
// clients can't render. The backend stamps it on /api/orchestrator; pages
// refuse mismatched payloads with an "update backend" message instead of
// crashing on unexpected shapes.
export const API_VERSION = 3;

function apiBase(): string {
  const envBase = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  if (envBase && envBase.trim()) return envBase.replace(/\/$/, '');
  return '';
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = apiBase();
  // In production / Vercel we rely on same-origin /api routes.
  // Only fall back to localhost when VITE_API_URL is explicitly set (local dev).
  const urls: string[] = base ? [`${base}${path}`, `${DIRECT_FALLBACK}${path}`] : [path];
  let lastErr: unknown = null;
  for (const url of urls) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status} from ${url}`);
      return (await r.json()) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('API unreachable');
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const base = apiBase();
  const urls: string[] = base ? [`${base}${path}`, `${DIRECT_FALLBACK}${path}`] : [path];
  let lastErr: unknown = null;
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        throw new Error(`HTTP ${r.status} ${txt}`.trim());
      }
      return (await r.json()) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('API unreachable');
}

export const BACKEND_HINT = apiBase()
  ? 'Backend is not reachable. Check the VITE_API_URL configuration and that the API server is running.'
  : 'Backend is not reachable. If you are running locally, start it first: open a 2nd terminal → cd server → npm install → node index.js (or: npm start). Then keep it running and Retry. Health check: http://localhost:3000/api/health';
