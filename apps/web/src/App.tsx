import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Prescriptions } from './pages/Prescriptions';
import { Appointments } from './pages/Appointments';
import { Billing } from './pages/Billing';
import { Reports } from './pages/Reports';
import { AdminUsers } from './pages/AdminUsers';

import { Navbar } from './components/Navbar';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredPermission?: string }> = ({ children, requiredPermission }) => {
  const { token, user, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 pt-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">403</h1>
            <p className="text-xl text-slate-600 mb-8">Access Denied. You do not have permission to view this page.</p>
            <Link to="/dashboard" className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-500">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-4">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute requiredPermission="INVENTORY">
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute requiredPermission="PRESCRIPTIONS">
              <Prescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute requiredPermission="APPOINTMENTS">
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredPermission="BILLING">
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermission="REPORTS">
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission="USERS">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
