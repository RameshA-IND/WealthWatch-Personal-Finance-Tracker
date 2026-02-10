
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { Budget } from './budget.entity';
import { Expense } from '../expenses/expense.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Budget, Expense])],
    controllers: [BudgetsController],
    providers: [BudgetsService],
})
export class BudgetsModule { }
