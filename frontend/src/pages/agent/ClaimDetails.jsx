import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, FileText, User, MapPin, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import ChatWindow from '../../components/ChatWindow';
import SettlementModal from '../../components/SettlementModal';
import toast from 'react-hot-toast';

const AgentClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);//saara ccident clams ko store kar raha hain 
  const [loading, setLoading] = useState(true);//loading ko true kar raha hain 
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

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
          ? Math.random() > 0.7 ? '#8b5cf6' : '#a78bfa'
          : Math.random() > 0.7 ? '#7c3aed' : '#8b5cf6';
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

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const fetchClaimDetails = async () => {
    try {
      const response = await api.get(`/agent/claim/${id}`);
      setClaim(response.data.claim);
      setRemarks(response.data.claim?.remarks || '');
    } catch (error) {
      console.error('Error fetching claim:', error);
      toast.error('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!remarks.trim()) {
      toast.error('Please add remarks before approving');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/agent/claim/${id}/approve`, { remarks });
      toast.success('Claim approved successfully!');
      fetchClaimDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error('Please add remarks before rejecting');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/agent/claim/${id}/reject`, { remarks });
      toast.success('Claim rejected');
      fetchClaimDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettled = (data) => {
    fetchClaimDetails();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Claim Not Found</h3>
          <p className="text-gray-300 mb-6">The requested claim could not be found.</p>
          <button
            onClick={() => navigate('/agent')}
            className="btn-primary rounded-2xl px-6 py-3 inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/agent')}
            className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors duration-200 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl shadow-sm border border-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="text-right">
            <span className={`px-4 py-2 rounded-2xl text-sm font-semibold capitalize ${getStatusColor(claim.status)}`}>
              {claim.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full"></div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Claim Review</h1>
                </div>
              </div>

              {claim.reportId && (
                <div className="mb-8">
                  <img
                    src={claim.reportId.imageUrl}
                    alt="Accident"
                    className="w-full h-80 object-cover rounded-2xl shadow-lg mb-6"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Severity</p>
                      <p className={`text-lg font-bold capitalize px-3 py-1 rounded-xl ${getSeverityColor(claim.reportId.prediction?.severity)}`}>
                        {claim.reportId.prediction?.severity || 'N/A'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Confidence</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {claim.reportId.prediction?.confidence
                          ? `${(claim.reportId.prediction.confidence).toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Est. Cost</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {claim.reportId.reportUrl && (
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
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
                </div>
              )}

              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Driver Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{claim.driverId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="text-gray-900 dark:text-white">{claim.driverId?.email || 'N/A'}</p>
                    </div>
                    {claim.driverId?.phone && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                        <p className="text-gray-900 dark:text-white">{claim.driverId.phone}</p>
                      </div>
                    )}
                    {claim.driverId?.vehicleNumber && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vehicle Number</p>
                        <p className="text-gray-900 dark:text-white">{claim.driverId.vehicleNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {claim.reportId?.location && (
                  <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Accident Location</h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">{claim.reportId.location.address || 'N/A'}</p>
                  </div>
                )}

                {claim.reportId?.verification && (
                  <div className="p-6 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Traffic Verification</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold capitalize text-yellow-700 dark:text-yellow-300">
                        Status: {claim.reportId.verification.status}
                      </p>
                      {claim.reportId.verification.remarks && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {claim.reportId.verification.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {claim.status === 'in_review' && (
              <div className="card rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
                <ChatWindow claimId={id} />
              </div>
            )}
          </div>

          <div className="space-y-8 lg:sticky lg:top-8 lg:h-fit">
            {claim.status === 'in_review' && (
              <div className="card rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Claim</h2>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Remarks *
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="input-field rounded-2xl border-white/20 bg-white/5 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200 text-white placeholder-gray-400"
                    rows={6}
                    placeholder="Provide detailed remarks about your decision..."
                    required
                  />
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading || !remarks.trim()}
                    className="w-full btn-primary rounded-2xl flex items-center justify-center space-x-3 py-4 font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    <span>Approve Claim</span>
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !remarks.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 hover:shadow-lg transform hover:scale-105"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span>Reject Claim</span>
                  </button>
                </div>
              </div>
            )}

            {claim.status === 'approved' && (
              <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settle Claim</h2>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  This claim has been approved and is ready for settlement. Process the final payment to complete the claim.
                </p>

                <button
                  onClick={() => setShowSettlementModal(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 hover:shadow-lg transform hover:scale-105"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Process Settlement</span>
                </button>
              </div>
            )}

            {claim.status === 'settled' && claim.settlementInfo && (
              <div className="card rounded-3xl p-8 border border-green-500/20 bg-green-500/10 backdrop-blur-xl shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">Claim Settled</h2>
                    <p className="text-sm text-green-600 dark:text-green-400">Payment processed successfully</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Settlement Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${claim.settlementInfo.amount?.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {claim.settlementInfo.method?.replace('_', ' ')}
                    </p>
                  </div>

                  {claim.settlementInfo.reference && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reference</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">
                        {claim.settlementInfo.reference}
                      </p>
                    </div>
                  )}

                  {claim.settlementInfo.notes && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {claim.settlementInfo.notes}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Settled At</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(claim.settlementInfo.settledAt), 'PPp')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="card rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claim Information</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Claim ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{claim._id}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {format(new Date(claim.createdAt), 'PPp')}
                  </p>
                </div>

                {claim.remarks && (
                  <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 backdrop-blur-sm">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">Previous Remarks</p>
                    <p className="text-yellow-600 dark:text-yellow-400">{claim.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SettlementModal
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        claim={claim}
        onSettled={handleSettled}
      />
    </div>
  );
};

export default AgentClaimDetails;