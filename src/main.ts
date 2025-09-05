import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';
import * as cors from 'cors';
import { ConfigService } from '@nestjs/config';
import { getSecurityConfig } from './config/security.config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const securityConfig = getSecurityConfig(configService);

  // Enable trust proxy only in production (Railway)
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  if (isProduction) {
    app.getHttpAdapter().getInstance().set('trust proxy', true);
  }
  // Security middleware 
  app.use(helmet(securityConfig.helmet));

  // Rate limiting with configuration
  app.use(rateLimit.default(securityConfig.rateLimit));

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.use(cors(securityConfig.cors));


  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  // Get the API base URL from environment variables
  const apiUrl = configService.get<string>('API_BASE_URL') || 'http://localhost:3000';


  const swagger = new DocumentBuilder()
    .setTitle("Expanders360API")
    .setVersion("v1")
    .setDescription('Expanders360API: A NestJS-based API for intelligent project-vendor matching, analytics, and document management with PostgreSQL and MongoDB.')
    .addServer(configService.get<string>('API_BASE_URL') ||`http://localhost:${configService.get<string>('PORT')}`) 
    .addTag('Auth', 'Authentication management')
    .addTag('Users', 'Users  management')
    .addTag('Clients', 'Clients management')
    .addTag('Projects', 'Project creation and management')
    .addTag('Vendors', 'Vendor management')
    .addTag('Matches', 'Project-vendor matching')
    .addTag('Analytics', 'Analytics and reporting')
    .addTag('Documents', 'Document management')
    .addTag('System-Configs', 'System configuration')
    .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup("swagger", app, documentation)
  // Listen on Railway-provided port and host
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Application is running on port ${port}`);
  });
}
bootstrap();
