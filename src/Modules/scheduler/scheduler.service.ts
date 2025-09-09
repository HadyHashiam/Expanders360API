import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProjectsService } from '../projects/project.service';
import { JWTPayLoadType } from '../../utils/types/types';
import { UserType } from '../../utils/enums';
import { MatchesService } from '../matches/matches.service';
import { LessThan, Repository } from 'typeorm';
import { Match } from '../matches/entities/matches.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../session/session.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly matchesService: MatchesService,
    private readonly projectsService: ProjectsService,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Fetches active projects for matches refresh
   * @returns Array of active projects
   */
  private async fetchActiveProjects(): Promise<any[]> {
    try {
      const projectsResponse = await this.projectsService.getAllProjects(
        { userType: UserType.ADMIN } as JWTPayLoadType,
        {},
      );
      return projectsResponse.data.filter((project) => project.status === 'active');
    } catch (error) {
      this.logger.error(`Failed to fetch active projects: ${error.message}`);
      throw error;
    }
  }

  /**
   * Processes matches rebuild for a single project
   * @param project - The project to process
   * @returns Result of the matches rebuild operation
   */
  private async processProjectMatches(project: any): Promise<any> {
    try {
      const result = await this.matchesService.rebuildMatches(project.id, {
        id: 1,
        userType: UserType.ADMIN,
        sessionId: 1,
      });
      this.logger.log(
        `Refreshed matches for project ID ${project.id}: ${result.data.length} matches returned, total: ${result.data.totalMatchesCount}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to refresh matches for project ID ${project.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Daily job to refresh matches for all active projects
   * Runs every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'refreshMatches' })
  async refreshMatchesJob() {
    this.logger.log('Starting daily matches refresh job');
    try {
      const activeProjects = await this.fetchActiveProjects();

      if (activeProjects.length === 0) {
        this.logger.log('No active projects found for matches refresh');
        return;
      }

      for (const project of activeProjects) {
        try {
          await this.processProjectMatches(project);
        } catch (error) {
          this.logger.error(`Failed to process project ${project.id}: ${error.message}`);
          // Continue with other projects even if one fails
        }
      }
    } catch (error) {
      this.logger.error(`Failed to run matches refresh job: ${error.message}`);
    }
  }

  /**
   * Daily job to flag expired SLAs
   * Runs every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, { name: 'flagExpiredSLAs' })
  async flagExpiredSLAsJob() {
    this.logger.log('Starting SLA expiration check job');
    try {
      const matches = await this.matchRepository.find({ relations: ['vendor'] });
      const now = new Date();

      for (const match of matches) {
        try {
          if (!match.notifiedAt || match.is_sla_expired) {
            continue;
          }

          const hoursSinceNotified = (now.getTime() - match.notifiedAt.getTime()) / (1000 * 60 * 60);
          const responseSlaHours = match.vendor.response_sla_hours;

          if (hoursSinceNotified > responseSlaHours) {
            match.is_sla_expired = true;
            await this.matchRepository.save(match);
            this.logger.log(`Flagged match ID ${match.id} (project ID ${match.projectId}, vendor ID ${match.vendorId}) as SLA expired`);
          }
        } catch (error) {
          this.logger.error(`Failed to check SLA for match ID ${match.id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to run SLA expiration job: ${error.message}`);
    }
  }

  /**
   * Cleanup job to remove expired sessions
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS, { name: 'cleanExpiredSessions' })
  async cleanExpiredSessionsJob() {
    this.logger.log('Starting expired sessions cleanup job');
    try {
      const now = new Date();
      const result = await this.sessionRepository.delete({ expiresAt: LessThan(now) });
      const deletedCount = result.affected ?? 0;
      this.logger.log(`Deleted ${deletedCount} expired sessions`);
    } catch (error) {
      this.logger.error(`Failed to clean sessions: ${error.message}`);
    }
  }
}









// EVERY_DAY_AT_1AM
// EVERY_10_SECONDS
// EVERY_DAY_AT_MIDNIGHT