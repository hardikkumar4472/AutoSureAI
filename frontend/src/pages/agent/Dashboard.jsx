import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, XCircle, FileText, TrendingUp, Users, AlertTriangle, DollarSign } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

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
          ? Math.random() > 0.7 ? '#0ea5e9' : '#38bdf8' 
          : Math.random() > 0.7 ? '#0369a1' : '#0ea5e9';
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
    fetchClaims();

    if (socket) {
      socket.on('new_claim_assigned', (data) => {
        toast.success('New claim assigned!');
        fetchClaims();
      });

      socket.on('claim_reassigned', () => {
        fetchClaims();
      });

      return () => {
        socket.off('new_claim_assigned');
        socket.off('claim_reassigned');
      };
    }
  }, [socket]);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/agent/claims');
      setClaims(response.data.claims || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      in_review: 'bg-blue-100 text-blue-800 border border-blue-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      settled: 'bg-purple-100 text-purple-800 border border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe':
        return 'text-red-600 bg-red-50 border border-red-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      case 'minor':
        return 'text-green-600 bg-green-50 border border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'in_review' || c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    totalAmount: claims.filter(c => c.status === 'approved').reduce((sum, claim) => sum + (claim.estimatedCost || 0), 0)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
              Agent Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
              Manage and review assigned insurance claims efficiently
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Users className="w-4 h-4" />
            <span>Welcome back, Agent</span>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Claims"
            value={stats.total}
            icon={ClipboardList}
            color="text-blue-600 dark:text-blue-400"
            description="All assigned claims"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            color="text-yellow-600 dark:text-yellow-400"
            description="Requires attention"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="text-green-600 dark:text-green-400"
            description="Successfully processed"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="text-red-600 dark:text-red-400"
            description="Not approved"
          />
        </div>

        {}
        {stats.approved > 0 && (
          <div className="card rounded-3xl p-6 border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Approved Amount</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    ${stats.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        )}

        {}
        <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned Claims</h2>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Claims Assigned</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                You don't have any assigned claims yet. New claims will appear here automatically when assigned to you.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Driver</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Severity</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Est. Cost</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Report</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr 
                      key={claim._id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{claim.driverId?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{claim.driverId?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize ${getSeverityColor(claim.reportId?.prediction?.severity)}`}>
                          {claim.reportId?.prediction?.severity || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-2xl text-xs font-semibold capitalize ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {claim.reportId?.reportUrl ? (
                          <a
                            href={claim.reportId.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View PDF</span>
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No report</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(claim.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/agent/claim/${claim._id}`}
                          className="btn-primary rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                        >
                          Review Claim
                        </Link>
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

export default AgentDashboard;