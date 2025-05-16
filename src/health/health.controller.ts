import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller({
  path: '/health',
})
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok' };
  }
}
