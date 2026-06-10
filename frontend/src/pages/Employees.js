import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    emp_id: '', name: '', position: '', base_salary: '', join_date: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('employees/');
      setEmployees(res.data);
    } catch (e) {
      navigate('/');
    }
  };

  const handleAdd = async () => {
    try {
      await api.post('employees/', form);
      setShowForm(false);
      setForm({ emp_id: '', name: '', position: '', base_salary: '', join_date: '' });
      fetchEmployees();
    } catch (e) {
      alert('Error adding employee!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      await api.delete(`employees/${id}/`);
      fetchEmployees();
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>👥 Employees</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '8px 18px', background: '#1677ff', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
          }}>+ Add Employee</button>
          <button onClick={logout} style={{
            padding: '8px 18px', background: '#ff4d4f', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
          }}>Logout</button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 10, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Add New Employee</h3>
          {['emp_id', 'name', 'position', 'base_salary', 'join_date'].map(field => (
            <input
              key={field}
              placeholder={field.replace('_', ' ').toUpperCase()}
              value={form[field]}
              type={field === 'join_date' ? 'date' : field === 'base_salary' ? 'number' : 'text'}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              style={{ display: 'block', width: '100%', marginBottom: 10,
                padding: 9, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} style={{
              padding: '8px 20px', background: '#52c41a', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer'
            }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{
              padding: '8px 20px', background: '#aaa', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px #0001' }}>
        <thead>
          <tr style={{ background: '#1677ff', color: '#fff' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Position</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Base Salary</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Join Date</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>No employees yet. Add one!</td></tr>
          ) : (
            employees.map((emp, i) => (
              <tr key={emp.id} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                <td style={{ padding: 12 }}>{emp.emp_id}</td>
                <td style={{ padding: 12 }}>{emp.name}</td>
                <td style={{ padding: 12 }}>{emp.position}</td>
                <td style={{ padding: 12 }}>Rs. {emp.base_salary}</td>
                <td style={{ padding: 12 }}>{emp.join_date}</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => handleDelete(emp.id)} style={{
                    padding: '4px 12px', background: '#ff4d4f', color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13
                  }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}