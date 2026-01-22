import { useEffect, useState } from 'react';
import { FileText, RefreshCw, Shield, Clock, User, Activity } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
          ? Math.random() > 0.7 ? '#dc2626' : '#ef4444' 
          : Math.random() > 0.7 ? '#b91c1c' : '#dc2626';
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
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action = "") => {
    if (action?.includes('CREATE') || action?.includes('APPROVE')) {
      return 'bg-green-100 text-green-800 border border-green-200';
    }
    if (action?.includes('DELETE') || action?.includes('REJECT')) {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    if (action?.includes('UPDATE') || action?.includes('REASSIGN')) {
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
    if (action?.includes('LOGIN') || action?.includes('ACCESS')) {
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getActionIcon = (action = "") => {
    if (action?.includes('CREATE') || action?.includes('APPROVE')) {
      return '✅';
    }
    if (action?.includes('DELETE') || action?.includes('REJECT')) {
      return '❌';
    }
    if (action?.includes('UPDATE') || action?.includes('REASSIGN')) {
      return '✏️';
    }
    if (action?.includes('LOGIN') || action?.includes('ACCESS')) {
      return '🔐';
    }
    return '📋';
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="rounded-2xl p-6 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  const totalLogs = logs.length;
  const adminActions = logs.filter(log => log.actorId?.role === 'admin').length;
  const agentActions = logs.filter(log => log.actorId?.role === 'agent').length;
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.createdAt);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-gray-900 to-red-700 dark:from-white dark:to-red-400 bg-clip-text text-transparent">
                  System Audit Logs
                </h1>
                <p className="text-lg text-gray-300 font-light">
                  Comprehensive security and activity monitoring
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            className="btn-primary rounded-2xl px-6 py-3 flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Logs"
            value={totalLogs}
            icon={FileText}
            color="text-red-400"
            description="All system activities"
          />
          <StatCard
            title="Today's Activities"
            value={todayLogs}
            icon={Activity}
            color="text-blue-400"
            description="Actions in last 24h"
          />
          <StatCard
            title="Admin Actions"
            value={adminActions}
            icon={User}
            color="text-purple-400"
            description="Administrator activities"
          />
          <StatCard
            title="Agent Actions"
            value={agentActions}
            icon={Shield}
            color="text-green-400"
            description="Insurance agent activities"
          />
        </div>

        {}
        <div className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">System Activity Log</h2>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Audit Logs Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                System activity logs will appear here as users interact with the platform.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Action</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Actor</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Description</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getActionIcon(log.action)}</span>
                          <span className={`px-3 py-2 rounded-2xl text-xs font-semibold capitalize ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-white">{log.actorId?.name || 'System'}</p>
                          <p className="text-xs text-gray-400 capitalize">{log.actorId?.role || 'Automated'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-300 max-w-md">{log.description || 'No description'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {log?.createdAt && !isNaN(new Date(log.createdAt))
                              ? format(new Date(log.createdAt), 'PPp')
                            : "N/A"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;