import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, AlertCircle, FileText, MapPin, TrendingUp, Clock } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';

const MyReports = () => {
  const [reports, setReports] = useState([]);
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
          ? Math.random() > 0.7 ? '#10b981' : '#34d399' 
          : Math.random() > 0.7 ? '#059669' : '#10b981';
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
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/accidents');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Analyzed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Reviewed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
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

  const getClaimStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border border-red-200';
      case 'in_review':
        return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
            My Reports
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Manage and track all your accident reports and claims
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="card rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
            <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Reports Yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              You haven't reported any accidents yet. Start by reporting your first accident to get AI-powered analysis and insurance support.
            </p>
            <Link 
              to="/report-accident" 
              className="btn-primary rounded-2xl px-8 py-4 inline-flex items-center space-x-3 text-lg font-semibold"
            >
              <span>Report Your First Accident</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {reports.map((report) => (
              <div 
                key={report._id} 
                className="card rounded-3xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col h-full">
                  {}
                  <div className="flex-shrink-0 mb-6">
                    <img
                      src={report.imageUrl}
                      alt="Accident"
                      className="w-full h-48 object-cover rounded-2xl shadow-md"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    {}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Accident Report
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(report.createdAt), 'PPp')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-2xl text-xs font-semibold ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Severity</p>
                        <p className={`font-bold text-sm capitalize px-2 py-1 rounded-xl ${getSeverityColor(report.prediction?.severity)}`}>
                          {report.prediction?.severity || 'N/A'}
                        </p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Confidence</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {report.prediction?.confidence ? `${(report.prediction.confidence).toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Est. Cost</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${report.repair_cost?.estimated_cost?.toLocaleString() || 'N/A'}
                        </p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Claim</p>
                        <p className={`font-bold text-sm capitalize px-2 py-1 rounded-xl ${getClaimStatusColor(report.claimId?.status)}`}>
                          {report.claimId?.status || 'No Claim'}
                        </p>
                      </div>
                    </div>

                    {}
                    {report.location?.address && (
                      <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {report.location.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {}
                    <div className="mt-auto space-y-3">
                      {report.claimId && (
                        <Link
                          to={`/claim/${report.claimId._id || report.claimId}`}
                          className="btn-primary rounded-2xl flex items-center justify-center space-x-2 py-3 font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Claim Details</span>
                        </Link>
                      )}

                      {report.reportUrl && (
                        <a
                          href={report.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary rounded-2xl flex items-center justify-center space-x-2 py-3 font-semibold dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View PDF Report</span>
                        </a>
                      )}

                      {!report.claimId && (
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            No claim filed yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;