
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './expense.entity';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expensesRepository: Repository<Expense>,
    ) { }

    async create(createExpenseDto: any, userId: number): Promise<Expense> {
        const expense = this.expensesRepository.create({
            ...createExpenseDto,
            userId,
        } as any);
        return this.expensesRepository.save(expense as any);
    }

    async findAll(userId: number, filters?: any): Promise<Expense[]> {
        const where: any = { userId };
        if (filters?.startDate && filters?.endDate) {
            where.expenseDate = Between(filters.startDate, filters.endDate);
        }
        return this.expensesRepository.find({
            where,
            relations: ['category'],
            order: { expenseDate: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Expense | null> {
        return this.expensesRepository.findOne({ where: { id }, relations: ['category'] });
    }

    async update(id: number, updateExpenseDto: any): Promise<Expense | null> {
        await this.expensesRepository.update(id, updateExpenseDto);
        return this.expensesRepository.findOne({ where: { id } });
    }

    async remove(id: number): Promise<void> {
        await this.expensesRepository.delete(id);
    }

    async getDashboardStats(userId: number) {
        const expenses = await this.expensesRepository.find({ where: { userId }, relations: ['category'] });

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const todayStr = today.toISOString().split('T')[0];

        let todayExpense = 0;
        let monthExpense = 0;
        let yearExpense = 0;
        const categoryMap = new Map<string, number>();

        expenses.forEach(exp => {
            const expDate = new Date(exp.expenseDate);
            const amount = parseFloat(exp.amount as any);

            if (exp.expenseDate === todayStr) {
                todayExpense += amount;
            }
            if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
                monthExpense += amount;
            }
            if (expDate.getFullYear() === currentYear) {
                yearExpense += amount;
            }

            const catName = exp.category ? exp.category.name : 'Uncategorized';
            categoryMap.set(catName, (categoryMap.get(catName) || 0) + amount);
        });

        let highestCategory = '';
        let highestAmount = 0;
        categoryMap.forEach((amount, cat) => {
            if (amount > highestAmount) {
                highestAmount = amount;
                highestCategory = cat;
            }
        });

        return {
            today: todayExpense,
            month: monthExpense,
            year: yearExpense,
            highestCategory,
            categoryBreakdown: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
        };
    }
}
