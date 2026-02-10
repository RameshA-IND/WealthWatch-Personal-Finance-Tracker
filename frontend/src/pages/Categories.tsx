
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Category } from '../types';
import { Trash2, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Categories: React.FC = () => {
    const { theme } = useTheme();
    const [categories, setCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('Daily');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name, type });
            fetchCategories();
            setShowModal(false);
            setName('');
            setType('Daily');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Categories</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} style={{ marginRight: '5px' }} /> Add Category
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style={{ width: '150px' }}>Type</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td className="wrap">{cat.name}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: cat.type === 'Big'
                                                ? (theme === 'dark' ? '#5f3e0e' : '#ffec99')
                                                : (theme === 'dark' ? '#1b4332' : '#d3f9d8'),
                                            color: cat.type === 'Big'
                                                ? (theme === 'dark' ? '#ffd43b' : '#e67700')
                                                : (theme === 'dark' ? '#b7e4c7' : '#2b8a3e'),
                                            fontSize: '0.85rem'
                                        }}>
                                            {cat.type}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                            onClick={() => handleDelete(cat.id)}
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
                        <h3>Add New Category</h3>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div className="input-group">
                                <label>Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="Daily">Daily</option>
                                    <option value="Big">Big</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
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

export default Categories;
