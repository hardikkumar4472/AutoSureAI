import { useEffect, useState } from 'react';
import { RefreshCw, Users, FileText, Shield, ClipboardList, UserCheck, ArrowRight, Search, Filter } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [newAgentId, setNewAgentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentsRes, claimsRes] = await Promise.all([
        api.get('/admin/agents'),
        api.get('/admin/claims'),
      ]);
      setAgents(agentsRes.data.agents || []);
      setClaims(claimsRes.data.claims || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load claims data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedClaimId && claims.length > 0) {
      setSelectedClaimId(claims[0]._id);
    }
  }, [claims, selectedClaimId]);

  const activeClaim = claims.find((claim) => claim._id === selectedClaimId) || null;

  const handleReassign = async () => {
    if (!selectedClaimId || !newAgentId) {
      toast.error('Please select a claim and new agent');
      return;
    }

    try {
      await api.put(`/admin/claim/${selectedClaimId}/reassign`, {
        newAgentId,
      });
      toast.success('Claim reassigned successfully!');
      setSelectedClaimId('');
      setNewAgentId('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reassign claim');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'settled':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
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

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = searchTerm === '' || 
      claim.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.assignedAgent?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending' || c.status === 'in_review').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    unassigned: claims.filter(c => !c.assignedAgent).length,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading claims management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-purple-700 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
                  Claims Management
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Oversee and manage all insurance claims across the system
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="btn-primary rounded-2xl px-6 py-3 flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Total Claims"
            value={stats.total}
            icon={ClipboardList}
            color="text-purple-600 dark:text-purple-400"
            description="All insurance claims"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Shield}
            color="text-yellow-600 dark:text-yellow-400"
            description="Awaiting processing"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={UserCheck}
            color="text-green-600 dark:text-green-400"
            description="Successfully processed"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={FileText}
            color="text-red-600 dark:text-red-400"
            description="Not approved"
          />
          {/* <StatCard
            title="Unassigned"
            value={stats.unassigned}
            icon={Users}
            color="text-blue-600 dark:text-blue-400"
            description="Need agent assignment"
          /> */}
        </div>

        {}
        <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claim Reassignment</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Claim to Reassign
                </label>
                <select
                  value={selectedClaimId}
                  onChange={(e) => setSelectedClaimId(e.target.value)}
                  className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">Choose a claim...</option>
                  {claims.map((claim) => (
                    <option key={claim._id} value={claim._id}>
                      #{claim._id.slice(-6).toUpperCase()} • {claim.driverId?.name || 'No driver'} • {claim.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select New Agent
                </label>
                <select
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                  className="input-field rounded-2xl border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">Select an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} • {agent.currentLoad || 0} active claims
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleReassign}
                disabled={!selectedClaimId || !newAgentId}
                className="w-full btn-primary rounded-2xl py-4 font-semibold flex items-center justify-center space-x-3 disabled:opacity-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Reassign Claim to Selected Agent</span>
              </button>
            </div>

            {}
            {activeClaim && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Selected Claim Details</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Claim ID</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">{activeClaim._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-2xl text-xs font-semibold capitalize ${getStatusColor(activeClaim.status)}`}>
                        {activeClaim.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Driver Information</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{activeClaim.driverId?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{activeClaim.driverId?.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Agent</p>
                    {activeClaim.assignedAgent ? (
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{activeClaim.assignedAgent.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{activeClaim.assignedAgent.email}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Unassigned</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">{format(new Date(activeClaim.createdAt), 'PPp')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Claims</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {}
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="settled">Settled</option>
                </select>
              </div>
            </div>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Claims Found</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {claims.length === 0 
                  ? "No claims have been submitted yet. Claims will appear here once drivers report accidents."
                  : "No claims match your current search criteria. Try adjusting your filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Claim Details</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Driver</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Severity</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Agent</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Report</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr 
                      key={claim._id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            #{claim._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Est. Cost: ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{claim.driverId?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{claim.driverId?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize ${getSeverityColor(claim.reportId?.prediction?.severity)}`}>
                          {claim.reportId?.prediction?.severity || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-2xl text-xs font-semibold capitalize ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {claim.assignedAgent ? (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{claim.assignedAgent.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{claim.assignedAgent.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {claim.reportId?.reportUrl ? (
                          <a
                            href={claim.reportId.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredClaims.length} of {claims.length} claims
              {searchTerm && ` • Filtered by "${searchTerm}"`}
              {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClaims;