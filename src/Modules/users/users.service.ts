import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JWTPayLoadType } from '../../utils/types';
import { UserType, Resource_Name, Models_Name } from '../../utils/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { HandlerFactory } from '../../utils/handlerfactory/handler-factory.postgres';


@Injectable()
export class UsersService {
    private factory: HandlerFactory<User>;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  public async getUserById(id: number): Promise<User> {
      return  await this.factory.getOne(id);
    //  const user = await this.factory.getOne(id);
    //   if (!user) throw new NotFoundException('User not found');
    // return user;
  }

  public async getAll(query: any): Promise<{ status: string; results: number; pagination: any; data: User[] }> {
    return this.factory.getAll(query, Resource_Name.USERS, Models_Name.USER);
  }

  public async updateUser(id: number, payload: JWTPayLoadType, updateUserDto: UpdateUserDto) {
    const user = await this.factory.getOne(id);
    if (payload.id !== id && payload.userType !== UserType.ADMIN) {
      throw new ForbiddenException('You are not allowed to update this user');
    }
    user.username = updateUserDto.username ?? user.username;
    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
    }
    return this.factory.updateOne(id, user);
  }

  public async deleteUser(id: number, payload: JWTPayLoadType): Promise<{ message: string }> {
    const user = await this.factory.getOne(id);
    if (user.id === payload.id || payload.userType === UserType.ADMIN) {
      return this.factory.deleteOne(id);
    }
    throw new ForbiddenException('You are not allowed to delete this user');
  }
}