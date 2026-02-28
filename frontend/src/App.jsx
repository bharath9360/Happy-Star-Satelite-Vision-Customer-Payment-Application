import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import CustomerForm from './pages/CustomerForm';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import BoxList from './pages/admin/BoxList';
import InsertBox from './pages/admin/InsertBox';
import BulkInsert from './pages/admin/BulkInsert';
import EditBox from './pages/admin/EditBox';
import PaymentList from './pages/admin/PaymentList';
import PaymentStats from './pages/admin/PaymentStats';
import Settings from './pages/admin/Settings';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<CustomerForm />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute><BoxList /></PrivateRoute>} />
        <Route path="/admin/customers/new" element={<PrivateRoute><InsertBox /></PrivateRoute>} />
        <Route path="/admin/customers/bulk" element={<PrivateRoute><BulkInsert /></PrivateRoute>} />
        <Route path="/admin/customers/:id/edit" element={<PrivateRoute><EditBox /></PrivateRoute>} />
        <Route path="/admin/payments" element={<PrivateRoute><PaymentList /></PrivateRoute>} />
        <Route path="/admin/stats" element={<PrivateRoute><PaymentStats /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
