import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

function Attendance() {
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [checking, setChecking] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [todayStatus, setTodayStatus] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [summary, setSummary] = useState({
        total_days: 0,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total_hours: 0,
        total_late_minutes: 0,
        total_overtime: 0,
        attendance_percentage: 0
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees/');
            setEmployees(response.data);
            if (response.data.length > 0) {
                setSelectedEmployee(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Failed to load employees');
        }
    };

    useEffect(() => {
        if (selectedEmployee) {
            fetchAttendanceData();
        }
    }, [selectedEmployee, selectedMonth, selectedYear]);

    const fetchAttendanceData = async () => {
        setLoading(true);
        try {
            await fetchTodayStatus();
            await fetchAttendanceRecords();
            await fetchSummary();
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayStatus = async () => {
        if (!selectedEmployee) return;
        try {
            const response = await api.get(`/attendance/today/?employee_id=${selectedEmployee}`);
            setTodayStatus(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                setTodayStatus(null);
            }
        }
    };

    const fetchAttendanceRecords = async () => {
        if (!selectedEmployee) return;
        try {
            const response = await api.get(`/attendance/?employee_id=${selectedEmployee}&month=${selectedMonth}&year=${selectedYear}`);
            setAttendance(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchSummary = async () => {
        if (!selectedEmployee) return;
        try {
            const response = await api.get(`/attendance/summary/?employee_id=${selectedEmployee}&month=${selectedMonth}&year=${selectedYear}`);
            setSummary(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCheckIn = async () => {
        if (!selectedEmployee) {
            setError('Please select an employee');
            return;
        }
        setChecking(true);
        setError('');
        setMessage('');
        try {
            await api.post('/attendance/check-in/', {
                employee_id: parseInt(selectedEmployee)
            });
            setMessage('Check-in successful!');
            fetchAttendanceData();
        } catch (error) {
            setError(error.response?.data?.error || '❌ Check-in failed');
        } finally {
            setChecking(false);
        }
    };

    const handleCheckOut = async () => {
        if (!selectedEmployee) {
            setError('Please select an employee');
            return;
        }
        setChecking(true);
        setError('');
        setMessage('');
        try {
            await api.post('/attendance/check-out/', {
                employee_id: parseInt(selectedEmployee)
            });
            setMessage('Check-out successful!');
            fetchAttendanceData();
        } catch (error) {
            setError(error.response?.data?.error || 'Check-out failed');
        } finally {
            setChecking(false);
        }
    };

    const handleFilter = () => {
        fetchAttendanceRecords();
        fetchSummary();
    };

    const getStatusDisplay = (status) => {
        const map = { 'P': 'Present', 'A': 'Absent', 'L': 'Late', 'LV': 'Leave', 'HD': 'Half Day' };
        return map[status] || status;
    };

    const getStatusColor = (status) => {
        const map = { 'P': '#4CAF50', 'A': '#f44336', 'L': '#FF9800', 'LV': '#2196F3', 'HD': '#9C27B0' };
        return map[status] || '#666';
    };

    const getDepartmentColor = (dept) => {
        const colors = {
            'IT': '#4CAF50',
            'HR': '#2196F3',
            'Finance': '#FF9800',
            'Marketing': '#9C27B0',
            'Sales': '#F44336',
            'Operations': '#00BCD4'
        };
        return colors[dept] || '#666';
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = [2023, 2024, 2025, 2026, 2027];

    const filteredEmployees = employees.filter(emp => {
        const matchDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
        const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchDepartment && matchSearch;
    });

    const departments = ['All', ...new Set(employees.map(emp => emp.department))];

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Loading attendance data...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Navbar />
            
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Attendance Management</h1>
                    <p style={styles.subtitle}>Track employee attendance</p>
                </div>
                <div style={styles.headerButtons}>
                    <button onClick={() => navigate('/employees')} style={styles.backBtn}>
                        ← Back
                    </button>
                </div>
            </div>

            <div style={styles.selectorContainer}>
                <div style={styles.selectorGroup}>
                    <label style={styles.label}>Employee:</label>
                    <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} style={styles.select}>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.emp_id} - {emp.name} ({emp.department})
                            </option>
                        ))}
                    </select>
                </div>
                <div style={styles.actionButtons}>
                    <button onClick={handleCheckIn} style={styles.checkInBtn} disabled={checking || todayStatus?.time_in}>
                        {checking ? '⏳' : ''} Check In
                    </button>
                    <button onClick={handleCheckOut} style={styles.checkOutBtn} disabled={checking || !todayStatus?.time_in || todayStatus?.time_out}>
                        {checking ? '⏳' : ''} Check Out
                    </button>
                </div>
            </div>

            {todayStatus && (
                <div style={styles.todayCard}>
                    <div style={styles.todayInfo}>
                        <span>Today: <strong style={{color: getStatusColor(todayStatus.status)}}>
                            {getStatusDisplay(todayStatus.status)}
                        </strong></span>
                        <span>Time In: {todayStatus.time_in || '-'}</span>
                        <span>Time Out: {todayStatus.time_out || '-'}</span>
                        <span>Hours: {todayStatus.hours_worked || 0}h</span>
                        {todayStatus.late_minutes > 0 && (
                            <span style={{color: '#FF9800'}}>Late: {todayStatus.late_minutes} min</span>
                        )}
                        {todayStatus.overtime_hours > 0 && (
                            <span style={{color: '#4CAF50'}}>Overtime: {todayStatus.overtime_hours}h</span>
                        )}
                    </div>
                </div>
            )}

            {message && <div style={styles.success}>{message}</div>}
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.filterContainer}>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Month:</label>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={styles.filterSelect}>
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Year:</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={styles.filterSelect}>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Department:</label>
                    <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} style={styles.filterSelect}>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Search:</label>
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
                </div>
                <button onClick={handleFilter} style={styles.filterBtn}>Apply</button>
            </div>

            <div style={styles.summaryContainer}>
                <div style={styles.summaryCard}>
                    <span>Total: <strong>{summary.total_days || 0}</strong></span>
                    <span>Present: <strong style={{color: '#4CAF50'}}>{summary.present || 0}</strong></span>
                    <span>Absent: <strong style={{color: '#f44336'}}>{summary.absent || 0}</strong></span>
                    <span>Late: <strong style={{color: '#FF9800'}}>{summary.late || 0}</strong></span>
                    <span>Leave: <strong style={{color: '#2196F3'}}>{summary.leave || 0}</strong></span>
                    <span>Hours: <strong>{summary.total_hours || 0}h</strong></span>
                    <span>Overtime: <strong style={{color: '#4CAF50'}}>{summary.total_overtime || 0}h</strong></span>
                    <span>Percentage: <strong>{summary.attendance_percentage || 0}%</strong></span>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Date</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Hours</th>
                                <th>Late</th>
                                <th>OT</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={styles.emptyCell}>No records found</td>
                                </tr>
                            ) : (
                                attendance.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.employee_name}</td>
                                        <td>{item.date}</td>
                                        <td>{item.time_in || '-'}</td>
                                        <td>{item.time_out || '-'}</td>
                                        <td>{item.hours_worked || 0}h</td>
                                        <td>{item.late_minutes || 0}m</td>
                                        <td>{item.overtime_hours || 0}h</td>
                                        <td>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusColor(item.status)
                                            }}>
                                                {getStatusDisplay(item.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
    },
    loadingSpinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto 30px auto',
        padding: '20px 20px 0 20px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: '4px',
    },
    subtitle: {
        fontSize: '15px',
        color: '#666',
        margin: 0,
    },
    headerButtons: {
        display: 'flex',
        gap: '12px',
    },
    backBtn: {
        padding: '10px 20px',
        backgroundColor: '#666',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    selectorContainer: {
        maxWidth: '1400px',
        margin: '0 auto 20px auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
    },
    selectorGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#555',
    },
    select: {
        padding: '10px 14px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        minWidth: '250px',
    },
    actionButtons: {
        display: 'flex',
        gap: '10px',
    },
    checkInBtn: {
        padding: '10px 24px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    checkOutBtn: {
        padding: '10px 24px',
        backgroundColor: '#FF9800',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    todayCard: {
        maxWidth: '1400px',
        margin: '0 auto 15px auto',
        padding: '15px 20px',
        backgroundColor: '#E3F2FD',
        borderRadius: '10px',
        border: '1px solid #BBDEFB',
    },
    todayInfo: {
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap',
        fontSize: '15px',
    },
    filterContainer: {
        maxWidth: '1400px',
        margin: '0 auto 20px auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    filterSelect: {
        padding: '8px 12px',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
    },
    searchInput: {
        padding: '8px 12px',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
        width: '150px',
    },
    filterBtn: {
        padding: '8px 20px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    summaryContainer: {
        maxWidth: '1400px',
        margin: '0 auto 20px auto',
    },
    summaryCard: {
        display: 'flex',
        gap: '25px',
        padding: '15px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        flexWrap: 'wrap',
        fontSize: '14px',
    },
    tableContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '20px',
        overflowX: 'auto',
        marginBottom: '40px',
    },
    tableWrapper: {
        minWidth: '100%',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
    },
    emptyCell: {
        textAlign: 'center',
        padding: '30px',
        color: '#888',
    },
    error: {
        maxWidth: '1400px',
        margin: '0 auto 15px auto',
        backgroundColor: '#FEE',
        color: '#D32F2F',
        padding: '12px 20px',
        borderRadius: '8px',
    },
    success: {
        maxWidth: '1400px',
        margin: '0 auto 15px auto',
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
        padding: '12px 20px',
        borderRadius: '8px',
    },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default Attendance;