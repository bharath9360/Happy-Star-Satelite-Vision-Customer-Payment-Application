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
// Legal & Support pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import RefundPolicy from './pages/legal/RefundPolicy';
import ContactUs from './pages/legal/ContactUs';
import AboutUs from './pages/legal/AboutUs';
import FAQ from './pages/legal/FAQ';
import Security from './pages/legal/Security';
// Admin – extended
import LegalAdmin from './pages/admin/LegalAdmin';
import Enquiries from './pages/admin/Enquiries';
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

        {/* Legal & Support */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/security" element={<Security />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute><BoxList /></PrivateRoute>} />
        <Route path="/admin/customers/new" element={<PrivateRoute><InsertBox /></PrivateRoute>} />
        <Route path="/admin/customers/bulk" element={<PrivateRoute><BulkInsert /></PrivateRoute>} />
        <Route path="/admin/customers/:id/edit" element={<PrivateRoute><EditBox /></PrivateRoute>} />
        <Route path="/admin/payments" element={<PrivateRoute><PaymentList /></PrivateRoute>} />
        <Route path="/admin/stats" element={<PrivateRoute><PaymentStats /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/admin/legal" element={<PrivateRoute><LegalAdmin /></PrivateRoute>} />
        <Route path="/admin/enquiries" element={<PrivateRoute><Enquiries /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
