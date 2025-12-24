import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import HotspotMap from './pages/driver/HotspotMap';

import Home from './pages/Home';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import DriverDashboard from './pages/driver/Dashboard';
import ReportAccident from './pages/driver/ReportAccident';
import MyReports from './pages/driver/MyReports';
import ClaimDetails from './pages/driver/ClaimDetails';
import DriverAnalytics from './pages/driver/Analytics';

import AgentDashboard from './pages/agent/Dashboard';
import AgentClaimDetails from './pages/agent/ClaimDetails';
import AgentAnalytics from './pages/agent/Analytics';
import AgentHotspots from './pages/agent/Hotspots';

import TrafficDashboard from './pages/traffic/Dashboard';
import TrafficReportDetails from './pages/traffic/ReportDetails';
import TrafficAnalytics from './pages/traffic/Analytics';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAgents from './pages/admin/Agents';
import AdminTraffic from './pages/admin/Traffic';
import AdminClaims from './pages/admin/Claims';
import AdminClaimDetails from './pages/admin/ClaimDetails';
import AdminBroadcast from './pages/admin/Broadcast';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminAnalytics from './pages/admin/Analytics';
import AdminExports from './pages/admin/Exports';
import Notifications from './pages/Notifications';
import Snowfall from 'react-snowfall';
import Layout from './components/Layout';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

const NotFound = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'driver': return '/dashboard';
      case 'agent': return '/agent';
      case 'traffic': return '/traffic';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-800">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => window.location.href = isAuthenticated ? getDashboardPath() : '/'}
          className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
        </button>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'driver':
        return '/dashboard';
      case 'agent':
        return '/agent';
      case 'traffic':
        return '/traffic';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Home />
          ) : (
            <Navigate to={getDashboardPath()} replace />
          )
        }
      />

      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/verify-otp" element={!isAuthenticated ? <VerifyOtp /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" replace />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" replace />} />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <Layout><DriverDashboard /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/report-accident"
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <Layout><ReportAccident /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/hotspot-map"
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <Layout><HotspotMap /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/my-reports"
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <Layout><MyReports /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/claim/:id"
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <Layout><ClaimDetails /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/driver/analytics"
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <Layout><DriverAnalytics /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout><Notifications /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/agent"
        element={
          <PrivateRoute allowedRoles={['agent']}>
            <Layout><AgentDashboard /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/agent/claim/:id"
        element={
          <PrivateRoute allowedRoles={['agent']}>
            <Layout><AgentClaimDetails /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/agent/analytics"
        element={
          <PrivateRoute allowedRoles={['agent']}>
            <Layout><AgentAnalytics /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/agent/hotspots"
        element={
          <PrivateRoute allowedRoles={['agent']}>
            <Layout><AgentHotspots /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/traffic"
        element={
          <PrivateRoute allowedRoles={['traffic']}>
            <Layout><TrafficDashboard /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/traffic/report/:id"
        element={
          <PrivateRoute allowedRoles={['traffic']}>
            <Layout><TrafficReportDetails /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/traffic/analytics"
        element={
          <PrivateRoute allowedRoles={['traffic']}>
            <Layout><TrafficAnalytics /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/agents"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminAgents /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/traffic"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminTraffic /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/claims"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminClaims /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/claims/:id"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminClaimDetails /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/broadcast"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminBroadcast /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminAuditLogs /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminAnalytics /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/exports"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout><AdminExports /></Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Snowfall
            snowflakeCount={30}
            style={{
              position: 'fixed',
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
          <AppRoutes />
          <Toaster position="top-right" />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
