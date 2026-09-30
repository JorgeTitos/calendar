import react from '@vitejs/plugin-react';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Locks the production page down with a Content-Security-Policy: only our own
 * scripts, styles and images, and network calls only to our own origin plus the
 * optional booking endpoint. (Skipped in dev, where Vite injects inline code.)
 */
function contentSecurityPolicy(endpoint: string | undefined): Plugin {
  const connect = ["'self'"];
  if (endpoint) {
    try {
      connect.push(new URL(endpoint).origin);
    } catch {
      // An invalid endpoint is reported at runtime by `resolveEndpoint`.
    }
  }
  const policy = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // React and SVG set inline style attributes
    "img-src 'self' data:",
    `connect-src ${connect.join(' ')}`,
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' },
    ],
  };
}

// `base: './'` keeps asset URLs relative so the build works on GitHub Pages,
// Netlify, Vercel or any static host, regardless of sub-path.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    base: './',
    plugins: [react(), contentSecurityPolicy(env.VITE_BOOKING_ENDPOINT)],
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  };
});
