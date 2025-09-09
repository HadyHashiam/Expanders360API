import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { JWTPayLoadType } from '../../utils/types/types';
import { UserType, Resource_Name, Models_Name } from '../../utils/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { HandlerFactory } from '../../utils/handlerFactory/handler-factory.postgres';
import { ClientsService } from './clients/clients.service';

@Injectable()
export class UsersService {
  private factory: HandlerFactory<User>;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly clientsService: ClientsService,
  ) {
    this.factory = new HandlerFactory<User>(this.userRepository);
  }

  // Hashing password
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async getCurrentUser(id: number): Promise<User> {
    return this.factory.getOne(id);
  }

  public async getUserById(id: number): Promise<{ status: string; data: User; message: string }> {
    const result = await this.factory.getOne(id);
    return { status: 'success', data: result, message: 'User Retrieved Successfully' };
  }

  public async getAll(query: any): Promise<{ status: string; message: string; results: number; pagination: any; data: User[] }> {
    const result = await this.factory.getAll(query, Resource_Name.USERS, Models_Name.USER);
    return { status: 'success', message: 'Users Retrieved Successfully', results: result.data.length, pagination: result.pagination, data: result.data };
  }

  public async updateUser(id: number, payload: JWTPayLoadType, updateUserDto: UpdateUserDto) {
    const user = await this.factory.getOne(id);
    if (payload.id !== id && payload.userType !== UserType.ADMIN) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    // Update User fields
    user.username = updateUserDto.username ?? user.username;
    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.factory.updateOne(id, user);

    // If user is a Client, update the corresponding Client entity
    if (user.userType === UserType.CLIENT && updateUserDto.username) {
      await this.clientsService.updateClientByUserId(id, { company_name: updateUserDto.username });
    }

    return updatedUser;
  }

  public async deleteUser(id: number, payload: JWTPayLoadType): Promise<{ message: string }> {
    const user = await this.factory.getOne(id);
    if (user.id === payload.id || payload.userType === UserType.ADMIN) {
      return this.factory.deleteOne(id);
    }
    throw new ForbiddenException('You are not allowed to delete this user');
  }
}