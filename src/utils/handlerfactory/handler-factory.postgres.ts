import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RESOURCE_CONSTRAINTS } from '../constant';
import { ApiFeatures } from '../apifeature/api-features.postgres';


export class HandlerFactory<Entity extends ObjectLiteral> {
  constructor(private readonly repository: Repository<Entity>) {}

  async create(data: any): Promise<Entity | Entity[]> {
    try {
      if (Array.isArray(data)) {
        const entities = this.repository.create(data);
        return await this.repository.save(entities);
      } else {
        const entity = this.repository.create(data as Entity);
        // const
        return await this.repository.save(entity);
      }
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create: ${error.message}`);
    }
  }

  async getOne(id: number): Promise<Entity> {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) throw new NotFoundException(`No document for this id ${id}`);
      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to fetch id ${id}: ${error.message}`);
    }
  }

  async updateOne(id: number, data: any): Promise<Entity> {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) throw new NotFoundException(`No document for this id ${id}`);
      Object.assign(entity, data);
      const updated =  await this.repository.save(entity);
      return updated
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to update id ${id}: ${error.message}`);
    }
  }

  async deleteOne(id: number): Promise<{ message: string , data: Entity }> {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) throw new NotFoundException(`No document for this id ${id}`);
      await this.repository.remove(entity);
      // return { message: 'Deleted successfully' };
      return { message: 'Deleted successfully' , data:entity };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to delete id ${id}: ${error.message}`);
    }
  }


  async getAll(
  query: any,
  resourceName: keyof typeof RESOURCE_CONSTRAINTS,
  alias: string = 'entity',
): Promise<any> {
  try {
    const qb = this.repository.createQueryBuilder(alias);
    const apiFeatures = new ApiFeatures(qb, query, resourceName, alias)
      .filter()
      .search()
      .sort();

    const totalCount = await qb.getCount();
    const { queryBuilder, pagination } = apiFeatures.paginate(totalCount);
    const data = await queryBuilder.getMany();
    return { results: data.length, pagination, data };
  } catch (error) {
    throw new InternalServerErrorException(`Failed to fetch ${resourceName}: ${error.message}`);
  }
}
}