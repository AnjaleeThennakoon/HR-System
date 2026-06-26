import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setAuthToken } from '../api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(username, password);
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setAuthToken(access);

            navigate('/employees');
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logo}>HR</div>
                    <h1 style={styles.title}>Welcome Back</h1>
                    <p style={styles.subtitle}>Sign in to continue</p>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <span style={styles.footerText}>HR Management System</span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        margin: 0,
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '400px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    logo: {
        width: '48px',
        height: '48px',
        backgroundColor: '#1a73e8',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        color: '#ffffff',
        fontSize: '20px',
        fontWeight: '600',
    },
    title: {
        fontSize: '24px',
        fontWeight: '500',
        color: '#202124',
        marginBottom: '4px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#5f6368',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '12px 16px',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        backgroundColor: '#ffffff',
        width: '100%',
        boxSizing: 'border-box',
    },
    error: {
        backgroundColor: '#fce8e6',
        color: '#d93025',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        textAlign: 'center',
    },
    button: {
        padding: '12px',
        backgroundColor: '#1a73e8',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        marginTop: '4px',
        width: '100%',
    },
    footer: {
        textAlign: 'center',
        marginTop: '24px',
        borderTop: '1px solid #e8eaed',
        paddingTop: '20px',
    },
    footerText: {
        fontSize: '12px',
        color: '#9aa0a6',
    },
};

export default Login;