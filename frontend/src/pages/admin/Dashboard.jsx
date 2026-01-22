import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  ClipboardList,
  BarChart3,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Download,
  Eye,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    agents: 0,
    traffic: 0,
    claims: 0,
    accidents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const [agentsRes, trafficRes, claimsRes] = await Promise.all([
        api.get('/admin/agents'),
        api.get('/admin/traffic'),
        api.get('/admin/claims'),
      ]);

      const claimsData = claimsRes.data.claims || [];
      const totalClaims = claimsData.length;

      setStats({
        agents: agentsRes.data.agents?.length || 0,
        traffic: trafficRes.data.officers?.length || 0,
        claims: totalClaims,
        accidents: totalClaims, 
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/admin/audit-logs?limit=5');
      setRecentActivity(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="rounded-2xl p-6 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-white">{value}</p>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 backdrop-blur-sm border border-white/10`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, link }) => (
    <Link
      to={link}
      className="group p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 mb-4 backdrop-blur-sm border border-white/10`}>
          <Icon className={`w-7 h-7 ${color.replace('border-', 'text-')}`} />
        </div>
        <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
      </div>
    </Link>
  );

  const ActivityItem = ({ activity }) => {
    const getActionColor = (action) => {
      if (action?.includes('CREATE') || action?.includes('APPROVE')) return 'text-green-600';
      if (action?.includes('DELETE') || action?.includes('REJECT')) return 'text-red-600';
      if (action?.includes('UPDATE') || action?.includes('REASSIGN')) return 'text-blue-600';
      return 'text-gray-600';
    };

    const getActionIcon = (action) => {
      if (action?.includes('CREATE') || action?.includes('APPROVE')) return <CheckCircle className="w-4 h-4 text-green-500" />;
      if (action?.includes('DELETE') || action?.includes('REJECT')) return <XCircle className="w-4 h-4 text-red-500" />;
      if (action?.includes('UPDATE') || action?.includes('REASSIGN')) return <Settings className="w-4 h-4 text-blue-500" />;
      return <Activity className="w-4 h-4 text-gray-500" />;
    };

    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-xl transition-colors duration-200 cursor-default border border-transparent hover:border-white/10">
        {getActionIcon(activity.action)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {activity.actorId?.name || 'System'}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {activity.description || activity.action}
          </p>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  };

  const quickActions = [
    {
      title: 'Analytics & Reports',
      description: 'View comprehensive system analytics and performance reports',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'border-blue-500',
    },
    {
      title: 'Manage Agents',
      description: 'Create and manage insurance agent accounts and assignments',
      icon: Users,
      link: '/admin/agents',
      color: 'border-green-500',
    },
    {
      title: 'Traffic Officers',
      description: 'Manage traffic police officers and verification workflows',
      icon: Shield,
      link: '/admin/traffic',
      color: 'border-yellow-500',
    },
    {
      title: 'Claims Management',
      description: 'Oversee and reassign insurance claims across agents',
      icon: ClipboardList,
      link: '/admin/claims',
      color: 'border-purple-500',
    },
    {
      title: 'Broadcast Messages',
      description: 'Send system-wide announcements and notifications',
      icon: MessageSquare,
      link: '/admin/broadcast',
      color: 'border-pink-500',
    },
    {
      title: 'Security Audit',
      description: 'Monitor system activity and security logs',
      icon: AlertCircle,
      link: '/admin/audit-logs',
      color: 'border-red-500',
    },
    {
      title: 'Data Exports',
      description: 'Export system data in multiple formats for analysis',
      icon: Download,
      link: '/admin/exports',
      color: 'border-indigo-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-400">
                  Admin Dashboard
                </h1>
                <p className="text-lg text-gray-300 font-light">
                  Comprehensive system management and oversight
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-indigo-400 bg-white/5 px-4 py-2 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
            <Eye className="w-4 h-4" />
            <span>System Overview</span>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Insurance Agents"
            value={stats.agents}
            icon={Users}
            color="text-green-400"
            description="Active agents handling claims"
          />
          <StatCard
            title="Traffic Officers"
            value={stats.traffic}
            icon={Shield}
            color="text-yellow-400"
            description="Verification officers"
          />
          <StatCard
            title="Total Claims"
            value={stats.claims}
            icon={ClipboardList}
            color="text-blue-400"
            description="Insurance claims processed"
          />
          <StatCard
            title="Accident Reports"
            value={stats.accidents}
            icon={TrendingUp}
            color="text-purple-400"
            description="Reported incidents"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border border-green-500/20 bg-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-400">System Status</p>
                <p className="text-2xl font-bold text-green-300">Operational</p>
                <p className="text-xs text-green-400 mt-1">All systems running smoothly</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="card p-6 border border-blue-500/20 bg-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-400">Performance</p>
                <p className="text-2xl font-bold text-blue-300">Optimal</p>
                <p className="text-xs text-blue-400 mt-1">High system performance</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="card p-6 border border-purple-500/20 bg-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-400">Security</p>
                <p className="text-2xl font-bold text-purple-300">Secure</p>
                <p className="text-xs text-purple-400 mt-1">All systems protected</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.link} {...action} />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No recent activity</p>
                <p className="text-gray-500 text-xs mt-1">System activities will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={activity._id || index} activity={activity} />
                ))}
                <div className="pt-4 border-t border-white/20">
                  <Link
                    to="/admin/audit-logs"
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
                  >
                    View all activity →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">System Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-white">{stats.agents}</p>
              <p className="text-sm text-gray-400">Agents</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-semibold text-white">{stats.traffic}</p>
              <p className="text-sm text-gray-400">Officers</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <ClipboardList className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-semibold text-white">{stats.claims}</p>
              <p className="text-sm text-gray-400">Claims</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-semibold text-white">{stats.accidents}</p>
              <p className="text-sm text-gray-400">Accidents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;