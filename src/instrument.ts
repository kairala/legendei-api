import * as Sentry from '@sentry/nestjs';
// Ensure to call this before importing any other modules!

if (process.env.SENTRY_DSN) {
  console.log('Sentry DSN found, initializing Sentry...');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
  });
} else {
  console.log('No Sentry DSN found, skipping Sentry initialization.');
}
