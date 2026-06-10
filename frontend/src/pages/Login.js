import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/token/',
        { username, password }
      );
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      navigate('/employees');
    } catch (e) {
      setError('Wrong username or password!');
    }
  };

  return (
    <div style={{
      maxWidth: 400, margin: '80px auto', padding: 32,
      boxShadow: '0 2px 16px #0001', borderRadius: 12,
      background: '#fff'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
        HR System Login
      </h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12,
          padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 15 }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12,
          padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 15 }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin} style={{
        width: '100%', padding: 12, background: '#01dfc5',
        color: '#fff', border: 'none', borderRadius: 6,
        fontSize: 16, cursor: 'pointer'
      }}>
        Login
      </button>
    </div>
  );
}