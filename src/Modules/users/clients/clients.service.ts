import { Injectable, InternalServerErrorException, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { HandlerFactory } from '../../../utils/handlerFactory/handler-factory.postgres';
import { UserType, Resource_Name, Models_Name } from '../../../utils/enums';

@Injectable()
export class ClientsService {
  private factory: HandlerFactory<Client>;
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {
    this.factory = new HandlerFactory<Client>(this.clientRepository);
  }

  public async getClientById(id: number) {
    try {
      const client = await this.factory.getOne(id);
      return client;
    } catch (error) {
      this.logger.error(`Failed to fetch client ID ${id}: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch client');
    }
  }

  public async getClientByUserId(userId: number) {
    try {
      const client = await this.clientRepository.findOne({ where: { userId }, relations: ['user'] });
      if (!client) {
        this.logger.warn(`Client for user ID ${userId} not found`);
        throw new NotFoundException('Client not found for this user');
      }
      return client;
    } catch (error) {
      this.logger.error(`Failed to fetch client for user ID ${userId}: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch client');
    }
  }

  public async updateClientByUserId(userId: number, updateClientDto: { company_name?: string }) {
    try {
      const client = await this.clientRepository.findOne({ where: { userId } });
      if (!client) {
        this.logger.warn(`Client for user ID ${userId} not found`);
        throw new NotFoundException('Client not found for this user');
      }
      if (updateClientDto.company_name) {
        client.company_name = updateClientDto.company_name;
      }
      const updatedClient = await this.clientRepository.save(client);
      return updatedClient;
    } catch (error) {
      this.logger.error(`Failed to update client for user ID ${userId}: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async getAllClients(query: any): Promise<{ status: string; results: number; pagination: any; data: Client[] }> {
    return this.factory.getAll(query, Resource_Name.CLIENTS, Models_Name.CLIENT);
  }

  public async updateClient(id: number, updateClientDto: any, payload: any): Promise<Client> {
    if (payload.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admins can update clients');
    }
    const client = await this.factory.getOne(id);
    Object.assign(client, updateClientDto);
    return this.factory.updateOne(id, client);
  }

  public async deleteClient(id: number, payload: any): Promise<{ message: string }> {
    if (payload.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admins can delete clients');
    }
    return this.factory.deleteOne(id);
  }
}