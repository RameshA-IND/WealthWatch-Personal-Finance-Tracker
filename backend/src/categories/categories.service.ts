
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: any, userId: number): Promise<Category> {
        const category = this.categoriesRepository.create({
            ...createCategoryDto,
            userId,
        } as any);
        return this.categoriesRepository.save(category as any);
    }

    async findAll(userId: number): Promise<Category[]> {
        return this.categoriesRepository.find({ where: { userId } });
    }

    async remove(id: number): Promise<void> {
        await this.categoriesRepository.delete(id);
    }
}
