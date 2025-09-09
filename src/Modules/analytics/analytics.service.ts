
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ApiResponseUtil } from '../../utils/types/api-response.util';
import { DocumentsService } from '../documents/documents.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../matches/entities/matches.entity';
import { Project } from '../projects/entities/project.entity';
import { Country } from '../countries/entities/country.entity';
import { ProjectStatus } from '../../utils/enums';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly documentsService: DocumentsService,
  ) {}

  async getTopVendors(): Promise<ReturnType<typeof ApiResponseUtil.success<any[]>>> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const topVendors = await this.matchRepository
        .createQueryBuilder('match')
        .select('vendor.id', 'vendorId')
        .addSelect('vendor.name', 'vendorName')
        .addSelect('country.name', 'country')
        .addSelect('AVG(match.score)', 'avgScore')
        .innerJoin('match.vendor', 'vendor')
        .innerJoin('match.project', 'project')
        .innerJoin('project.country', 'country')
        .where('match.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
        .groupBy('vendor.id, country.name')
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

      const expansionProjects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.country', 'country')
        .where('project.status = :status', { status: ProjectStatus.EXPANSION })
        .getMany();

      const projectsByCountry = expansionProjects.reduce((acc, project) => {
        const countryName = project.country?.name || 'Unknown';
        if (!acc[countryName]) acc[countryName] = [];
        acc[countryName].push(project.id);
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

      const result = Object.keys(vendorsByCountry).map(country => ({
        country,
        topVendors: vendorsByCountry[country],
        expansionDocumentsCount: documentsCountMap[country] || 0,
      }));

      return ApiResponseUtil.success(result, 'Analytics Retrieved Successfully', result.length);
    } catch (error) {
      this.logger.error(`Failed to fetch top vendors: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch top vendors');
    }
  }

  async getTopVendorsByCountry(countryId?: number) {
    try {
      const query = this.matchRepository
        .createQueryBuilder('match')
        .select('vendor.id', 'vendorId')
        .addSelect('vendor.name', 'vendorName')
        .addSelect('vendor.email', 'vendorEmail')
        .addSelect('vendor.rating', 'vendorRating')
        .addSelect('vendor.response_sla_hours', 'responseSlaHours')
        .addSelect('country.id', 'countryId')
        .addSelect('country.name', 'countryName')
        .addSelect('COUNT(DISTINCT match.projectId)', 'projectCount')
        .addSelect('AVG(match.score)', 'avgScore')
        .innerJoin('match.vendor', 'vendor')
        .innerJoin('match.project', 'project')
        .innerJoin('project.country', 'country')
        .groupBy('vendor.id, vendor.name, vendor.email, vendor.rating, vendor.response_sla_hours, country.id, country.name')
        .orderBy('AVG(match.score)', 'DESC');

      if (countryId) {
        query.andWhere('project.countryId = :countryId', { countryId });
      }

      const vendors = await query.getRawMany();

      const result = vendors.map(row => ({
        vendorId: row.vendorId,
        vendorName: row.vendorName,
        vendorEmail: row.vendorEmail,
        vendorRating: row.vendorRating ? parseFloat(row.vendorRating).toFixed(1) : null,
        responseSlaHours: row.responseSlaHours,
        countryId: row.countryId,
        countryName: row.countryName,
        projectCount: parseInt(row.projectCount, 10),
        avgScore: row.avgScore ? parseFloat(row.avgScore).toFixed(2) : null,
      }));

      return ApiResponseUtil.success(
        result,
        'Top Vendors by Country Retrieved Successfully',
        result.length,
      );
    } catch (error) {
      this.logger.error(`Failed to fetch top vendors by country: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch top vendors by country');
    }
  }
}
