
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';
import { Expense } from '../expenses/expense.entity';

@Injectable()
export class BudgetsService {
    constructor(
        @InjectRepository(Budget)
        private budgetsRepository: Repository<Budget>,
        @InjectRepository(Expense)
        private expensesRepository: Repository<Expense>,
    ) { }

    async create(createBudgetDto: any, userId: number): Promise<Budget> {
        const budget = this.budgetsRepository.create({
            ...createBudgetDto,
            userId,
        } as any);
        return this.budgetsRepository.save(budget as any);
    }

    async findAll(userId: number): Promise<Budget[]> {
        return this.budgetsRepository.find({
            where: { userId },
            relations: ['category']
        });
    }

    async update(id: number, updateBudgetDto: any): Promise<Budget | null> {
        await this.budgetsRepository.update(id, updateBudgetDto);
        return this.budgetsRepository.findOne({ where: { id } });
    }

    async remove(id: number): Promise<void> {
        await this.budgetsRepository.delete(id);
    }

    async checkBudgetAlerts(userId: number) {
        const budgets = await this.findAll(userId);
        const alerts: any[] = [];

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        for (const budget of budgets) {
            const expenses = await this.expensesRepository.find({
                where: { userId, categoryId: budget.categoryId },
            });

            let totalSpent = 0;

            if (budget.period === 'monthly') {
                totalSpent = expenses
                    .filter(exp => {
                        const expDate = new Date(exp.expenseDate);
                        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, exp) => sum + parseFloat(exp.amount as any), 0);
            } else if (budget.period === 'yearly') {
                totalSpent = expenses
                    .filter(exp => {
                        const expDate = new Date(exp.expenseDate);
                        return expDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, exp) => sum + parseFloat(exp.amount as any), 0);
            }

            const budgetAmount = parseFloat(budget.amount as any);
            const percentage = (totalSpent / budgetAmount) * 100;

            if (percentage >= 90) {
                alerts.push({
                    budgetId: budget.id,
                    category: budget.category,
                    budgetAmount,
                    spent: totalSpent,
                    percentage: percentage.toFixed(2),
                    status: percentage >= 100 ? 'exceeded' : 'warning'
                });
            }
        }

        return alerts;
    }
}
