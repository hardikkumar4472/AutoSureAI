import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Upload, FileText, Shield, MapPin, User, Calendar, AlertTriangle, Siren } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TrafficReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState({
    status: 'verified',
    remarks: '',
  });
  const [firData, setFirData] = useState({
    firNumber: '',
    policeStation: '',
    firDocument: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

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
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      const response = await api.get(`/traffic/reports/${id}`);
      setReport(response.data.report);
      if (response.data.report.verification) {
        setVerificationData({
          status: response.data.report.verification.status || 'verified',
          remarks: response.data.report.verification.remarks || '',
        });
      }
      if (response.data.report.trafficVerification) {
        setFirData({
          firNumber: response.data.report.trafficVerification.firNumber || '',
          policeStation: response.data.report.trafficVerification.policeStation || '',
          firDocument: null,
        });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await api.post(`/traffic/reports/${id}/verify`, verificationData);
      toast.success('Report verified successfully!');
      fetchReportDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFIRSubmit = async (e) => {
    e.preventDefault();
    if (!firData.firNumber || !firData.policeStation) {
      toast.error('Please fill all FIR fields');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('firNumber', firData.firNumber);
      formData.append('policeStation', firData.policeStation);
      if (firData.firDocument) {
        formData.append('firDocument', firData.firDocument);
      }

      await api.post(`/traffic-evidence/accident/${id}/fir`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('FIR details added successfully!');
      fetchReportDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add FIR details');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'fraudulent':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'unverified':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Report Not Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The requested accident report could not be found.</p>
          <button 
            onClick={() => navigate('/traffic')} 
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/traffic')}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="text-right">
            <span className={`px-4 py-2 rounded-2xl text-sm font-semibold capitalize ${getStatusColor(report.verification?.status || 'unverified')}`}>
              {report.verification?.status || 'unverified'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-8">
            {}
            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accident Report Details</h1>
                </div>
              </div>

              {}
              <div className="mb-8">
                <img
                  src={report.imageUrl}
                  alt="Accident scene"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg mb-6"
                />

                {}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Severity Level</p>
                    <p className={`text-lg font-bold capitalize px-3 py-1 rounded-xl ${getSeverityColor(report.prediction?.severity)}`}>
                      {report.prediction?.severity || 'Unknown'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">AI Confidence</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {report.prediction?.confidence
                        ? `${(report.prediction.confidence ).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Est. Damage</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${report.repair_cost?.estimated_cost?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>

                {}
                {report.reportUrl && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Accident Report Document</h3>
                      </div>
                      <a
                        href={report.reportUrl}
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

              {}
              <div className="space-y-6">
                {}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Driver Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{report.userId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Email</p>
                      <p className="text-gray-900 dark:text-white">{report.userId?.email || 'N/A'}</p>
                    </div>
                    {report.userId?.phone && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                        <p className="text-gray-900 dark:text-white">{report.userId.phone}</p>
                      </div>
                    )}
                    {report.userId?.vehicleNumber && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vehicle Registration</p>
                        <p className="text-gray-900 dark:text-white font-mono">{report.userId.vehicleNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {}
                {report.location && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Accident Location</h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 mb-2">{report.location.address || 'N/A'}</p>
                    {report.location.lat && report.location.lon && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        GPS Coordinates: {report.location.lat}, {report.location.lon}
                      </p>
                    )}
                  </div>
                )}

                {}
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Timeline</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Reported:</strong> {format(new Date(report.createdAt), 'PPp')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Status:</strong> {report.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="space-y-8">
            {}
            {report.verification?.status === 'unverified' && (
              <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Police Verification</h2>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Verification Status
                  </label>
                  <select
                    value={verificationData.status}
                    onChange={(e) => setVerificationData({ ...verificationData, status: e.target.value })}
                    className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="verified"> Verified Incident</option>
                    <option value="fraudulent"> Fraudulent Report</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Police Remarks
                  </label>
                  <textarea
                    value={verificationData.remarks}
                    onChange={(e) => setVerificationData({ ...verificationData, remarks: e.target.value })}
                    className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    rows={5}
                    placeholder="Enter detailed police remarks and observations..."
                    required
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={actionLoading || !verificationData.remarks.trim()}
                  className={`w-full rounded-2xl flex items-center justify-center space-x-3 py-4 font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                    verificationData.status === 'verified' 
                      ? 'btn-primary' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : verificationData.status === 'verified' ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Verify as Genuine</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Mark as Fraudulent</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {}
            {report.verification?.status !== 'unverified' && (
              <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Status</h2>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-700 dark:text-green-300 text-lg mb-2 capitalize">
                    {report.verification.status}
                  </p>
                  {report.verification.remarks && (
                    <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                      {report.verification.remarks}
                    </p>
                  )}
                  {report.verification.verifiedAt && (
                    <p className="text-xs text-green-500 dark:text-green-300">
                      Verified at: {format(new Date(report.verification.verifiedAt), 'PPp')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {}
            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Siren className="w-5 h-5 mr-2" />
                  FIR Registration
                </h2>
              </div>

              {report.trafficVerification?.firNumber ? (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">FIR Number</p>
                    <p className="font-bold text-red-700 dark:text-red-300 text-lg">{report.trafficVerification.firNumber}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Police Station</p>
                    <p className="font-semibold text-red-700 dark:text-red-300">{report.trafficVerification.policeStation}</p>
                  </div>
                  {report.trafficVerification.firDocumentUrl && (
                    <div className="text-center">
                      <a
                        href={report.trafficVerification.firDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary rounded-2xl px-4 py-2 text-sm inline-flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View FIR Document</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleFIRSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      FIR Number *
                    </label>
                    <input
                      type="text"
                      value={firData.firNumber}
                      onChange={(e) => setFirData({ ...firData, firNumber: e.target.value })}
                      className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                      placeholder="Enter official FIR number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Police Station *
                    </label>
                    <input
                      type="text"
                      value={firData.policeStation}
                      onChange={(e) => setFirData({ ...firData, policeStation: e.target.value })}
                      className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                      placeholder="Enter police station name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      FIR Document (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFirData({ ...firData, firDocument: e.target.files[0] })}
                      className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Upload scanned FIR document (PDF, JPG, PNG)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 hover:shadow-lg transform hover:scale-105"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Register FIR</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficReportDetails;