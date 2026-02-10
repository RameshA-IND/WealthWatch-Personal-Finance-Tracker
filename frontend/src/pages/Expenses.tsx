
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Expense, Category } from '../types';
import { Trash2, Plus, Edit2, FileDown, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../context/ThemeContext';

const Expenses: React.FC = () => {
    const { theme } = useTheme();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [notes, setNotes] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
            // Don't auto-set category here to allow "Select Category" placeholder or specific logic
        } catch (error) { console.error(error); }
    };

    const handleAddClick = () => {
        setEditingId(null);
        setAmount('');
        if (categories.length > 0) setCategoryId(categories[0].id.toString());
        setNotes('');
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setShowModal(true);
    };

    const handleEditClick = (expense: Expense) => {
        setEditingId(expense.id);
        setAmount(expense.amount.toString());
        setCategoryId(expense.categoryId.toString());
        setNotes(expense.notes || '');
        setExpenseDate(expense.expenseDate);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                amount: parseFloat(amount),
                categoryId: parseInt(categoryId),
                notes,
                expenseDate,
            };

            if (editingId) {
                await api.put(`/expenses/${editingId}`, payload);
            } else {
                await api.post('/expenses', payload);
            }
            fetchExpenses();
            setShowModal(false);
            setAmount('');
            setNotes('');
            setEditingId(null);
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (error) { console.error(error); }
        }
    }

    const exportToExcel = () => {
        const excelData = expenses.map(exp => ({
            Date: exp.expenseDate,
            Category: exp.category?.name || 'Uncategorized',
            Amount: exp.amount,
            Notes: exp.notes || ''
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
        XLSX.writeFile(wb, `Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Expense List', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        autoTable(doc, {
            startY: 40,
            head: [['Date', 'Category', 'Amount', 'Notes']],
            body: expenses.map(exp => [
                exp.expenseDate,
                exp.category?.name || 'Uncategorized',
                `Rs.${exp.amount}`,
                exp.notes || ''
            ]),
        });

        doc.save(`Expenses_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Expenses</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn" style={{ background: '#40c057', color: 'white' }} onClick={exportToExcel}>
                        <FileSpreadsheet size={16} style={{ marginRight: '5px' }} /> Excel
                    </button>
                    <button className="btn" style={{ background: '#fa5252', color: 'white' }} onClick={exportToPDF}>
                        <FileDown size={16} style={{ marginRight: '5px' }} /> PDF
                    </button>
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        <Plus size={16} style={{ marginRight: '5px' }} /> Add Expense
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="data-table wide">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Notes</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((exp) => (
                                <tr key={exp.id}>
                                    <td>{exp.expenseDate}</td>
                                    <td>{exp.category?.name || 'Uncategorized'}</td>
                                    <td className="wrap">{exp.notes}</td>
                                    <td style={{ fontWeight: 'bold' }}>₹{exp.amount}</td>
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
                                            onClick={() => handleEditClick(exp)}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                            onClick={() => handleDelete(exp.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div className="input-group">
                                <label>Amount</label>
                                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Date</label>
                                <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Notes</label>
                                <input value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Save'}</button>
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

export default Expenses;
