import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const emailConfig = {
          transport: {
            host: config.get<string>('EMAIL_HOST'),
            port: config.get<number>('EMAIL_PORT'),
            secure: config.get<string>('EMAIL_SECURE') === 'true',
            auth: {
              user: config.get<string>('EMAIL_USER'),
              pass: config.get<string>('EMAIL_PASSWORD'),
            },
            tls: {
              rejectUnauthorized: true,
              ciphers: 'TLSv1.2',
            },
             // connection settings
            connectionTimeout: 120000,
            greetingTimeout: 60000,
            socketTimeout: 120000,
             // Pool settings
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 14, // 14 emails per second
          },
          defaults: {
            from: `"No Reply" <${config.get<string>('EMAIL_USER')}>`,
          },
        };
        return emailConfig;
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}