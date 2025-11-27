import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle, XCircle, FileText, Shield, Siren, Badge, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TrafficDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

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
          ? Math.random() > 0.7 ? '#1e40af' : '#3b82f6' 
          : Math.random() > 0.7 ? '#1e3a8a' : '#1d4ed8';
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
    fetchReports();
  }, [page]);

  const fetchReports = async () => {
    try {
      const response = await api.get(`/traffic/reports/pending?page=${page}&limit=${limit}`);
      setReports(response.data.reports || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: total,
    verified: reports.filter(r => r.verification?.status === 'verified').length,
    fraudulent: reports.filter(r => r.verification?.status === 'fraudulent').length,
    unverified: reports.filter(r => r.verification?.status === 'unverified').length,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading traffic dashboard...</p>
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
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                  Traffic Police Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Verify and manage accident reports with law enforcement authority
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-blue-200 dark:border-blue-800">
            <Badge className="w-4 h-4" />
            <span>Police Verification Portal</span>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Reports"
            value={stats.total}
            icon={Clock}
            color="text-yellow-600 dark:text-yellow-400"
            description="Awaiting police verification"
          />
          <StatCard
            title="Verified"
            value={stats.verified}
            icon={CheckCircle}
            color="text-green-600 dark:text-green-400"
            description="Confirmed incidents"
          />
          <StatCard
            title="Fraudulent"
            value={stats.fraudulent}
            icon={XCircle}
            color="text-red-600 dark:text-red-400"
            description="False reports detected"
          />
          <StatCard
            title="Unverified"
            value={stats.unverified}
            icon={AlertCircle}
            color="text-blue-600 dark:text-blue-400"
            description="Initial status"
          />
        </div>

        {}
        {stats.total > 0 && (
          <div className="card rounded-3xl p-6 border border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800/30 rounded-xl flex items-center justify-center">
                  <Siren className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Active Cases Requiring Attention</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stats.total} pending verification{stats.total !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        )}

        {}
        <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Accident Reports</h2>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Pending Reports</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                All accident reports have been processed. New reports will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <Link
                    key={report._id}
                    to={`/traffic/report/${report._id}`}
                    className="group border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col h-full">
                      {}
                      <div className="flex-shrink-0 mb-4">
                        <img
                          src={report.imageUrl}
                          alt="Accident scene"
                          className="w-full h-48 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        {}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                            {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                          </span>
                          <span className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize ${getSeverityColor(report.prediction?.severity)}`}>
                            {report.prediction?.severity || 'Unknown'}
                          </span>
                        </div>

                        {}
                        <div className="mb-4">
                          <p className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {report.userId?.name || 'Unknown Driver'}
                          </p>
                          {report.userId?.vehicleNumber && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Vehicle: {report.userId.vehicleNumber}
                            </p>
                          )}
                        </div>

                        {}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {report.location?.address || 'Location not specified'}
                          </p>
                        </div>

                        {}
                        <div className="mt-auto flex items-center justify-between">
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            Verify Report →
                          </p>
                          {report.reportUrl && (
                            <a
                              href={report.reportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium transition-colors duration-200"
                            >
                              <FileText className="w-3 h-3" />
                              <span>PDF</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {}
              {total > limit && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary rounded-2xl px-6 py-3 disabled:opacity-50 transition-all duration-200 hover:shadow-lg"
                  >
                    Previous Page
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                    className="btn-secondary rounded-2xl px-6 py-3 disabled:opacity-50 transition-all duration-200 hover:shadow-lg"
                  >
                    Next Page
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficDashboard;