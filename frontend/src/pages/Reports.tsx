
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Expense, Category } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileDown, FileSpreadsheet, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../context/ThemeContext';

const Reports: React.FC = () => {
    const { theme } = useTheme();
    const [data, setData] = useState<{ name: string, amount: number }[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        fetchCategories();
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [selectedCategory, startDate, endDate]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchData = async () => {
        try {
            let url = '/expenses';
            const params: string[] = [];

            if (startDate && endDate) {
                params.push(`startDate=${startDate}`, `endDate=${endDate}`);
            }

            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }

            const res = await api.get(url);
            let expensesData: Expense[] = res.data;

            // Filter by category on frontend
            if (selectedCategory !== 'all') {
                expensesData = expensesData.filter(exp =>
                    exp.categoryId === parseInt(selectedCategory)
                );
            }

            setExpenses(expensesData);

            const monthMap = new Map<string, number>();
            expensesData.forEach(exp => {
                const date = new Date(exp.expenseDate);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthMap.set(key, (monthMap.get(key) || 0) + parseFloat(exp.amount as any));
            });

            const chartData = Array.from(monthMap.entries())
                .map(([name, amount]) => ({ name, amount }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setData(chartData);
        } catch (error) {
            console.error(error);
        }
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setStartDate('');
        setEndDate('');
    };

    const exportToExcel = () => {
        const excelData = expenses.map(exp => ({
            Date: exp.expenseDate,
            Category: exp.category?.name || 'Uncategorized',
            Amount: exp.amount,
            Notes: exp.notes || ''
        }));

        const summaryData = data.map(d => ({
            Month: d.name,
            'Total Amount': d.amount
        }));

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws1, 'All Expenses');
        const ws2 = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Summary');

        XLSX.writeFile(wb, `Expense_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Expense Report', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        doc.setFontSize(14);
        doc.text('Monthly Summary', 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [['Month', 'Total Amount']],
            body: data.map(d => [d.name, `Rs.${d.amount.toFixed(2)}`]),
        });

        const finalY = (doc as any).lastAutoTable.finalY || 50;
        doc.setFontSize(14);
        doc.text('Detailed Expenses', 14, finalY + 15);

        autoTable(doc, {
            startY: finalY + 20,
            head: [['Date', 'Category', 'Amount', 'Notes']],
            body: expenses.map(exp => [
                exp.expenseDate,
                exp.category?.name || 'Uncategorized',
                `Rs.${exp.amount}`,
                exp.notes || ''
            ]),
            styles: { fontSize: 8 },
        });

        doc.save(`Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Reports</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={exportToExcel}>
                        <FileSpreadsheet size={16} style={{ marginRight: '5px' }} /> Export Excel
                    </button>
                    <button className="btn btn-primary" onClick={exportToPDF}>
                        <FileDown size={16} style={{ marginRight: '5px' }} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>
                    <Filter size={20} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    Filters
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div className="input-group">
                        <label>Category</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>&nbsp;</label>
                        <button
                            className="btn"
                            style={{
                                background: theme === 'dark' ? '#2d3139' : '#e9ecef',
                                color: theme === 'dark' ? '#fff' : 'inherit',
                                width: '100%'
                            }}
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ height: '400px', marginTop: '20px' }}>
                <h3>Monthly Expenses {selectedCategory !== 'all' && `- ${categories.find(c => c.id === parseInt(selectedCategory))?.name}`}</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#ddd'} vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#666' }} axisLine={{ stroke: theme === 'dark' ? '#444' : '#ddd' }} />
                        <YAxis tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#666' }} axisLine={{ stroke: theme === 'dark' ? '#444' : '#ddd' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#16181d' : '#fff',
                                border: `1px solid ${theme === 'dark' ? '#3f444e' : '#eee'}`,
                                borderRadius: '8px',
                                color: theme === 'dark' ? '#fff' : '#000'
                            }}
                            itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                        />
                        <Legend wrapperStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#666', paddingTop: '10px' }} />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <h3>Recent Expenses ({expenses.length} total)</h3>
                <div className="table-container">
                    <table className="data-table wide">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.slice(0, 10).map((exp) => (
                                <tr key={exp.id}>
                                    <td>{exp.expenseDate}</td>
                                    <td>{exp.category?.name || 'Uncategorized'}</td>
                                    <td style={{ fontWeight: 'bold' }}>₹{exp.amount}</td>
                                    <td className="wrap">{exp.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
