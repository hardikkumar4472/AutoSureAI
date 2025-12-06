import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, FileText, Clock, AlertTriangle, User, MapPin } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import ChatWindow from '../../components/ChatWindow';
import { useSocket } from '../../context/SocketContext';

const ClaimDetails = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
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
    canvas.style.opacity = '0.4';
    
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
        this.speed = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random() * 0.2 + 0.1;
        this.color = document.documentElement.classList.contains('dark') 
          ? Math.random() > 0.7 ? '#3b82f6' : '#60a5fa' 
          : Math.random() > 0.7 ? '#1d4ed8' : '#2563eb';
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
    
    const particles = Array.from({ length: 30 }, () => new Particle());
    
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

  const safeFormat = (dateValue, pattern = 'PPp') => {
    if (!dateValue) return 'N/A';
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj)) return 'N/A';
    return format(dateObj, pattern);
  };

  useEffect(() => {
    fetchClaimDetails();

    if (socket) {
      const updateHandler = (data) => {
        if (data.claimId === id) {
          fetchClaimDetails();
        }
      };

      socket.on('claim_updated', updateHandler);
      socket.on('claim_settled', updateHandler);

      return () => {
        socket.off('claim_updated', updateHandler);
        socket.off('claim_settled', updateHandler);
      };
    }
  }, [id, socket]);

  const fetchClaimDetails = async () => {
    try {
      const { data } = await api.get(`/claims/${id}`);
      setClaim(data.claim);
    } catch (error) {
      console.error('Error fetching claim:', error);
      setClaim(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      in_review: 'bg-blue-100 text-blue-800 border border-blue-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      settled: 'bg-purple-100 text-purple-800 border border-purple-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const StatusStep = ({ active, completed, icon: Icon, label }) => (
    <div className="flex items-center space-x-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        completed ? 'bg-green-500 text-white' : 
        active ? 'bg-primary-500 text-white' : 
        'bg-gray-200 text-gray-500'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className={`text-sm font-medium ${
        completed || active ? 'text-gray-900 dark:text-white' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Claim Not Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The requested claim could not be found.</p>
          <Link 
            to="/my-reports" 
            className="btn-primary rounded-2xl px-6 py-3 inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reports</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/my-reports"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Reports</span>
          </Link>
          
          <div className="text-right">
            <span className={`px-4 py-2 rounded-2xl text-sm font-semibold capitalize ${getStatusBadge(claim.status)}`}>
              {claim.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full"></div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Claim Details</h1>
                </div>
              </div>

              {claim.reportId && (
                <div className="mb-8">
                  <img
                    src={claim.reportId.imageUrl}
                    alt="Accident"
                    className="w-full h-80 object-cover rounded-2xl shadow-lg mb-6"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Severity</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {claim.reportId.prediction?.severity || 'N/A'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Confidence</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {claim.reportId.prediction?.confidence
                          ? `${(claim.reportId.prediction.confidence).toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Estimated Cost</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {claim.assignedAgent && (
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Agent</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">{claim.assignedAgent.name}</p>
                      <p className="text-gray-600 dark:text-gray-300">{claim.assignedAgent.email}</p>
                      {claim.assignedAgent.phone && (
                        <p className="text-gray-600 dark:text-gray-300">{claim.assignedAgent.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {claim.remarks && (
                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Agent Remarks</h3>
                    <p className="text-yellow-700 dark:text-yellow-300">{claim.remarks}</p>
                  </div>
                )}

                {claim.reportId?.reportUrl && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Accident Report</h3>
                      </div>
                      <a
                        href={claim.reportId.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary rounded-2xl px-4 py-2 text-sm"
                      >
                        View PDF Report
                      </a>
                    </div>
                  </div>
                )}

                {claim.settlementInfo && (
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Settlement Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-700 dark:text-purple-300 font-medium">Amount</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          ${claim.settlementInfo.amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-700 dark:text-purple-300 font-medium">Method</p>
                        <p className="text-purple-900 dark:text-purple-100 capitalize">{claim.settlementInfo.method}</p>
                      </div>
                      {claim.settlementInfo.reference && (
                        <div className="md:col-span-2">
                          <p className="text-purple-700 dark:text-purple-300 font-medium">Reference</p>
                          <p className="text-purple-900 dark:text-purple-100">{claim.settlementInfo.reference}</p>
                        </div>
                      )}
                      {claim.settlementInfo.notes && (
                        <div className="md:col-span-2">
                          <p className="text-purple-700 dark:text-purple-300 font-medium">Notes</p>
                          <p className="text-purple-900 dark:text-purple-100">{claim.settlementInfo.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Settled at: {safeFormat(claim.settlementInfo.settledAt)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Timeline</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Created:</strong> {safeFormat(claim.createdAt)}
                  </p>
                  {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Last Updated:</strong> {safeFormat(claim.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {claim.status !== 'rejected' && claim.status !== 'approved' && (
              <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                <ChatWindow claimId={id} />
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claim Status</h2>
              </div>

              <div className="space-y-6">
                <StatusStep
                  active={['pending', 'in_review', 'approved', 'settled'].includes(claim.status)}
                  completed={['in_review', 'approved', 'settled'].includes(claim.status)}
                  icon={CheckCircle}
                  label="Claim Submitted"
                />
                
                <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-600 h-6"></div>
                
                <StatusStep
                  active={['in_review', 'approved', 'settled'].includes(claim.status)}
                  completed={['approved', 'settled'].includes(claim.status)}
                  icon={claim.status === 'rejected' ? XCircle : CheckCircle}
                  label="Agent Review"
                />
                
                <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-600 h-6"></div>
                
                <StatusStep
                  active={claim.status === 'settled'}
                  completed={claim.status === 'settled'}
                  icon={CheckCircle}
                  label="Settlement Completed"
                />
              </div>
            </div>

            <div className="card rounded-3xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/my-reports"
                  className="w-full btn-secondary rounded-2xl flex items-center justify-center space-x-2 py-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>All Reports</span>
                </Link>
                
                {claim.reportId?.location && (
                  <button
                    onClick={() => {
                      const { lat, lon } = claim.reportId.location;
                      window.open(`https://maps.google.com/?q=${lat},${lon}`, '_blank');
                    }}
                    className="w-full btn-secondary rounded-2xl flex items-center justify-center space-x-2 py-3"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>View Location</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetails;