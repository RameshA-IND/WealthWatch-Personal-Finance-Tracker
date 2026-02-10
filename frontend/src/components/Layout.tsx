
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, Layers, DollarSign, FileBarChart, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px', padding: '0 10px' }}>
                    <img src="/logo.svg" alt="WealthWatch Logo" style={{ width: '40px', height: '40px' }} />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>WealthWatch</h2>
                </div>
                <nav style={{ flex: 1 }}>
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} color="#3b82f6" /> Dashboard
                    </NavLink>
                    <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Wallet size={20} color="#10b981" /> Expenses
                    </NavLink>
                    <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Layers size={20} color="#f59e0b" /> Categories
                    </NavLink>
                    <NavLink to="/budgets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <DollarSign size={20} color="#ef4444" /> Budgets
                    </NavLink>
                    <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileBarChart size={20} color="#8b5cf6" /> Reports
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={20} color="#0d9488" /> Settings
                    </NavLink>
                </nav>
                <div
                    className="nav-item"
                    style={{ cursor: 'pointer', marginBottom: '10px' }}
                    onClick={toggleTheme}
                >
                    {theme === 'light' ? (
                        <><Moon size={20} color="#495057" /> Dark Mode</>
                    ) : (
                        <><Sun size={20} color="#fcc419" /> Light Mode</>
                    )}
                </div>
                <div
                    className="nav-item"
                    style={{ cursor: 'pointer', color: 'var(--danger-color)' }}
                    onClick={handleLogout}
                >
                    <LogOut size={20} color="var(--danger-color)" /> Logout
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
