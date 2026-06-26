import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import Attendance from './pages/Attendance';
import Dashboard from './pages/Dashboard';
import { isAuthenticated } from './api';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
                    } 
                />
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/employees" 
                    element={
                        <PrivateRoute>
                            <Employees />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/add-employee" 
                    element={
                        <PrivateRoute>
                            <AddEmployee />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/attendance" 
                    element={
                        <PrivateRoute>
                            <Attendance />
                        </PrivateRoute>
                    } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;