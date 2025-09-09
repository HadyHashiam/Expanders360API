import { Injectable, InternalServerErrorException, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayLoadType } from '../../utils/types/types';
import { UserType } from '../../utils/enums';
import { ProjectsService } from '../projects/project.service';
import { VendorsService } from '../vendor/vendor.service';
import { Match } from './entities/matches.entity';
import { SystemConfigService } from '../system-config/system-config.service';
import { MailsService } from '../mails/mails.service';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import {Project_FOR_MATCH} from '../../utils/interfaces/interface';
import {Vendor_FOR_MATCH} from '../../utils/interfaces/interface';
import { Resource_Name, Models_Name } from '../../utils/enums';
import { ApiResponseUtil } from '../../utils/types/api-response.util';
import { PaginationMeta } from '../../utils/types/api-response.types';



@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);
  private factory: HandlerFactory<Match>;

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly projectsService: ProjectsService,
    private readonly vendorsService: VendorsService,
    private readonly systemConfigService: SystemConfigService,
    private readonly mailsService: MailsService,
  ) {
    this.factory = new HandlerFactory<Match>(this.matchRepository);
  }

  /**
   * Calculates SLA weight based on response_time and expiration_status
   * @param slaHours - The SLA response time in hours
   * @param isSlaExpired - Whether the SLA has expired
   * @returns SLA weight
   */
  private async calculateSLAWeight(slaHours: number, isSlaExpired: boolean): Promise<number> {
    if (isSlaExpired || !slaHours || slaHours <= 0) return 0;
    try {
      const slaWeightBase = await this.systemConfigService.getConfigValue('sla_weight_base', 20);
      const weight = slaWeightBase / (slaHours + 1);
      return Math.min(Math.max(parseFloat(weight.toFixed(2)), 0), 2);
    } catch (error) {
      this.logger.error(`Failed to calculate SLA weight: ${error.message}`);
      return 0;
    }
  }

  /**
   * Retrieves configuration values with fallback to defaults
   * @param key - The configuration key
   * @param defaultValue - The default value if config is not found
   * @returns The configuration value
   */
  private async getConfigValue(key: string, defaultValue: number): Promise<number> {
    try {
      return await this.systemConfigService.getConfigValue(key, defaultValue);
    } catch (error) {
      this.logger.error(`Failed to fetch config value for key ${key}: ${error.message}`);
      return defaultValue;
    }
  }

  /**
   * Fetches a project with relations for match rebuilding
   * @param projectId - The project ID
   * @param payload - JWT payload containing user information
   * @returns The project with client and user relations
   */
  private async fetchProject(projectId: number, payload: JWTPayLoadType): Promise<Project_FOR_MATCH> {
    try {
      const project = payload.userType === UserType.ADMIN
        ? await this.projectsService.getProjectByIdWithRelationsInternal(projectId)
        : await this.projectsService.getProjectByIdWithRelations(projectId, payload);
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
      // this.logger.debug(`Fetched project ${projectId}: ${JSON.stringify(project)}`);
      return project;
    } catch (error) {
      this.logger.error(`Failed to fetch project ${projectId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculates matches for a project based on vendor criteria
   * @param project - The project to calculate matches for
   * @param vendors - List of available vendors
   * @param servicesOverlapMultiplier - Multiplier for services overlap scoring
   * @returns Array of calculated matches with count of new matches
   */
  private async calculateMatches(project: Project_FOR_MATCH, vendors: Vendor_FOR_MATCH[], servicesOverlapMultiplier: number): Promise<{ matches: Match[]; newMatchesCount: number }> {
    const matches: Match[] = [];
    let newMatchesCount = 0;

    for (const vendor of vendors) {
      try {
        if (!vendor.countries_supported.includes(project.countryId)) {
          // this.logger.debug(`Vendor ${vendor.id} skipped: does not support country ${project.countryId}`);
          continue;
        }

        const servicesOverlap = project.services_needed.filter((service) =>
          vendor.services_offered.includes(service),
        ).length;

        if (servicesOverlap === 0) {
          // this.logger.debug(`Vendor ${vendor.id} skipped: no services overlap`);
          continue;
        }
      // Score Formla
        const servicesScore = Number(servicesOverlap) * servicesOverlapMultiplier;
        const rating = Number(vendor.rating);
        const match = await this.matchRepository.findOne({
          where: { projectId: project.id, vendorId: vendor.id },
          relations: ['vendor'],
        });

        const slaWeight = await this.calculateSLAWeight(vendor.response_sla_hours, match ? match.is_sla_expired : false);
        const score = parseFloat((servicesScore + rating + slaWeight).toFixed(2));

        if (match) {
          match.score = score;
          match.is_sla_expired = match.is_sla_expired || false;
          matches.push(await this.matchRepository.save(match));
        } else {
          const newMatch = this.matchRepository.create({
            projectId: project.id,
            vendorId: vendor.id,
            countryId: project.countryId,
            score,
            notifiedAt: new Date(),
            is_sla_expired: false,
          });
          matches.push(await this.matchRepository.save(newMatch));
          newMatchesCount++;
        }
      } catch (error) {
        this.logger.error(`Failed to calculate match for vendor ID ${vendor.id}: ${error.message}`);
        continue;
      }
    }

    return { matches, newMatchesCount };
  }

  /**
   * Saves or updates a single match in the database
   * @param match - The match to save
   * @returns The saved match
   */
  private async saveMatch(match: Match): Promise<Match> {
    try {
      return await this.matchRepository.save(match);
    } catch (error) {
      this.logger.error(`Failed to save match: ${error.message}`);
      throw new InternalServerErrorException(`Failed to save match: ${error.message}`);
    }
  }

  /**
   * Sends match notification email to the client
   * @param project - The project with client and user relations
   * @param newMatchesCount - Number of new matches created
   * @param totalMatchesCount - Total number of matches
   * @throws BadRequestException if email is missing
   */

private async sendNotification(project: any, newMatchesCount: number, totalMatchesCount: number): Promise<void> {
    if (newMatchesCount > 0 && project.client?.user?.email) {
      try {
        await this.mailsService.sendMatchNotification(
          project.client.user.email, 
          project.id, 
          newMatchesCount, 
          totalMatchesCount
        );
        this.logger.log(`Sent match notification to ${project.client.user.email} for project ID ${project.id} with ${newMatchesCount} new matches (total: ${totalMatchesCount})`);
      } catch (error) {
        this.logger.error(`Failed to send match notification for project ID ${project.id}: ${error.message}`);
      }
    } else if (newMatchesCount === 0) {
      this.logger.log(`No new matches for project ID ${project.id}, skipping notification`);
    } else {
      this.logger.warn(`No valid client email found for project ID ${project.id}`);
    }
  }


  /**
   * Rebuilds matches for a specific project by calculating vendor compatibility
   * @param projectId - The project ID to rebuild matches for
   * @param payload - JWT payload containing user information
   * @returns Object containing matches information and counts
   */
  public async rebuildMatches(projectId: number, payload: JWTPayLoadType): Promise<ReturnType<typeof ApiResponseUtil.success<{ length: number; totalMatchesCount: number; matches: any[] }>>> {
    this.logger.log(`Rebuilding matches for project ID: ${projectId}, user: ${payload.id}`);

    try {
      // Fetch project with relations
      const project = await this.fetchProject(projectId, payload);

      // Get all vendors
      const vendorsResponse = await this.vendorsService.getAllVendors({});
      const vendors = vendorsResponse.data;

      // Get configuration values
      const servicesOverlapMultiplier = await this.getConfigValue('services_overlap_multiplier', 2);
      const maxMatchesPerProject = await this.getConfigValue('max_matches_per_project', 10000);

      const totalMatchesBefore = await this.matchRepository.count({ where: { projectId } });

      // Calculate matches
      const { matches, newMatchesCount } = await this.calculateMatches(project, vendors, servicesOverlapMultiplier);

      // Sort and limit matches
      const sortedMatches = matches.sort((a, b) => b.score - a.score).slice(0, maxMatchesPerProject)
      .map(match => ({
        id: match.id,
        projectId: match.projectId,
        vendorId: match.vendorId,
        countryId: match.countryId,
        vendorName: match.vendor?.name,
        score: match.score,
        createdAt: match.createdAt,
        notifiedAt: match.notifiedAt,
        is_sla_expired: match.is_sla_expired,
      }));
      const totalMatchesCount = totalMatchesBefore + newMatchesCount;

      // Send notification
      await this.sendNotification(project, newMatchesCount, totalMatchesCount);

      const body = { length: sortedMatches.length, totalMatchesCount, matches: sortedMatches };
      const message = sortedMatches.length > 0 ? 'Matches rebuilt successfully' : 'No matches found for this project';
      return ApiResponseUtil.success(body, message, sortedMatches.length);
    } catch (error) {
      this.logger.error(`Failed to rebuild matches for project ID ${projectId}: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to rebuild matches: ${error.message}`);
    }
  }

  /**
   * Retrieves all matches with optional filtering and pagination
   * @param query - Query parameters for filtering, searching, sorting, and pagination
   * @returns Paginated list of matches
   */
  async getAllMatches(query: any): Promise<{ status?: 'success'; success: true; message: string; data: Match[]; count?: number; timestamp: string; pagination: PaginationMeta }> {
    const result = await this.factory.getAll(query, Resource_Name.MATCHES, Models_Name.MATCH);
    return ApiResponseUtil.successPaginated<Match>(result.data, result.pagination, 'Matches Retrieved Successfully');
  }

  async getAllMatchesForProject(projectId: number, query: any): Promise<{ status?: 'success'; success: true; message: string; data: Match[]; count?: number; timestamp: string; pagination: PaginationMeta }> {
    // Enforce projectId filter and forward to factory
    const merged = { ...query, projectId };
    const result = await this.factory.getAll(merged, Resource_Name.MATCHES, Models_Name.MATCH);
    return ApiResponseUtil.successPaginated<Match>(result.data, result.pagination, 'Matches Retrieved Successfully');
  }

  /**
   * Retrieves all matches for a specific project
   * @param projectId - The project ID
   * @param payload - JWT payload containing user information
   * @returns Array of matches for the project
   */
  async getProjectMatches(projectId: number, payload: JWTPayLoadType): Promise<ReturnType<typeof ApiResponseUtil.success<Match[]>>> {
    try {
      const project = payload.userType === UserType.ADMIN
        ? await this.projectsService.getProjectByIdWithRelationsInternal(projectId)
        : await this.projectsService.getProjectByIdWithRelations(projectId, payload);
      const matches = await this.matchRepository.find({
        where: { projectId },
        order: { score: 'DESC' },
        relations: ['vendor', 'project'],
      });
      return ApiResponseUtil.success(matches, 'Project Matches Retrieved Successfully');
    } catch (error) {
      this.logger.error(`Failed to fetch matches for project ID ${projectId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves a match by ID
   * @param id - The match ID
   * @returns The match
   */
  public async getMatchById(id: number): Promise<ReturnType<typeof ApiResponseUtil.success<Match>>> {
    const match = await this.factory.getOne(id);
    return ApiResponseUtil.success(match, 'Match Retrieved Successfully');
  }

  /**
   * Deletes a match by ID
   * @param id - The match ID
   * @param payload - JWT payload containing user information
   * @returns Success message
   */
  public async deleteMatch(id: number, payload: JWTPayLoadType): Promise<{ message: string; data: any; status: string }> {
    if (payload.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admins can delete matches');
    }
    return this.factory.deleteOne(id);
  }
}
