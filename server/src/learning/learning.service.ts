import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../users/schema/user.schema';
import { UserRoadmap } from '../roadmap/roadmap.schemas';
import { Submission } from 'src/code-execution/schema/submission.schema';
import { TestSubmission } from '../test/test.schemas';

import { Milestone } from './schemas/milestone.schema';
import { MilestoneSubmission } from './schemas/milestone-submission.schema';
import { Report } from './schemas/report.schema';
import { SubmitMilestoneDto } from './dto/submit-milestone.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(UserRoadmap.name)
    private readonly userRoadmapModel: Model<UserRoadmap>,

    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,

    @InjectModel(TestSubmission.name)
    private readonly testSubmissionModel: Model<TestSubmission>,

    @InjectModel(Milestone.name)
    private readonly milestoneModel: Model<Milestone>,

    @InjectModel(MilestoneSubmission.name)
    private readonly milestoneSubmissionModel: Model<MilestoneSubmission>,

    @InjectModel(Report.name)
    private readonly reportModel: Model<Report>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return new Types.ObjectId(value);
  }

  async getProgressMe(userId: string) {
    const userObjectId = this.toObjectId(userId, 'userId');

    const activeRoadmap = await this.userRoadmapModel
      .findOne({ userId: userObjectId, status: 'active' })
      .lean();

    const completedRoadmaps = await this.userRoadmapModel.countDocuments({
      userId: userObjectId,
      status: 'completed',
    });

    const totalSubmissions = await this.submissionModel.countDocuments({
      userId: userObjectId,
    });

    const acceptedSubmissions = await this.submissionModel.countDocuments({
      userId: userObjectId,
      status: 'Accepted',
    });

    const completedNodes = activeRoadmap?.completedNodes || 0;
    const totalNodes = activeRoadmap?.totalNodes || 0;

    const percent =
      totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    return {
      activeRoadmap: activeRoadmap
        ? {
            id: activeRoadmap._id,
            title: activeRoadmap.title,
            status: activeRoadmap.status,
            completedNodes,
            totalNodes,
            percent,
          }
        : null,
      completedRoadmaps,
      submissions: {
        total: totalSubmissions,
        accepted: acceptedSubmissions,
      },
    };
  }

  async getStatsMe(userId: string) {
    const userObjectId = this.toObjectId(userId, 'userId');

    const user = await this.userModel
      .findById(userObjectId)
      .select(
        'displayName avatarUrl xpTotal streakCount currentLevel thinkingProfile',
      )
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalSubmissions = await this.submissionModel.countDocuments({
      userId: userObjectId,
    });

    const acceptedSubmissions = await this.submissionModel.countDocuments({
      userId: userObjectId,
      status: 'Accepted',
    });

    const testSubmissions = await this.testSubmissionModel.countDocuments({
      userId: userObjectId,
    });

    const betterUsers = await this.userModel.countDocuments({
      xpTotal: { $gt: user.xpTotal || 0 },
    });

    return {
      user,
      rank: betterUsers + 1,
      xpTotal: user.xpTotal || 0,
      streakCount: user.streakCount || 0,
      currentLevel: user.currentLevel || 'unknown',
      submissions: {
        total: totalSubmissions,
        accepted: acceptedSubmissions,
      },
      assessments: {
        total: testSubmissions,
      },
    };
  }

  async getRanking(limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const users = await this.userModel
      .find({})
      .select('displayName avatarUrl xpTotal streakCount currentLevel')
      .sort({ xpTotal: -1, streakCount: -1, updatedAt: 1 })
      .limit(safeLimit)
      .lean();

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      xpTotal: user.xpTotal || 0,
      streakCount: user.streakCount || 0,
      currentLevel: user.currentLevel || 'unknown',
    }));
  }

  async getMilestones(userId?: string) {
    const milestones = await this.milestoneModel
      .find({ isActive: true })
      .sort({ createdAt: 1 })
      .lean();

    if (!userId) {
      return milestones;
    }

    const userObjectId = this.toObjectId(userId, 'userId');

    const submissions = await this.milestoneSubmissionModel
      .find({ userId: userObjectId })
      .lean();

    const submissionMap = new Map(
      submissions.map((submission) => [
        String(submission.milestoneId),
        submission,
      ]),
    );

    return milestones.map((milestone) => ({
      ...milestone,
      userSubmission: submissionMap.get(String(milestone._id)) || null,
    }));
  }

  async submitMilestone(
    userId: string,
    milestoneId: string,
    dto: SubmitMilestoneDto,
  ) {
    const userObjectId = this.toObjectId(userId, 'userId');
    const milestoneObjectId = this.toObjectId(milestoneId, 'milestoneId');

    const milestone = await this.milestoneModel.findOne({
      _id: milestoneObjectId,
      isActive: true,
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    const existing = await this.milestoneSubmissionModel.findOne({
      userId: userObjectId,
      milestoneId: milestoneObjectId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      return existing;
    }

    return this.milestoneSubmissionModel.create({
      userId: userObjectId,
      milestoneId: milestoneObjectId,
      note: dto.note,
      evidenceUrl: dto.evidenceUrl,
      status: 'pending',
    });
  }

  async getReportsMe(userId: string) {
    const userObjectId = this.toObjectId(userId, 'userId');

    const reports = await this.reportModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return reports;
  }
}
