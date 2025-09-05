import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsController } from './project.controller';
import { ProjectsService } from './project.service';
import { ClientsModule } from '../users/clients/clients.module';
import { HandlerFactory } from '../../utils/handlerfactory/handler-factory.postgres';
import { OwnerGuard } from '../users/guards/owner.guard';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService, 
    HandlerFactory,
    OwnerGuard,
  ],
  imports: [
    TypeOrmModule.forFeature([Project]),
    ClientsModule,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}