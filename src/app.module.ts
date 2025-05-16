import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './modules/storage/storage.module';
import { IAModule } from './modules/ia/ia.module';
import env from './config/env';
import { HealthModule } from './health/health.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryController } from './test';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [env],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_DB_URL'),
      }),
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          pinoHttp: {
            level: configService.get('LOG_LEVEL') || 'info',
            transport:
              configService.get('NODE_ENV') === 'production'
                ? undefined
                : { target: 'pino-pretty' },
            redact: ['req.headers.authorization'],
          },
          exclude: [
            { method: RequestMethod.OPTIONS, path: '*' },
            { method: RequestMethod.ALL, path: '/health' },
          ],
        };
      },
    }),
    HealthModule,
    AuthModule,
    StorageModule,
    IAModule,
    StripeModule,
  ],
  controllers: [SentryController],
  providers: [],
})
export class AppModule {}
