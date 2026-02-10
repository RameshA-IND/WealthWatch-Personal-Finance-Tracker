
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';

@Entity()
export class Budget {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 10 }) // 'monthly' or 'yearly'
    period: string;

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
