import { Controller, Body, Param, Delete, Put, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetCurrentUser, GetCurrentUserId, Public } from 'src/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { get } from 'mongoose';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiBearerAuth()
  @Put('')
  editProfile(
    @GetCurrentUserId() sub: string,
    @Body() userData: UpdateUserDto,
  ) {
    return this.userService.editProfile(sub, userData);
  }

  @ApiBearerAuth()
  @Delete('')
  deleteProfile(@GetCurrentUserId() sub: string) {
    return this.userService.deleteProfile(sub);
  }

  @ApiBearerAuth()
  @Get('')
  currentUser(@GetCurrentUser() user: User) {
    return user;
  }





}
