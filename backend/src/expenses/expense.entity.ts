
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'date' })
    expenseDate: string; // ISO Date String YYYY-MM-DD

    @Column({ nullable: true })
    notes: string;

    @ManyToOne(() => Category, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column()
    categoryId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
