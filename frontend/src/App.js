import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Employees from './pages/Employees';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;