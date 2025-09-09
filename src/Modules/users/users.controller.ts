import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { CurrentUser } from './decorators/user.decorator';
import { JWTPayLoadType } from '../../utils/types/types';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { UserType } from '../../utils/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // GET /api/v1/users/currentUser
  @Get('currentUser')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public getCurrentUser(@CurrentUser() payload: JWTPayLoadType) {
    return this.userService.getCurrentUser(payload.id);
  }

  // GET /api/v1/users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public async getAllUsers(@Query() query: any) {
    return this.userService.getAll(query);
  }

  // GET /api/v1/users/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public getUserById(@Param('id') id: string) {
    return this.userService.getUserById(+id);
  }

  // PATCH /api/v1/users/:id
  // PATCH /api/v1/users/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('bearer')
  public updateUser(
    @Param('id') id: string,
    @CurrentUser() payload: JWTPayLoadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.updateUser(+id, payload, body);
  }

  // DELETE /api/v1/users/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @HttpCode(HttpStatus.OK) // 200
  @ApiSecurity('bearer')
  public deleteUser(@Param('id') id: string, @CurrentUser() payload: JWTPayLoadType) {
    return this.userService.deleteUser(+id, payload);
  }
}