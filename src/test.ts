import { Controller, Get } from '@nestjs/common';

@Controller('sentry')
export class SentryController {
  constructor() {}

  @Get()
  getHello(): string {
    throw new Error('Sentry test error');
  }
}
