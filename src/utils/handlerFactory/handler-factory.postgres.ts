import { SelectQueryBuilder, ObjectLiteral, Repository, In } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RESOURCE_CONSTRAINTS } from '../constant';
import { ApiFeatures } from '../apiFeature/api-features.postgres';
import { ApiResponseUtil } from '../types/api-response.util';

export class HandlerFactory<Entity extends ObjectLiteral> {
  constructor(private readonly repository: Repository<Entity>) {}

  async create(data: any): Promise<Entity | Entity[]> {
    try {
      if (Array.isArray(data)) {
        const entities = this.repository.create(data);
        return await this.repository.save(entities);
      } else {
        const entity = this.repository.create(data as Entity);
        return await this.repository.save(entity);
      }
    } catch (error) {
      throw ApiResponseUtil.error(`Failed to create: ${error.message}`, 'CREATION_FAILED');
    }
  }

  async getOne(id: number): Promise<Entity> {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) throw new NotFoundException(`No ${this.getEntityName()} for this id ${id}`);
      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw ApiResponseUtil.error(`Failed to fetch id ${id}: ${error.message}`, 'RETRIEVAL_FAILED');
    }
  }

  async updateOne(id: number, data: any): Promise<Entity> {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) throw new NotFoundException(`No ${this.getEntityName()} for this id ${id}`);
      Object.assign(entity, data);
      const updated = await this.repository.save(entity);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw ApiResponseUtil.error(`Failed to update id ${id}: ${error.message}`, 'UPDATE_FAILED');
    }
  }

  async deleteOne(id: number): Promise<{ message: string; data: Entity; status: string }> {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) throw new NotFoundException(`No ${this.getEntityName()} for this id ${id}`);
      await this.repository.remove(entity);
      return ApiResponseUtil.deleted(this.getEntityName(), id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw ApiResponseUtil.error(`Failed to delete id ${id}: ${error.message}`, 'DELETION_FAILED');
    }
  }

  async getAll(
    query: any,
    resourceName: keyof typeof RESOURCE_CONSTRAINTS,
    alias: string = 'entity',
  ): Promise<any> {
    try {
      const qb = this.repository.createQueryBuilder(alias);

      // Conditionally join known relations if they exist on the entity metadata
      const relationNames = Array.isArray(this.repository?.metadata?.relations)
        ? this.repository.metadata.relations.map(r => r.propertyName)
        : [];
      if (relationNames.includes('country')) {
        qb.leftJoinAndSelect(`${alias}.country`, 'country');
      }
      if (relationNames.includes('client')) {
        qb.leftJoinAndSelect(`${alias}.client`, 'client');
      }

      const apiFeatures = new ApiFeatures(qb, query, resourceName, alias)
        .filter()
        .search()
        .sort();

      const totalCount = await qb.getCount();
      const { queryBuilder, pagination } = apiFeatures.paginate(totalCount);
      const data = await queryBuilder.getMany();
      return ApiResponseUtil.successPaginated(data, pagination, `Data retrieved successfully`);
    } catch (error) {
      throw ApiResponseUtil.error(`Failed to fetch ${resourceName}: ${error.message}`, 'RETRIEVAL_FAILED');
    }
  }

  private getEntityName(): string {
    const target = this.repository.target as any;
    return (target?.name ?? target).toLowerCase();
  }
}