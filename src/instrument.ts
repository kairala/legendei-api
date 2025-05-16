import * as Sentry from '@sentry/nestjs';
// Ensure to call this before importing any other modules!

if (process.env.SENTRY_DSN) {
  console.log('Sentry DSN found, initializing Sentry...');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nestjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
} else {
  console.log('No Sentry DSN found, skipping Sentry initialization.');
}
