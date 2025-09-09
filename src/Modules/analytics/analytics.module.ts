import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { VendorsModule } from '../vendor/vendors.module';
import { ProjectsModule } from '../projects/projects.module';
import { DocumentsModule } from '../documents/documents.module';
import { MatchesModule } from '../matches/matches.module';
import { Match } from '../matches/entities/matches.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { Country } from '../countries/entities/country.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match, Project, Country]),
        VendorsModule,
        ProjectsModule,
        DocumentsModule,
        MatchesModule,
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }