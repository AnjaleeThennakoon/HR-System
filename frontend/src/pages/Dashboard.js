import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalDepartments: 0,
        todayPresent: 0,
        totalAttendance: 0,
        recentEmployees: [],
        attendanceToday: []
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            const empResponse = await axios.get('http://127.0.0.1:8000/api/employees/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const deptResponse = await axios.get('http://127.0.0.1:8000/api/departments/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const attResponse = await axios.get('http://127.0.0.1:8000/api/attendance/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const employees = empResponse.data || [];
            const departments = deptResponse.data || [];
            const attendance = attResponse.data || [];

            const today = new Date().toISOString().split('T')[0];
            const todayAttendance = attendance.filter(a => a.date === today);

            setStats({
                totalEmployees: employees.length,
                totalDepartments: departments.length,
                todayPresent: todayAttendance.filter(a => a.status === 'P').length,
                totalAttendance: attendance.length,
                recentEmployees: employees.slice(0, 5),
                attendanceToday: todayAttendance
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Navbar />
            
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Dashboard</h1>
                    <p style={styles.subtitle}>HR System Overview</p>
                </div>
                <div style={styles.headerButtons}>
                    <button onClick={() => navigate('/employees')} style={styles.navBtn}>
                         Employees
                    </button>
                    <button onClick={() => navigate('/attendance')} style={styles.navBtn}>
                        Attendance
                    </button>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                         Logout
                    </button>
                </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div>
                        <div style={styles.statNumber}>{stats.totalEmployees}</div>
                        <div style={styles.statLabel}>Total Employees</div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div>
                        <div style={styles.statNumber}>{stats.totalDepartments}</div>
                        <div style={styles.statLabel}>Departments</div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div>
                        <div style={styles.statNumber}>{stats.todayPresent}</div>
                        <div style={styles.statLabel}>Today Present</div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div>
                        <div style={styles.statNumber}>{stats.totalAttendance}</div>
                        <div style={styles.statLabel}>Total Attendance</div>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Recent Employees</h2>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Position</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={styles.emptyCell}>No employees found</td>
                                </tr>
                            ) : (
                                stats.recentEmployees.map((emp) => (
                                    <tr key={emp.id}>
                                        <td>{emp.emp_id}</td>
                                        <td>{emp.name}</td>
                                        <td>{emp.department}</td>
                                        <td>{emp.position}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Today's Attendance</h2>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.attendanceToday.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={styles.emptyCell}>No attendance records today</td>
                                </tr>
                            ) : (
                                stats.attendanceToday.map((att) => (
                                    <tr key={att.id}>
                                        <td>{att.employee_name || 'N/A'}</td>
                                        <td>{att.time_in || '-'}</td>
                                        <td>{att.time_out || '-'}</td>
                                        <td>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: att.status === 'P' ? '#4CAF50' : 
                                                                att.status === 'L' ? '#FF9800' : '#f44336'
                                            }}>
                                                {att.status === 'P' ? 'Present' : 
                                                 att.status === 'L' ? 'Late' : 
                                                 att.status === 'LV' ? 'Leave' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={styles.quickActions}>
                <h2 style={styles.sectionTitle}>Quick Actions</h2>
                <div style={styles.actionGrid}>
                    <button onClick={() => navigate('/add-employee')} style={styles.actionCard}>
                        <span>Add Employee</span>
                    </button>
                    <button onClick={() => navigate('/employees')} style={styles.actionCard}>
                        <span>View Employees</span>
                    </button>
                    <button onClick={() => navigate('/attendance')} style={styles.actionCard}>
                        <span>Manage Attendance</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: '#f0f2f5',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
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
        fontSize: '32px',
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: '4px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        margin: 0,
    },
    headerButtons: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    navBtn: {
        padding: '10px 20px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    logoutBtn: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    statsGrid: {
        maxWidth: '1400px',
        margin: '0 auto 30px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        padding: '0 20px',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    statIcon: {
        fontSize: '36px',
        width: '50px',
        height: '50px',
        backgroundColor: '#f5f7fa',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statNumber: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a2e',
    },
    statLabel: {
        fontSize: '14px',
        color: '#888',
    },
    section: {
        maxWidth: '1400px',
        margin: '0 auto 30px auto',
        padding: '0 20px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: '15px',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        padding: '20px',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
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
        padding: '20px',
        color: '#888',
    },
    quickActions: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px 40px 20px',
    },
    actionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    actionCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        fontSize: '16px',
        fontWeight: '500',
        color: '#333',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    actionIcon: {
        fontSize: '32px',
    },
    error: {
        maxWidth: '1400px',
        margin: '0 auto 15px auto',
        padding: '12px 20px',
        backgroundColor: '#fee',
        color: '#d32f2f',
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

export default Dashboard;