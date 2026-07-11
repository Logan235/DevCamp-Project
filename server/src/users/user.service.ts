import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { UpdateProfile } from './dto/updateProfileDto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  // Get all users
  async getProfile() {
    return await this.userModel.find({}).lean();
  }

  // Find user by name
  async getProfileByName(displayName: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ displayName });
  }

  // Update profile (Update name)
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfile,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user id');
    }

    const updateData: Partial<UpdateProfile> = {};

    if (updateProfileDto.displayName !== undefined) {
      updateData.displayName = updateProfileDto.displayName.trim();
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  //Delete user
  async deleteProfile(displayName: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ displayName });
    if (!user) {
      throw new UnauthorizedException('User with this name not found');
    }
    await user.deleteOne();
    return { message: 'User deleted successfully' };
  }

  async getProfileById(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user id');
    }

    const user = await this.userModel
      .findById(userId)
      .select('-passHash -refreshToken')
      .lean();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}

export default UserService;
