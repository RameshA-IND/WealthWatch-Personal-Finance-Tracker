
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetsModule } from './budgets/budgets.module';
import { SeedModule } from './seed/seed.module';
import { User } from './users/user.entity';
import { Category } from './categories/category.entity';
import { Expense } from './expenses/expense.entity';
import { Budget } from './budgets/budget.entity';

import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DB_TYPE') || 'better-sqlite3';
        return {
          type: dbType as any,
          url: configService.get('DATABASE_URL'), // Used for PostgreSQL
          database: dbType === 'postgres' ? undefined : 'expense-manager.db',
          entities: [User, Category, Expense, Budget],
          synchronize: true, // Auto-create tables (keep enabled for now)
          ssl: dbType === 'postgres' ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ExpensesModule,
    BudgetsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
