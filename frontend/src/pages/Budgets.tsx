
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Budget, Category, BudgetAlert } from '../types';
import { Trash2, Plus, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Budgets: React.FC = () => {
    const { theme } = useTheme();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
        fetchAlerts();
    }, []);

    const fetchBudgets = async () => {
        try {
            const res = await api.get('/budgets');
            setBudgets(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/budgets/alerts');
            setAlerts(res.data);
        } catch (error) { console.error(error); }
    };

    const handleAddClick = () => {
        setEditingId(null);
        setAmount('');
        if (categories.length > 0) setCategoryId(categories[0].id.toString());
        setPeriod('monthly');
        setShowModal(true);
    };

    const handleEditClick = (budget: Budget) => {
        setEditingId(budget.id);
        setAmount(budget.amount.toString());
        setCategoryId(budget.categoryId.toString());
        setPeriod(budget.period);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                amount: parseFloat(amount),
                categoryId: parseInt(categoryId),
                period,
            };

            if (editingId) {
                await api.put(`/budgets/${editingId}`, payload);
            } else {
                await api.post('/budgets', payload);
            }
            fetchBudgets();
            fetchAlerts();
            setShowModal(false);
            setAmount('');
            setEditingId(null);
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Delete this budget?')) {
            try {
                await api.delete(`/budgets/${id}`);
                fetchBudgets();
                fetchAlerts();
            } catch (error) { console.error(error); }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Budget Management</h1>
                <button className="btn btn-primary" onClick={handleAddClick}>
                    <Plus size={16} style={{ marginRight: '5px' }} /> Set Budget
                </button>
            </div>

            {/* Budget Alerts */}
            {alerts.length > 0 && (
                <div className="card" style={{
                    marginBottom: '20px',
                    background: theme === 'dark' ? '#3e2c00' : '#fff3cd',
                    borderLeft: '4px solid #ff8c00'
                }}>
                    <h3 style={{ marginBottom: '15px', color: theme === 'dark' ? '#ffec99' : '#856404' }}>
                        <AlertTriangle size={20} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        Budget Alerts
                    </h3>
                    {alerts.map((alert) => (
                        <div key={alert.budgetId} style={{
                            padding: '10px',
                            marginBottom: '10px',
                            background: alert.status === 'exceeded'
                                ? (theme === 'dark' ? '#4c1d24' : '#f8d7da')
                                : (theme === 'dark' ? '#5a3e00' : '#ffec99'),
                            borderRadius: '8px',
                            color: theme === 'dark' ? '#fff' : 'inherit'
                        }}>
                            <strong>{alert.category.name}</strong> - {alert.percentage}% used
                            <div style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#ced4da' : '#666' }}>
                                ₹{alert.spent.toFixed(2)} of ₹{alert.budgetAmount.toFixed(2)}
                            </div>
                            {alert.status === 'exceeded' && (
                                <div style={{ color: theme === 'dark' ? '#ff8787' : '#721c24', fontWeight: 'bold', marginTop: '5px' }}>
                                    ⚠️ Budget Exceeded!
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Budgets Table */}
            <div className="card">
                <div className="table-container">
                    <table className="data-table wide">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Period</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map((budget) => {
                                const alert = alerts.find(a => a.budgetId === budget.id);
                                return (
                                    <tr key={budget.id}>
                                        <td>{budget.category?.name || 'Unknown'}</td>
                                        <td style={{ fontWeight: 'bold' }}>₹{budget.amount}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: budget.period === 'monthly'
                                                    ? (theme === 'dark' ? '#1b4332' : '#d3f9d8')
                                                    : (theme === 'dark' ? '#1864ab' : '#d0ebff'),
                                                color: budget.period === 'monthly'
                                                    ? (theme === 'dark' ? '#b7e4c7' : '#2b8a3e')
                                                    : (theme === 'dark' ? '#d0ebff' : '#1971c2'),
                                                fontSize: '0.85rem'
                                            }}>
                                                {budget.period}
                                            </span>
                                        </td>
                                        <td>
                                            {alert ? (
                                                <span style={{
                                                    color: alert.status === 'exceeded'
                                                        ? (theme === 'dark' ? '#ff8787' : '#c92a2a')
                                                        : (theme === 'dark' ? '#ffd43b' : '#e67700'),
                                                    fontWeight: 'bold'
                                                }}>
                                                    {alert.percentage}% used
                                                </span>
                                            ) : (
                                                <span style={{ color: theme === 'dark' ? '#69db7c' : '#40c057' }}>
                                                    <CheckCircle size={16} style={{ verticalAlign: 'middle' }} /> On track
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn"
                                                style={{
                                                    padding: '5px 10px',
                                                    fontSize: '0.8rem',
                                                    marginRight: '5px',
                                                    background: theme === 'dark' ? '#1e3a5f' : '#e7f5ff',
                                                    color: theme === 'dark' ? '#3b82f6' : '#1c7ed6'
                                                }}
                                                onClick={() => handleEditClick(budget)}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                onClick={() => handleDelete(budget.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingId ? 'Edit Budget' : 'Set New Budget'}</h3>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div className="input-group">
                                <label>Category</label>
                                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Budget Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Period</label>
                                <select value={period} onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')} required>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingId ? 'Update' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        backgroundColor: theme === 'dark' ? '#2d3139' : '#e9ecef',
                                        color: theme === 'dark' ? '#fff' : 'inherit'
                                    }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
