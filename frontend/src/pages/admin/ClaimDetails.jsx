import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, MapPin, AlertTriangle, DollarSign, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import SettlementModal from '../../components/SettlementModal';
import toast from 'react-hot-toast';

const AdminClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const fetchClaimDetails = async () => {
    try {
      const response = await api.get(`/admin/claim/${id}`);
      setClaim(response.data.claim);
    } catch (error) {
      console.error('Error fetching claim:', error);
      toast.error('Failed to load claim details');
    } finally {
      setLoading(false);
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
      case 'settled':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Claim Not Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The requested claim could not be found.</p>
          <button
            onClick={() => navigate('/admin/claims')}
            className="btn-primary rounded-2xl px-6 py-3 inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Claims</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/admin/claims')}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Claims</span>
          </button>

          <div className="text-right">
            <span className={`px-4 py-2 rounded-2xl text-sm font-semibold capitalize ${getStatusColor(claim.status)}`}>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Severity</p>
                      <p className={`text-lg font-bold capitalize px-3 py-1 rounded-xl ${getSeverityColor(claim.reportId.prediction?.severity)}`}>
                        {claim.reportId.prediction?.severity || 'N/A'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Confidence</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {claim.reportId.prediction?.confidence
                          ? `${(claim.reportId.prediction.confidence).toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Est. Cost</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {claim.reportId.reportUrl && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
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
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
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

                {claim.assignedAgent && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Assigned Agent</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Name</p>
                        <p className="font-semibold text-blue-800 dark:text-blue-200">{claim.assignedAgent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Email</p>
                        <p className="text-blue-700 dark:text-blue-300">{claim.assignedAgent.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {claim.reportId?.location && (
                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Accident Location</h3>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300">{claim.reportId.location.address || 'N/A'}</p>
                  </div>
                )}

                {claim.remarks && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Agent Remarks</h3>
                    <p className="text-gray-700 dark:text-gray-300">{claim.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-8 lg:h-fit">
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
              <div className="card rounded-3xl p-8 border border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">Claim Settled</h2>
                    <p className="text-sm text-green-600 dark:text-green-400">Payment processed successfully</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Settlement Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${claim.settlementInfo.amount?.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {claim.settlementInfo.method?.replace('_', ' ')}
                    </p>
                  </div>

                  {claim.settlementInfo.reference && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reference</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">
                        {claim.settlementInfo.reference}
                      </p>
                    </div>
                  )}

                  {claim.settlementInfo.notes && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {claim.settlementInfo.notes}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Settled At</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(claim.settlementInfo.settledAt), 'PPp')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claim Information</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Claim ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{claim._id}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {format(new Date(claim.createdAt), 'PPp')}
                  </p>
                </div>
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

export default AdminClaimDetails;
