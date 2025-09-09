import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Country } from '../countries/entities/country.entity';
import { Service } from '../services/entities/service.entity';
import { ProjectsController } from './project.controller';
import { ProjectsService } from './project.service';
import { ClientsModule } from '../users/clients/clients.module';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { OwnerGuard } from '../users/guards/owner.guard';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService, 
    HandlerFactory,
    OwnerGuard,
  ],
  imports: [
    TypeOrmModule.forFeature([Project, Country, Service ]),
    ClientsModule,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}