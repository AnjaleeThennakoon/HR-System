import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/employees', label: 'Employees' },
        { path: '/attendance', label: 'Attendance' },
        { path: '/add-employee', label: 'Add Employee' },
    ];

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <div style={styles.brand} onClick={() => navigate('/dashboard')}>
                    <span style={styles.brandIcon}></span>
                    <span style={styles.brandText}>HR System</span>
                </div>

                <div style={styles.navLinks}>
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                ...styles.navLink,
                                ...(isActive(item.path) ? styles.navLinkActive : {})
                            }}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={styles.userSection}>
                    <span style={styles.userName}> Admin</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        <span style={styles.navIcon}></span>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        backgroundColor: '#1a1a2e',
        padding: '0 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    navContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
    },
    brandIcon: {
        fontSize: '28px',
    },
    brandText: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'white',
        letterSpacing: '0.5px',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        flex: 1,
        justifyContent: 'center',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: '#a0a0c0',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
    },
    navLinkActive: {
        backgroundColor: 'rgba(102, 126, 234, 0.25)',
        color: '#ffffff',
    },
    navIcon: {
        fontSize: '16px',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    userName: {
        color: '#a0a0c0',
        fontSize: '14px',
        fontWeight: '500',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
};

export default Navbar;