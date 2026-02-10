
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

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            url: configService.get('DATABASE_URL'),
            entities: [User, Category, Expense, Budget],
            synchronize: true, // Auto-create tables
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          };
        }

        return {
          type: 'better-sqlite3',
          database: 'expense-manager.db',
          entities: [User, Category, Expense, Budget],
          synchronize: true,
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
