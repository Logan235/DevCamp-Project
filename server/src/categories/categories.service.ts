import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './categories.schemas';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async findAll() {
    return await this.categoryModel.find().sort({ ordinal: 1 }).exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Định dạng ID không hợp lệ');
    }
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục yêu cầu');
    }
    return category;
  }

  async create(dto: any) {
    const slug = dto.slug || this.slugify(dto.name);

    const existing = await this.categoryModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException(`Danh mục với slug "${slug}" đã tồn tại.`);
    }

    const newCategory = new this.categoryModel({
      name: dto.name,
      slug: slug,
      description: dto.description || '',
      ordinal: dto.ordinal || 0,
    });

    return await newCategory.save();
  }

  async update(id: string, dto: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Định dạng ID không hợp lệ');
    }

    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục để cập nhật');
    }

    if (dto.name) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.ordinal !== undefined) category.ordinal = dto.ordinal;

    if (dto.slug || dto.name) {
      category.slug = dto.slug || this.slugify(dto.name);
      const duplicate = await this.categoryModel
        .findOne({ slug: category.slug, _id: { $ne: id } })
        .exec();
      if (duplicate) {
        throw new ConflictException(
          `Slug "${category.slug}" đã bị trùng với danh mục khác.`,
        );
      }
    }

    return await category.save();
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Định dạng ID không hợp lệ');
    }

    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy danh mục cần xóa');
    }

    return {
      success: true,
      message: `Đã xóa thành công danh mục: ${deleted.name}`,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-');
  }
}
