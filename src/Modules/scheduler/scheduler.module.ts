import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { MatchesModule } from '../matches/matches.module';
import { VendorsModule } from '../vendor/vendors.module';
import { ProjectsModule } from '../projects/projects.module';
import { Match } from '../matches/entities/matches.entity';
import { Session } from '../session/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [MatchesModule, VendorsModule, ProjectsModule, 
    TypeOrmModule.forFeature([Match, Session])
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}