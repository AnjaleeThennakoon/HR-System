import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryData, setSalaryData] = useState({
        basic: '',
        allowance: '',
        bonus: '',
        deduction: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        id: '',
        name: '',
        email: '',
        department: '',
        position: '',
        phone: '',
        basic_salary: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://127.0.0.1:8000/api/employees/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setEmployees(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Failed to load employees');
            setLoading(false);
        }
    };

    // Search & Filter
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    // Delete Employee
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                const token = localStorage.getItem('access_token');
                await axios.delete(`http://127.0.0.1:8000/api/employees/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchEmployees();
            } catch (error) {
                console.error('Error deleting employee:', error);
                alert('Failed to delete employee');
            }
        }
    };

    // Open Salary Modal
    const handleSalaryClick = (employee) => {
        setSelectedEmployee(employee);
        setSalaryData({
            basic: employee.basic_salary || '',
            allowance: '',
            bonus: '',
            deduction: ''
        });
        setShowSalaryModal(true);
    };

    // Calculate Salary
    const calculateSalary = () => {
        const basic = parseFloat(salaryData.basic) || 0;
        const allowance = parseFloat(salaryData.allowance) || 0;
        const bonus = parseFloat(salaryData.bonus) || 0;
        const deduction = parseFloat(salaryData.deduction) || 0;
        const total = basic + allowance + bonus - deduction;
        return total.toFixed(2);
    };

    // Open Edit Modal
    const handleEditClick = (employee) => {
        setEditData({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            position: employee.position,
            phone: employee.phone || '',
            basic_salary: employee.basic_salary || ''
        });
        setShowEditModal(true);
    };

    // Update Employee
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            await axios.put(`http://127.0.0.1:8000/api/employees/${editData.id}/`, editData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setShowEditModal(false);
            fetchEmployees();
            alert('Employee updated successfully!');
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Department colors
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

    // Get departments for filter
    const departments = ['All', ...new Set(employees.map(emp => emp.department))];

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <Navbar />
            
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Employee Management</h1>
                    <p style={styles.subtitle}>Manage your workforce</p>
                </div>
                <div style={styles.headerButtons}>
                    <button onClick={() => navigate('/add-employee')} style={styles.addBtn}>
                         Add Employee
                    </button>
                    <button onClick={() => navigate('/attendance')} style={styles.attendanceBtn}>
                         Attendance
                    </button>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div style={styles.filterSection}>
                <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={styles.filterSelect}
                >
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
                <div style={styles.stats}>
                    <span>Total: {filteredEmployees.length}</span>
                </div>
            </div>

            {/* Employee Cards */}
            <div style={styles.cardContainer}>
                {loading ? (
                    <div style={styles.loading}>Loading employees...</div>
                ) : error ? (
                    <div style={styles.error}>{error}</div>
                ) : filteredEmployees.length === 0 ? (
                    <div style={styles.empty}>No employees found</div>
                ) : (
                    filteredEmployees.map((emp) => (
                        <div key={emp.id} style={styles.employeeCard}>
                            <div style={styles.cardHeader}>
                                <div style={styles.avatar}>
                                    {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={styles.cardInfo}>
                                    <h3 style={styles.empName}>{emp.name}</h3>
                                    <span style={styles.empPosition}>{emp.position}</span>
                                </div>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.cardDetail}>
                                    <span style={styles.detailLabel}>Email</span>
                                    <span style={styles.detailValue}>{emp.email}</span>
                                </div>
                                <div style={styles.cardDetail}>
                                    <span style={styles.detailLabel}>Department</span>
                                    <span 
                                        style={{
                                            ...styles.departmentBadge,
                                            backgroundColor: getDepartmentColor(emp.department)
                                        }}
                                    >
                                        {emp.department}
                                    </span>
                                </div>
                                <div style={styles.cardDetail}>
                                    <span style={styles.detailLabel}>Salary</span>
                                    <span style={styles.salaryValue}>
                                        LKR {emp.basic_salary || '0'}.00
                                    </span>
                                </div>
                            </div>

                            <div style={styles.cardActions}>
                                <button 
                                    onClick={() => handleSalaryClick(emp)} 
                                    style={styles.salaryBtn}
                                >
                                     Salary
                                </button>
                                <button 
                                    onClick={() => handleEditClick(emp)} 
                                    style={styles.editBtn}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(emp.id)} 
                                    style={styles.deleteBtn}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Salary Modal */}
            {showSalaryModal && selectedEmployee && (
                <div style={styles.modalOverlay} onClick={() => setShowSalaryModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}> Salary Calculator</h2>
                        <h4 style={styles.modalSubtitle}>{selectedEmployee.name}</h4>

                        <div style={styles.modalForm}>
                            <div style={styles.modalInputGroup}>
                                <label>Basic Salary</label>
                                <input
                                    type="number"
                                    value={salaryData.basic}
                                    onChange={(e) => setSalaryData({...salaryData, basic: e.target.value})}
                                    style={styles.modalInput}
                                />
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Allowance</label>
                                <input
                                    type="number"
                                    value={salaryData.allowance}
                                    onChange={(e) => setSalaryData({...salaryData, allowance: e.target.value})}
                                    style={styles.modalInput}
                                />
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Bonus</label>
                                <input
                                    type="number"
                                    value={salaryData.bonus}
                                    onChange={(e) => setSalaryData({...salaryData, bonus: e.target.value})}
                                    style={styles.modalInput}
                                />
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Deduction</label>
                                <input
                                    type="number"
                                    value={salaryData.deduction}
                                    onChange={(e) => setSalaryData({...salaryData, deduction: e.target.value})}
                                    style={styles.modalInput}
                                />
                            </div>
                        </div>

                        <div style={styles.modalTotal}>
                            <strong>Total Salary:</strong> 
                            <span style={styles.modalTotalAmount}>LKR {calculateSalary()}</span>
                        </div>

                        <div style={styles.modalActions}>
                            <button 
                                onClick={() => setShowSalaryModal(false)} 
                                style={styles.modalCloseBtn}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Edit Employee</h2>

                        <form onSubmit={handleUpdate} style={styles.modalForm}>
                            <div style={styles.modalInputGroup}>
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    style={styles.modalInput}
                                    required
                                />
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                    style={styles.modalInput}
                                    required
                                />
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Department</label>
                                <select
                                    value={editData.department}
                                    onChange={(e) => setEditData({...editData, department: e.target.value})}
                                    style={styles.modalInput}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Operations">Operations</option>
                                </select>
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Position</label>
                                <input
                                    type="text"
                                    value={editData.position}
                                    onChange={(e) => setEditData({...editData, position: e.target.value})}
                                    style={styles.modalInput}
                                    required
                                />
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                    style={styles.modalInput}
                                />
                            </div>
                            <div style={styles.modalInputGroup}>
                                <label>Basic Salary</label>
                                <input
                                    type="number"
                                    value={editData.basic_salary}
                                    onChange={(e) => setEditData({...editData, basic_salary: e.target.value})}
                                    style={styles.modalInput}
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.modalSaveBtn}>
                                    Update Employee
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowEditModal(false)} 
                                    style={styles.modalCloseBtn}
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
}

const styles = {
    container: {
        minHeight: '100vh',
        background: '#f0f2f5',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
    addBtn: {
        padding: '12px 24px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    attendanceBtn: {
        padding: '12px 24px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    logoutBtn: {
        padding: '12px 24px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    filterSection: {
        maxWidth: '1400px',
        margin: '0 auto 25px auto',
        padding: '0 20px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    searchInput: {
        flex: '1',
        minWidth: '250px',
        padding: '12px 16px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    },
    filterSelect: {
        padding: '12px 16px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    stats: {
        padding: '10px 20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#1565c0',
        marginLeft: 'auto',
    },
    cardContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px',
        padding: '0 20px 40px 20px',
    },
    employeeCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '24px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '16px',
    },
    avatar: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#f3dc6a',
        color: 'white',
        fontSize: '24px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0',
    },
    cardInfo: {
        flex: '1',
    },
    empName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1a1a2e',
        margin: 0,
    },
    empPosition: {
        fontSize: '14px',
        color: '#666',
        margin: 0,
    },
    cardBody: {
        borderTop: '1px solid #f0f0f0',
        paddingTop: '12px',
        marginBottom: '16px',
    },
    cardDetail: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
    },
    detailLabel: {
        fontSize: '13px',
        color: '#888',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: '14px',
        color: '#333',
        fontWeight: '500',
    },
    departmentBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
    },
    salaryValue: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#4CAF50',
    },
    cardActions: {
        display: 'flex',
        gap: '8px',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '14px',
    },
    salaryBtn: {
        flex: '1',
        padding: '8px 12px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    editBtn: {
        flex: '1',
        padding: '8px 12px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    deleteBtn: {
        flex: '1',
        padding: '8px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        color: '#666',
        gridColumn: '1 / -1',
    },
    error: {
        textAlign: 'center',
        padding: '60px',
        color: '#dc3545',
        gridColumn: '1 / -1',
    },
    empty: {
        textAlign: 'center',
        padding: '60px',
        color: '#888',
        fontSize: '18px',
        gridColumn: '1 / -1',
    },
    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a2e',
        marginTop: 0,
        marginBottom: '4px',
    },
    modalSubtitle: {
        fontSize: '16px',
        color: '#666',
        marginTop: 0,
        marginBottom: '20px',
    },
    modalForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    modalInputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    modalInput: {
        padding: '10px 14px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    },
    modalTotal: {
        backgroundColor: '#f5f7fa',
        padding: '15px 20px',
        borderRadius: '10px',
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '18px',
    },
    modalTotalAmount: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#4CAF50',
    },
    modalActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
    },
    modalSaveBtn: {
        flex: '1',
        padding: '12px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    modalCloseBtn: {
        flex: '1',
        padding: '12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default Employees;