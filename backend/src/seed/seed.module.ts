
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';
import { Budget } from '../budgets/budget.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Expense, Budget])],
    controllers: [SeedController],
})
export class SeedModule { }
