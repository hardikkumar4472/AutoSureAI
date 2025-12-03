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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.min-h-screen');

    if (!container) return;

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.3';

    container.style.position = 'relative';
    container.appendChild(canvas);

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.4 + 0.1;
        this.opacity = Math.random() * 0.2 + 0.1;
        this.color = document.documentElement.classList.contains('dark')
          ? Math.random() > 0.7 ? '#6366f1' : '#8b5cf6'
          : Math.random() > 0.7 ? '#4f46e5' : '#6366f1';
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.reset();
          this.y = -10;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 25 }, () => new Particle());

    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

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
    <div className="card rounded-2xl p-6 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, link }) => (
    <Link
      to={link}
      className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 mb-4`}>
          <Icon className={`w-7 h-7 ${color.replace('border-', 'text-')}`} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
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
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-200">
        {getActionIcon(activity.action)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activity.actorId?.name || 'System'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {activity.description || activity.action}
          </p>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Comprehensive system management and oversight
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <Eye className="w-4 h-4" />
            <span>System Overview</span>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Insurance Agents"
            value={stats.agents}
            icon={Users}
            color="text-green-600 dark:text-green-400"
            description="Active agents handling claims"
          />
          <StatCard
            title="Traffic Officers"
            value={stats.traffic}
            icon={Shield}
            color="text-yellow-600 dark:text-yellow-400"
            description="Verification officers"
          />
          <StatCard
            title="Total Claims"
            value={stats.claims}
            icon={ClipboardList}
            color="text-blue-600 dark:text-blue-400"
            description="Insurance claims processed"
          />
          <StatCard
            title="Accident Reports"
            value={stats.accidents}
            icon={TrendingUp}
            color="text-purple-600 dark:text-purple-400"
            description="Reported incidents"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card rounded-2xl p-6 border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">System Status</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">Operational</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">All systems running smoothly</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="card rounded-2xl p-6 border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Performance</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">Optimal</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">High system performance</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="card rounded-2xl p-6 border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Security</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">Secure</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">All systems protected</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.link} {...action} />
                ))}
              </div>
            </div>
          </div>
          <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">System activities will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={activity._id || index} activity={activity} />
                ))}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/admin/audit-logs"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
                  >
                    View all activity →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{stats.agents}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agents</p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{stats.traffic}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Officers</p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{stats.claims}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Claims</p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{stats.accidents}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accidents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;