
import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/expenses/dashboard');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!stats) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>WealthWatch Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Today's Expense</span>
                    <span className="stat-val">₹{stats.today.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">This Month</span>
                    <span className="stat-val">₹{stats.month.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">This Year</span>
                    <span className="stat-val">₹{stats.year.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Primary Category</span>
                    <span className="stat-val" style={{ fontSize: '1.5rem' }}>{stats.highestCategory || 'N/A'}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ height: '400px' }}>
                    <h3>Expense by Category</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.categoryBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {stats.categoryBreakdown.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                                    border: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`,
                                    borderRadius: '8px',
                                    color: theme === 'dark' ? '#fff' : '#000'
                                }}
                                itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                            />
                            <Legend wrapperStyle={{ color: theme === 'dark' ? '#fff' : '#666' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Placeholder for another chart or list */}
                <div className="card">
                    <h3>Quick Actions</h3>
                    <div style={{ marginTop: '20px' }}>
                        <p>Welcome to <strong>WealthWatch</strong> - your smart personal finance tracker.</p>
                        <p>Use the sidebar to manage your expenses, categories, and budgets.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
