import {
  Controller,
  Get,
  Patch,
  Delete,
  HttpCode,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfile } from './dto/updateProfileDto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

interface RequestWithUser {
  user: {
    userId: string;
    email?: string;
  };
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get all profiles
  @Get()
  @HttpCode(200)
  async getProfile() {
    return await this.userService.getProfile();
  }

  // Get specific profile by display name
  @Get('me/:displayName')
  @HttpCode(200)
  async getProfileByName(@Param('displayName') displayName: string) {
    return await this.userService.getProfileByName(displayName);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfile,
  ) {
    return await this.userService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );
  }

  @Delete('me/:displayName')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async deleteProfile(@Param('displayName') displayName: string) {
    return await this.userService.deleteProfile(displayName);
  }
}
