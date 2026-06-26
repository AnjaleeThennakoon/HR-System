import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

function AddEmployee() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [departments, setDepartments] = useState([]);
    
    const [formData, setFormData] = useState({
        emp_id: '',
        name: '',
        department: '',
        position: '',
        base_salary: '',
        join_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments/');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Failed to load departments');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const employeeData = {
                emp_id: formData.emp_id,
                name: formData.name,
                department: parseInt(formData.department),
                position: formData.position,
                base_salary: parseFloat(formData.base_salary),
                join_date: formData.join_date,
                is_active: formData.is_active
            };

            await api.post('/employees/', employeeData);
            
            setSuccess('✅ Employee added successfully!');
            setTimeout(() => {
                navigate('/employees');
            }, 2000);
        } catch (error) {
            console.error('Error adding employee:', error);
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 401) {
                    setError('Session expired. Please login again.');
                    setTimeout(() => navigate('/'), 2000);
                } else if (status === 400) {
                    let errorMessage = 'Validation Error:\n';
                    Object.keys(data).forEach(key => {
                        errorMessage += `${key}: ${data[key].join(', ')}\n`;
                    });
                    setError(errorMessage);
                } else {
                    setError(`Server Error (${status}): ${JSON.stringify(data)}`);
                }
            } else if (error.request) {
                setError('Cannot connect to server. Make sure backend is running.');
            } else {
                setError(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/employees');
    };

    const generateEmpId = () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        return `EMP${year}${month}${random}`;
    };

    return (
        <div style={styles.container}>
            <Navbar />
            
            <div style={styles.header}>
                <button onClick={handleBack} style={styles.backBtn}>
                    ← Back to Employees
                </button>
                <h1 style={styles.title}>Add New Employee</h1>
            </div>

            <div style={styles.card}>
                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGrid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Employee ID *</label>
                            <div style={styles.inputWithButton}>
                                <input
                                    type="text"
                                    name="emp_id"
                                    value={formData.emp_id}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="e.g., EMP001"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({...formData, emp_id: generateEmpId()})}
                                    style={styles.generateBtn}
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Department *</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            >
                                <option value="">-- Select Department --</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Position *</label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., HR Manager"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Base Salary * (LKR)</label>
                            <input
                                type="number"
                                name="base_salary"
                                value={formData.base_salary}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., 50000"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Join Date *</label>
                            <input
                                type="date"
                                name="join_date"
                                value={formData.join_date}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Status</label>
                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    style={styles.checkbox}
                                />
                                <label style={styles.checkboxLabel}>Active</label>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : ' Save Employee'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: '#f0f2f5',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
        maxWidth: '800px',
        margin: '0 auto 30px auto',
        padding: '20px 20px 0 20px',
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#667eea',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 0',
        fontWeight: '500',
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#333',
        marginTop: '10px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '30px',
        maxWidth: '800px',
        margin: '0 auto 40px auto',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#555',
    },
    input: {
        padding: '10px 14px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.3s ease',
        backgroundColor: 'white',
        width: '100%',
        boxSizing: 'border-box',
    },
    inputWithButton: {
        display: 'flex',
        gap: '8px',
    },
    generateBtn: {
        padding: '10px 16px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingTop: '8px',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '14px',
        color: '#555',
        cursor: 'pointer',
    },
    submitBtn: {
        padding: '14px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'transform 0.2s ease',
    },
    error: {
        backgroundColor: '#fee',
        color: '#d32f2f',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '15px',
        whiteSpace: 'pre-line',
    },
    success: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '15px',
    },
};

export default AddEmployee;