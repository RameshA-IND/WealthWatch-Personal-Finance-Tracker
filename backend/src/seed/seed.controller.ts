
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';
import { Budget } from '../budgets/budget.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('seed')
export class SeedController {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
        @InjectRepository(Expense)
        private expensesRepository: Repository<Expense>,
        @InjectRepository(Budget)
        private budgetsRepository: Repository<Budget>,
    ) { }

    @Post('demo-data')
    async seedDemoData(@Request() req) {
        const userId = req.user.userId;

        // Clear existing data for this user
        await this.expensesRepository.delete({ userId });
        await this.budgetsRepository.delete({ userId });
        await this.categoriesRepository.delete({ userId });

        // Create Categories
        const categories = [
            { name: 'Groceries', type: 'Daily' },
            { name: 'Transport', type: 'Daily' },
            { name: 'Dining Out', type: 'Daily' },
            { name: 'Entertainment', type: 'Daily' },
            { name: 'Utilities', type: 'Daily' },
            { name: 'Healthcare', type: 'Big' },
            { name: 'Electronics', type: 'Big' },
            { name: 'Clothing', type: 'Big' },
            { name: 'Travel', type: 'Big' },
            { name: 'Home Maintenance', type: 'Big' },
        ];

        const createdCategories = await Promise.all(
            categories.map(cat =>
                this.categoriesRepository.save(
                    this.categoriesRepository.create({ ...cat, userId } as any)
                )
            )
        ) as any[];

        const categoryMap: { [key: string]: number } = {
            'Groceries': createdCategories[0].id,
            'Transport': createdCategories[1].id,
            'Dining Out': createdCategories[2].id,
            'Entertainment': createdCategories[3].id,
            'Utilities': createdCategories[4].id,
            'Healthcare': createdCategories[5].id,
            'Electronics': createdCategories[6].id,
            'Clothing': createdCategories[7].id,
            'Travel': createdCategories[8].id,
            'Home Maintenance': createdCategories[9].id,
        };

        // Generate expenses for the last 6 months
        const expenses: any[] = [];
        const today = new Date();

        // Last 6 months of data
        for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
            const baseDate = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
            const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

            // Groceries (weekly, ~4 times per month)
            for (let week = 0; week < 4; week++) {
                expenses.push({
                    amount: Math.floor(Math.random() * 3000) + 2000, // ₹2000-5000
                    categoryId: categoryMap['Groceries'],
                    expenseDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), (week * 7) + 3).toISOString().split('T')[0],
                    notes: `Weekly grocery shopping - Week ${week + 1}`,
                    userId,
                });
            }

            // Transport (almost daily, ~20 times per month)
            for (let i = 0; i < 20; i++) {
                const day = Math.floor(Math.random() * daysInMonth) + 1;
                expenses.push({
                    amount: Math.floor(Math.random() * 200) + 50, // ₹50-250
                    categoryId: categoryMap['Transport'],
                    expenseDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), day).toISOString().split('T')[0],
                    notes: ['Uber to office', 'Metro card recharge', 'Auto fare', 'Fuel'][Math.floor(Math.random() * 4)],
                    userId,
                });
            }

            // Dining Out (2-3 times per month)
            for (let i = 0; i < 3; i++) {
                const day = Math.floor(Math.random() * daysInMonth) + 1;
                expenses.push({
                    amount: Math.floor(Math.random() * 1500) + 500, // ₹500-2000
                    categoryId: categoryMap['Dining Out'],
                    expenseDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), day).toISOString().split('T')[0],
                    notes: ['Dinner at restaurant', 'Weekend brunch', 'Coffee with friends', 'Team lunch'][Math.floor(Math.random() * 4)],
                    userId,
                });
            }

            // Entertainment (2-4 times per month)
            for (let i = 0; i < 3; i++) {
                const day = Math.floor(Math.random() * daysInMonth) + 1;
                expenses.push({
                    amount: Math.floor(Math.random() * 800) + 200, // ₹200-1000
                    categoryId: categoryMap['Entertainment'],
                    expenseDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), day).toISOString().split('T')[0],
                    notes: ['Movie tickets', 'Netflix subscription', 'Gaming subscription', 'Concert tickets'][Math.floor(Math.random() * 4)],
                    userId,
                });
            }

            // Utilities (once per month)
            expenses.push({
                amount: Math.floor(Math.random() * 2000) + 3000, // ₹3000-5000
                categoryId: categoryMap['Utilities'],
                expenseDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), 5).toISOString().split('T')[0],
                notes: 'Monthly utility bills (electricity, water, internet)',
                userId,
            });

            // Big expenses (1-2 per month randomly)
            if (Math.random() > 0.5) {
                const bigCategory = ['Healthcare', 'Electronics', 'Clothing', 'Travel', 'Home Maintenance'][Math.floor(Math.random() * 5)];
                const amounts: { [key: string]: number } = {
                    'Healthcare': Math.floor(Math.random() * 5000) + 2000,
                    'Electronics': Math.floor(Math.random() * 20000) + 5000,
                    'Clothing': Math.floor(Math.random() * 3000) + 1000,
                    'Travel': Math.floor(Math.random() * 15000) + 10000,
                    'Home Maintenance': Math.floor(Math.random() * 8000) + 2000,
                };
                const day = Math.floor(Math.random() * daysInMonth) + 1;
                expenses.push({
                    amount: amounts[bigCategory],
                    categoryId: categoryMap[bigCategory],
                    expenseDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), day).toISOString().split('T')[0],
                    notes: `${bigCategory} expense`,
                    userId,
                });
            }
        }

        // Add some expenses for current month to trigger budget alerts
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Heavy groceries spending this month (to trigger alert)
        for (let i = 0; i < 5; i++) {
            expenses.push({
                amount: 4500,
                categoryId: categoryMap['Groceries'],
                expenseDate: new Date(currentYear, currentMonth, (i * 5) + 2).toISOString().split('T')[0],
                notes: `Grocery shopping - ${new Date(currentYear, currentMonth, (i * 5) + 2).toLocaleDateString()}`,
                userId,
            });
        }

        // Create all expenses
        const createdExpenses = await Promise.all(
            expenses.map(exp =>
                this.expensesRepository.save(
                    this.expensesRepository.create(exp as any)
                )
            )
        );

        // Create Budgets
        const budgets = [
            {
                amount: 15000,
                period: 'monthly',
                categoryId: categoryMap['Groceries'],
                userId,
            },
            {
                amount: 5000,
                period: 'monthly',
                categoryId: categoryMap['Transport'],
                userId,
            },
            {
                amount: 3000,
                period: 'monthly',
                categoryId: categoryMap['Dining Out'],
                userId,
            },
            {
                amount: 2000,
                period: 'monthly',
                categoryId: categoryMap['Entertainment'],
                userId,
            },
            {
                amount: 50000,
                period: 'yearly',
                categoryId: categoryMap['Travel'],
                userId,
            },
            {
                amount: 30000,
                period: 'yearly',
                categoryId: categoryMap['Electronics'],
                userId,
            },
        ];

        const createdBudgets = await Promise.all(
            budgets.map(budget =>
                this.budgetsRepository.save(
                    this.budgetsRepository.create(budget as any)
                )
            )
        );

        return {
            message: 'Demo data created successfully!',
            summary: {
                categories: createdCategories.length,
                expenses: createdExpenses.length,
                budgets: createdBudgets.length,
                dateRange: `Last 6 months (${new Date(today.getFullYear(), today.getMonth() - 5, 1).toLocaleDateString()} - ${today.toLocaleDateString()})`,
            },
        };
    }
}
