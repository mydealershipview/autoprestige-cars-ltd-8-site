import * as Sentry from '@sentry/nextjs'
import { prepareEvent } from '@/utilities/monitoring'

// GlitchTip in the visitor's browser (project dealer-auto-prestige). Off when NEXT_PUBLIC_GLITCHTIP_DSN is not set.
const dsn = process.env.NEXT_PUBLIC_GLITCHTIP_DSN
Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: 'production',
  sampleRate: 1,
  tracesSampleRate: 0,
  integrations: [Sentry.captureConsoleIntegration({ levels: ['warn', 'error'] })],
  normalizeDepth: 6,
  // Browser side: crawler and other-script errors are not sent (src/utilities/monitoring.ts)
  beforeSend: (event) => prepareEvent(event, { browser: true }),
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
