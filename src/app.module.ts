import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './Modules/auth/auth.module';
import { UsersModule } from './Modules/users/users.module';
import { databaseConfig } from './config/database/database.config';
import { MailerModule } from './Modules/mailer/mailer.module';
import { MailsModule } from './Modules/mails/mails.module';
import { ClientsModule } from './Modules/users/clients/clients.module';
import { ProjectsModule } from './Modules/projects/projects.module';
import { VendorsModule } from './Modules/vendor/vendors.module';
import { MatchesModule } from './Modules/matches/matches.module';
import { SystemConfigModule } from './Modules/system-config/system-config.module';
import { DocumentsModule } from './Modules/documents/documents.module';
import { AnalyticsModule } from './Modules/analytics/analytics.module';
import { SchedulerModule } from './Modules/scheduler/scheduler.module';
import { CountriesModule } from './Modules/countries/countries.module';
import { ServicesModule } from './Modules/services/services.module';


@Module({
  imports: [
      NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env', // Fallback to .env if the specific file is not found
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => databaseConfig(config),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MailerModule,
    MailsModule,
    ClientsModule,
    ProjectsModule,
    VendorsModule,
    MatchesModule,
    SystemConfigModule,
    DocumentsModule,
    AnalyticsModule,
    SchedulerModule,
    CountriesModule,
    ServicesModule
  ],
  controllers: [],
  providers: [
    ConfigService,
        {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}