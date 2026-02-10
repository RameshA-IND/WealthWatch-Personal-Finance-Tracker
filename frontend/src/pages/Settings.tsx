
import React, { useState } from 'react';
import api from '../services/api';
import { Download, Upload, Database, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
    const { theme } = useTheme();
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleBackup = async () => {
        try {
            // Fetch all data
            const [expenses, categories, budgets] = await Promise.all([
                api.get('/expenses'),
                api.get('/categories'),
                api.get('/budgets')
            ]);

            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {
                    expenses: expenses.data,
                    categories: categories.data,
                    budgets: budgets.data
                }
            };

            // Create download
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `expense-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Backup created successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to create backup' });
        }
    };

    const loadDemoData = async () => {
        if (!window.confirm('This will replace all your current data with realistic demo data (10 categories, 150+ expenses, 6 budgets for past 6 months). Continue?')) {
            return;
        }

        setImporting(true);
        setMessage(null);

        try {
            const response = await api.post('/seed/demo-data');
            setMessage({
                type: 'success',
                text: `Demo data loaded! ${response.data.summary.categories} categories, ${response.data.summary.expenses} expenses, ${response.data.summary.budgets} budgets created.`
            });

            // Refresh page after 2 seconds to show new data
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to load demo data' });
        } finally {
            setImporting(false);
        }
    };

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setMessage(null);

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            if (!backupData.version || !backupData.data) {
                throw new Error('Invalid backup file format');
            }

            // Restore categories first
            const categoryMap = new Map<number, number>(); // old ID -> new ID
            for (const category of backupData.data.categories || []) {
                const oldId = category.id;
                delete category.id;
                const response = await api.post('/categories', category);
                if (response.data && response.data.id) {
                    categoryMap.set(oldId, response.data.id);
                }
            }

            // Restore budgets
            for (const budget of backupData.data.budgets || []) {
                delete budget.id;
                if (categoryMap.has(budget.categoryId)) {
                    budget.categoryId = categoryMap.get(budget.categoryId);
                }
                await api.post('/budgets', budget);
            }

            // Restore expenses
            for (const expense of backupData.data.expenses || []) {
                delete expense.id;
                if (categoryMap.has(expense.categoryId)) {
                    expense.categoryId = categoryMap.get(expense.categoryId);
                }
                await api.post('/expenses', expense);
            }

            setMessage({ type: 'success', text: 'Data restored successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to restore backup. Please check the file format.' });
        } finally {
            setImporting(false);
            // Reset file input
            event.target.value = '';
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Settings & Backup</h1>

            {/* Demo Data Section */}
            <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <h3 style={{ marginBottom: '15px', color: 'white' }}>
                    <Sparkles size={20} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    Load Demo Data
                </h3>

                <p style={{ marginBottom: '15px', opacity: 0.9 }}>
                    Want to see the app in action? Load realistic demo data with 6 months of expenses!
                </p>

                <button
                    className="btn"
                    onClick={loadDemoData}
                    disabled={importing}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'white',
                        color: '#667eea',
                        fontWeight: 'bold',
                        cursor: importing ? 'wait' : 'pointer',
                        opacity: importing ? 0.6 : 1
                    }}
                >
                    <Sparkles size={18} /> {importing ? 'Loading...' : 'Load Demo Data'}
                </button>

                <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <strong>📦 Includes:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.6' }}>
                        <li>10 categories (5 Daily + 5 Big)</li>
                        <li>150+ expenses across 6 months</li>
                        <li>6 budgets (with some triggering alerts!)</li>
                        <li>Realistic spending patterns</li>
                    </ul>
                    <p style={{ marginTop: '8px', fontWeight: 'bold' }}>⚠️ This will REPLACE your current data!</p>
                </div>
            </div>

            {/* Backup & Restore Section */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>
                    <Database size={20} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    Data Backup & Restore
                </h3>

                {message && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        background: message.type === 'success'
                            ? (theme === 'dark' ? '#1b4332' : '#d3f9d8')
                            : (theme === 'dark' ? '#4c1d24' : '#ffe3e3'),
                        color: message.type === 'success'
                            ? (theme === 'dark' ? '#b7e4c7' : '#2b8a3e')
                            : (theme === 'dark' ? '#ff8787' : '#c92a2a'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={18} />
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleBackup}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download size={18} /> Backup Data
                    </button>

                    <label
                        className="btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#40c057',
                            color: 'white',
                            cursor: importing ? 'wait' : 'pointer',
                            opacity: importing ? 0.6 : 1
                        }}
                    >
                        <Upload size={18} /> {importing ? 'Restoring...' : 'Restore from Backup'}
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestore}
                            disabled={importing}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: theme === 'dark' ? '#121212' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#333' : 'transparent'}`
                }}>
                    <h4 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>⚠️ Important Notes:</h4>
                    <ul style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#ced4da' : '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                        <li><strong>Backup</strong>: Creates a JSON file with all your expenses, categories, and budgets</li>
                        <li><strong>Restore</strong>: Imports data from a backup file (this will ADD to existing data, not replace)</li>
                        <li>Keep your backup files safe - they contain all your financial data</li>
                        <li>Regular backups are recommended before major changes</li>
                    </ul>
                </div>
            </div>

            {/* Application Info */}
            <div className="card">
                <h3 style={{ marginBottom: '15px' }}>Application Information</h3>
                <div style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#ced4da' : '#666' }}>
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Database:</strong> Better-SQLite3 (Local)</p>
                    <p><strong>Features:</strong></p>
                    <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                        <li>✅ Category-wise filtering in reports</li>
                        <li>✅ Date range selection for custom reports</li>
                        <li>✅ Budget tracking and alerts</li>
                        <li>✅ Export to Excel & PDF</li>
                        <li>✅ Data backup and restore</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Settings;
