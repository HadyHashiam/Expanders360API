import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './entities/matches.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { VendorsModule } from '../vendor/vendors.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { MailsModule } from '../mails/mails.module';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { OwnerGuard } from '../users/guards/owner.guard';
import { ClientsModule } from '../users/clients/clients.module';

@Module({
  controllers: [MatchesController],
  providers: [
    MatchesService, 
    HandlerFactory,
    OwnerGuard,
  ],
  imports: [
    TypeOrmModule.forFeature([Match]),
    ProjectsModule, 
    VendorsModule, 
    SystemConfigModule,
    MailsModule,
    ClientsModule, 
  ],
  exports: [MatchesService],
})
export class MatchesModule {}