import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoadmapTemplate, UserRoadmap } from './roadmap.schemas';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectModel(RoadmapTemplate.name)
    private templateModel: Model<RoadmapTemplate>,
    @InjectModel(UserRoadmap.name) private userRoadmapModel: Model<UserRoadmap>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return new Types.ObjectId(value);
  }

  getRoadmaps(userId: string) {
    return this.userRoadmapModel
      .find({ userId: this.toObjectId(userId, 'userId') })
      .populate('templateId')
      .exec();
  }

  putRoadmaps(userId: string, updateData: any) {
    return this.userRoadmapModel
      .findOneAndUpdate(
        {
          userId: this.toObjectId(userId, 'userId'),
          status: 'active',
        },
        updateData,
        { new: true },
      )
      .exec();
  }
}
