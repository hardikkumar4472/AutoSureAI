import { Link } from 'react-router-dom';
import { PlusCircle, FileText, AlertCircle, CheckCircle, MapPin, MessageSquare, TrendingUp, Shield, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import ChatWindow from '../../components/ChatWindow';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
  });
  const [reports, setReports] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accidents');
      const reports = response.data.reports || [];

      const claims = reports.filter(r => r.claimId).map(r => r.claimId);
      const pending = claims.filter(c => c?.status === 'in_review' || c?.status === 'pending').length;
      const approved = claims.filter(c => c?.status === 'approved').length;
      const rejected = claims.filter(c => c?.status === 'rejected').length;

      setStats({
        totalReports: reports.length,
        pendingClaims: pending,
        approvedClaims: approved,
        rejectedClaims: rejected,
      });
      setReports(reports);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimsWithAgents = useMemo(
    () => reports.filter(report => report.claimId),
    [reports]
  );

  const selectedClaim = useMemo(() => {
    if (!selectedClaimId) return null;
    return claimsWithAgents.find(
      ({ claimId }) => claimId?._id === selectedClaimId
    ) || null;
  }, [claimsWithAgents, selectedClaimId]);

  const chatAllowed = selectedClaim
    ? !['rejected', 'approved'].includes(selectedClaim.claimId?.status)
    : false;

  useEffect(() => {
    if (!selectedClaimId && claimsWithAgents.length > 0) {
      setSelectedClaimId(claimsWithAgents[0].claimId._id);
    }
  }, [claimsWithAgents, selectedClaimId]);

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="card p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ to, icon: Icon, title, description, borderColor, hoverColor }) => (
    <Link
      to={to}
      className="group p-6 card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${borderColor} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 mb-4`}>
          <Icon className={`w-7 h-7 ${borderColor.replace('border-', 'text-')}`} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8">
      {}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
            Manage your accident reports and track claims in real-time
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {user?.isAdmin && (
               <Link
                 to="/admin"
                 className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
               >
                 Go to Admin Dashboard
               </Link>
            )}
            {user?.isAgent && (
               <Link
                 to="/agent"
                 className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
               >
                 Go to Agent Dashboard
               </Link>
            )}
            {user?.isTraffic && (
               <Link
                 to="/traffic"
                 className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
               >
                 Go to Traffic Dashboard
               </Link>
            )}
          </div>
        </div>
        <Link
          to="/report-accident"
          className="btn-primary flex items-center space-x-3 rounded-2xl px-4 py-2 sm:px-6 sm:py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Report Accident</span>
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          icon={FileText}
          color="text-blue-600 dark:text-blue-400"
          loading={loading}
        />
        <StatCard
          title="Pending Claims"
          value={stats.pendingClaims}
          icon={Clock}
          color="text-yellow-600 dark:text-yellow-400"
          loading={loading}
        />
        <StatCard
          title="Approved Claims"
          value={stats.approvedClaims}
          icon={CheckCircle}
          color="text-green-600 dark:text-green-400"
          loading={loading}
        />
        <StatCard
          title="Rejected Claims"
          value={stats.rejectedClaims}
          icon={XCircle}
          color="text-red-600 dark:text-red-400"
          loading={loading}
        />
      </div>

      {}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            to="/report-accident"
            icon={PlusCircle}
            title="Report Accident"
            description="Upload accident images and get instant AI analysis with damage assessment"
            borderColor="border-primary-500"
            hoverColor="hover:border-primary-600"
          />
          <QuickActionCard
            to="/my-reports"
            icon={FileText}
            title="My Reports"
            description="Access all your accident reports, claims history, and detailed documentation"
            borderColor="border-blue-500"
            hoverColor="hover:border-blue-600"
          />
          <QuickActionCard
            to="/hotspot-map"
            icon={MapPin}
            title="Hotspot Map"
            description="Explore accident-prone areas and real-time incident locations worldwide"
            borderColor="border-red-500"
            hoverColor="hover:border-red-600"
          />
        </div>
      </div>

      {}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Communication</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Real-time chat with your assigned insurance agent
              </p>
            </div>
          </div>
        </div>

        {claimsWithAgents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Claims</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              You don't have any active claims yet. Report an accident to start communicating with an agent.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select Claim to Chat
              </label>
              <select
                value={selectedClaimId}
                onChange={(e) => setSelectedClaimId(e.target.value)}
                className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
              >
                <option value="">Choose a claim...</option>
                {claimsWithAgents.map(({ claimId, prediction }) => (
                  <option key={claimId._id} value={claimId._id}>
                    Claim #{claimId._id.slice(-6).toUpperCase()} • 
                    {prediction?.severity ? ` ${prediction.severity.charAt(0).toUpperCase() + prediction.severity.slice(1)}` : ' N/A'} • 
                    <span className={`ml-1 ${
                      claimId.status === 'approved' ? 'text-green-600' :
                      claimId.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {claimId.status.replace('_', ' ')}
                    </span>
                  </option>
                ))}
              </select>
            </div>

            {selectedClaim && (
              <>
                <div className="p-6 bg-white/5 dark:bg-white/5 rounded-2xl border border-white/10 space-y-4 backdrop-blur-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned Agent</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        {selectedClaim.claimId.assignedAgent?.name || 'Awaiting Assignment'}
                      </p>
                      {selectedClaim.claimId.assignedAgent?.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedClaim.claimId.assignedAgent.email}
                        </p>
                      )}
                    </div>
                    {selectedClaim.reportUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Documents</p>
                        <a
                          href={selectedClaim.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold text-sm transition-colors duration-200"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Accident Report</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {chatAllowed ? (
                  <ChatWindow claimId={selectedClaimId} />
                ) : (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-center backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 inline-block mr-2" />
                    <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                      Chat is only available for claims that are pending review.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;