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
  Download,
  Eye,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  ArrowRight,
  TrendingDown,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../../utils/api';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, activityRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/audit-logs?limit=10')
      ]);

      setData(overviewRes.data);
      setRecentActivity(activityRes.data.logs || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const claimStatusData = data ? Object.entries(data.stats.claims.byStatus).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value
  })) : [];

  const userData = data ? [
    { name: 'Admins', count: data.stats.users.admins },
    { name: 'Agents', count: data.stats.users.agents },
    { name: 'Officers', count: data.stats.users.traffic },
    { name: 'Drivers', count: data.stats.users.total - (data.stats.users.admins + data.stats.users.agents + data.stats.users.traffic) }
  ] : [];

  const StatCard = ({ title, value, icon: Icon, color, description, trend }) => (
    <div className="rounded-3xl p-6 border border-white/20 bg-white/10 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-20 border border-white/10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-400 animate-pulse">Analyzing system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Overview</span>
          </h1>
          <p className="text-gray-400">Real-time performance and security analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center space-x-2"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
          </button>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <Link 
            to="/admin/analytics"
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Full Analytics</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Agents"
          value={data?.stats.users.agents}
          icon={UserCheck}
          color="bg-green-500"
          description="Assigned to active claims"
          trend={12}
        />
        <StatCard
          title="Total Claims"
          value={data?.stats.claims.total}
          icon={ClipboardList}
          color="bg-blue-500"
          description="In system history"
          trend={5}
        />
        <StatCard
          title="Traffic Officers"
          value={data?.stats.users.traffic}
          icon={Shield}
          color="bg-yellow-500"
          description="Verification personnel"
        />
        <StatCard
          title="Total Users"
          value={data?.stats.users.total}
          icon={Users}
          color="bg-purple-500"
          description="Registered on platform"
          trend={8}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Claim Distribution Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center space-x-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              <span>Claims Distribution</span>
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span>Status Overview</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={claimStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #ffffff10',
                    borderRadius: '12px',
                    color: '#fff' 
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#colorValue)" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {claimStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Breakdown Chart */}
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
            <span>User Demographics</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="count"
                >
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #ffffff10',
                    borderRadius: '12px',
                    color: '#fff' 
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Platform Utilization</span>
              <span className="text-sm font-bold text-white">84%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[84%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Claims Table */}
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center space-x-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              <span>Recent Claims</span>
            </h3>
            <Link to="/admin/claims" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {data?.recentClaims.map((claim) => (
              <div 
                key={claim._id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                    <ClipboardList className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{claim.driverId?.name || 'Anonymous User'}</p>
                    <p className="text-xs text-gray-400">{format(new Date(claim.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    claim.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                    claim.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/20 text-red-400 border border-red-500/20'
                  }`}>
                    {claim.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center space-x-3">
              <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
              <span>Live Audit Feed</span>
            </h3>
            <Link to="/admin/audit-logs" className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center space-x-1">
              <span>System Logs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentActivity.slice(0, 6).map((activity) => (
              <div key={activity._id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  activity.action?.includes('CREATE') ? 'bg-green-500' :
                  activity.action?.includes('DELETE') ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    <span className="font-bold">{activity.actorId?.name || 'System'}</span>
                    <span className="text-gray-400 mx-2">{activity.description || activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{format(new Date(activity.createdAt), 'HH:mm:ss')} • {activity.actorId?.role || 'automated'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;