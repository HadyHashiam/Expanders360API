import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DocumentsService } from '../documents/documents.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../matches/entities/matches.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectStatus } from '../../utils/enums';


@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly documentsService: DocumentsService,
  ) {}

  async getTopVendors(): Promise<any[]> {
    try {

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const topVendors = await this.matchRepository
        .createQueryBuilder('match')
        .select('vendor.id', 'vendorId')
        .addSelect('vendor.name', 'vendorName')
        .addSelect('project.country', 'country')
        .addSelect('AVG(match.score)', 'avgScore')
        .innerJoin('match.vendor', 'vendor')
        .innerJoin('match.project', 'project')
        .where('match.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })   // last 30 days
        .groupBy('vendor.id, project.country')
        .orderBy('AVG(match.score)', 'DESC')
        .getRawMany();

      const vendorsByCountry = {};
      for (const row of topVendors) {
        if (!vendorsByCountry[row.country]) vendorsByCountry[row.country] = [];
        vendorsByCountry[row.country].push({
          vendorId: row.vendorId,
          vendorName: row.vendorName,
          avgScore: parseFloat(row.avgScore).toFixed(2),
        });
        vendorsByCountry[row.country] = vendorsByCountry[row.country]
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 3);
      }
      //  count_docs to expansion projects
        const expansionProjects = await this.projectRepository
        .createQueryBuilder('project')
        .where('project.status = :status', { status: ProjectStatus.EXPANSION })
        .getMany();

        const projectsByCountry = expansionProjects.reduce((acc, project) => {
        if (!acc[project.country]) acc[project.country] = [];
        acc[project.country].push(project.id);
        return acc;
      }, {} as { [country: string]: number[] });

      const documentsByCountry = await Promise.all(
        Object.entries(projectsByCountry).map(async ([country, projectIds]) => {
          const count = await this.documentsService.countDocumentsByProjectIds(projectIds);
          return { country, count };
        })
      );

      
      const documentsCountMap = documentsByCountry.reduce((acc, { country, count }) => {
        acc[country] = count;
        return acc;
      }, {} as { [country: string]: number });

      // Combine results
      const result = Object.keys(vendorsByCountry).map(country => ({
        country,
        topVendors: vendorsByCountry[country],
        expansionDocumentsCount: documentsCountMap[country] || 0,
      }));

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch top vendors: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch top vendors');
    }
  }
}