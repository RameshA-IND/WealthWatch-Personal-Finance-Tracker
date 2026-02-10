
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
        const dbUrl = configService.get('DATABASE_URL');

        console.log(`[Database Connection] Type detected: ${dbType}`);

        if (dbType === 'postgres') {
          console.log(`[Database Connection] Attempting to connect to PostgreSQL...`);
          if (!dbUrl) {
            console.error('[Database Error] DB_TYPE is postgres but DATABASE_URL is missing!');
          } else {
            try {
              const urlParts = new URL(dbUrl);
              console.log(`[Database Connection] Host: ${urlParts.hostname}`);
              console.log(`[Database Connection] Port detected: ${urlParts.port}`);
            } catch (e) {
              console.log('[Database Connection] Using raw DATABASE_URL (could not parse)');
            }
          }

          return {
            type: 'postgres',
            url: dbUrl,
            entities: [User, Category, Expense, Budget],
            synchronize: true,
            ssl: true, // Simplified SSL for maximum compatibility
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          };
        }

        console.log(`[Database Connection] Falling back to local SQLite`);
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
