
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await api.post('/auth/register', { username, password });
                alert('Registration successful! Please login.');
                setIsRegister(false);
            } else {
                const res = await api.post('/auth/login', { username, password });
                login(res.data.access_token, { username });
                navigate('/');
            }
        } catch (err) {
            alert('Authentication failed');
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f3f5' }}>
            <div className="card" style={{ width: '400px' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{isRegister ? 'Register' : 'Login'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        {isRegister ? 'Register' : 'Login'}
                    </button>
                </form>
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <span
                        style={{ cursor: 'pointer', color: 'var(--accent-color)' }}
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
