
export interface User {
    id: number;
    username: string;
}

export interface Category {
    id: number;
    name: string;
    type: 'Daily' | 'Big';
}

export interface Expense {
    id: number;
    amount: number;
    expenseDate: string;
    notes?: string;
    category: Category;
    categoryId: number;
}

export interface Budget {
    id: number;
    amount: number;
    period: 'monthly' | 'yearly';
    category: Category;
    categoryId: number;
}

export interface BudgetAlert {
    budgetId: number;
    category: Category;
    budgetAmount: number;
    spent: number;
    percentage: string;
    status: 'warning' | 'exceeded';
}

export interface DashboardStats {
    today: number;
    month: number;
    year: number;
    highestCategory: string;
    categoryBreakdown: { name: string; value: number }[];
}
