import * as Sentry from '@sentry/nextjs'

// GlitchTip on the server (project dealer-auto-prestige). Off when GLITCHTIP_DSN is not set.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    const { prepareEvent } = await import('@/utilities/monitoring')
    const dsn = process.env.GLITCHTIP_DSN
    Sentry.init({
      dsn,
      enabled: Boolean(dsn),
      environment: 'production',
      // Every error, no sampling; performance tracing off
      sampleRate: 1,
      tracesSampleRate: 0,
      // Errors and warnings the code only logs (catch blocks, fallbacks) are reported too.
      // Not console.log: on the DMS that flooded GlitchTip (1.5 million events, 18/10/2026).
      integrations: [Sentry.captureConsoleIntegration({ levels: ['warn', 'error'] })],
      normalizeDepth: 6,
      beforeSend: prepareEvent,
    })
  }
}

// Errors thrown while rendering pages and running API routes
export const onRequestError = Sentry.captureRequestError
