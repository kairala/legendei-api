import { Controller, Get } from '@nestjs/common';

@Controller({
  path: '/health',
})
export class HealthController {
  @Get()
  create() {
    return { status: 'ok' };
  }
}
