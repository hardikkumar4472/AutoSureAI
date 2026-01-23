import { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Users, 
  FileText, 
  Shield, 
  ClipboardList, 
  UserCheck, 
  ArrowRight, 
  Search, 
  Filter, 
  Eye, 
  Trash2,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminClaims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [newAgentId, setNewAgentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleDeleteClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/claim/${claimId}`);
      toast.success('Claim deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete claim');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'in_review': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
      case 'settled': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'moderate': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'minor': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="rounded-3xl p-6 border border-white/20 bg-white/5 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-20 border border-white/10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <p className="text-[10px] text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-400 animate-pulse">Scanning claim records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Claims <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Management</span>
          </h1>
          <p className="text-gray-400">Oversee, reassign, and audit all insurance claims in the system</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all group"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm">
            <ClipboardList className="w-4 h-4" />
            <span>{claims.length} Records</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Pipeline" value={claims.filter(c => ['pending', 'in_review'].includes(c.status)).length} icon={Clock} color="bg-amber-500" description="Awaiting final decision" />
        <StatCard title="Approved" value={claims.filter(c => c.status === 'approved').length} icon={UserCheck} color="bg-green-500" description="Validated claims" />
        <StatCard title="Settled" value={claims.filter(c => c.status === 'settled').length} icon={Shield} color="bg-blue-500" description="Payouts completed" />
        <StatCard title="Resource Load" value={agents.length} icon={Users} color="bg-purple-500" description="Active insurance agents" />
      </div>

      {/* Reassignment Console */}
      <div className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-8 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <RefreshCw className="w-32 h-32 text-white" />
        </div>
        <div className="relative">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            <span>Intelligent Reassignment</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Select Vulnerable Claim</label>
                <select
                  value={selectedClaimId}
                  onChange={(e) => setSelectedClaimId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                >
                  <option value="" className="bg-slate-900">Choose a claim to rebalance...</option>
                  {claims.map((claim) => (
                    <option key={claim._id} value={claim._id} className="bg-slate-900">
                      ID: {claim._id.slice(-6).toUpperCase()} • {claim.driverId?.name || 'Unknown'} • {claim.status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Allocate to New Asset</label>
                <select
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                >
                  <option value="" className="bg-slate-900">Select target insurance agent...</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id} className="bg-slate-900">
                      {agent.name} • Load: {agent.currentLoad || 0} active claims
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleReassign}
                disabled={!selectedClaimId || !newAgentId}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-3 transform active:scale-95"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Execute Transfer</span>
              </button>
            </div>

            <div className="lg:col-span-7">
              {activeClaim ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-6 animate-in slide-in-from-right-10 duration-500">
                  <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shadow-inner bg-black/20 shrink-0">
                    {activeClaim.reportId?.imageUrl ? (
                      <img src={activeClaim.reportId.imageUrl} className="w-full h-full object-cover" alt="Evidence" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <FileText className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-white text-lg">Claim #{activeClaim._id.slice(-8).toUpperCase()}</h4>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getSeverityStyle(activeClaim.reportId?.prediction?.severity)}`}>
                        {activeClaim.reportId?.prediction?.severity || 'Assessment Pending'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">Origin User</p>
                        <p className="text-gray-200 font-medium">{activeClaim.driverId?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">Asset Status</p>
                        <p className={`font-bold ${activeClaim.status === 'approved' ? 'text-green-400' : 'text-amber-400'}`}>{activeClaim.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">Current Custodian</p>
                        <p className="text-indigo-400 font-medium">{activeClaim.assignedAgent?.name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">Est. Liability</p>
                        <p className="text-white font-black">${activeClaim.estimatedCost?.toLocaleString() || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[160px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-600">
                  <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Select a record to preview transition state</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Segment */}
      <div className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-3">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
            <span>Master Claim Ledger</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl justify-end">
            <div className="relative group flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer text-sm"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="pending" className="bg-slate-900">Pending</option>
                <option value="in_review" className="bg-slate-900">In Review</option>
                <option value="approved" className="bg-slate-900">Approved</option>
                <option value="rejected" className="bg-slate-900">Rejected</option>
                <option value="settled" className="bg-slate-900">Settled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="py-5 px-8 text-left">Incident Asset</th>
                <th className="py-5 px-8 text-left">Internal ID</th>
                <th className="py-5 px-8 text-left">Stakeholder</th>
                <th className="py-5 px-8 text-left">Risk Lvl</th>
                <th className="py-5 px-8 text-left text-center">Protocol Status</th>
                <th className="py-5 px-8 text-left">Custodian</th>
                <th className="py-5 px-8 text-center">Docs</th>
                <th className="py-5 px-8 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-white/5 transition-all duration-300 group">
                    <td className="py-5 px-8">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/20 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                        {claim.reportId?.imageUrl ? (
                          <img 
                            src={claim.reportId.imageUrl} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(claim.reportId.imageUrl, '_blank')}
                            alt="Incident"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div>
                        <p className="text-white font-black">#{claim._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">${claim.estimatedCost?.toLocaleString() || '0.00'}</p>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="max-w-[150px]">
                        <p className="text-sm font-bold text-gray-200 truncate">{claim.driverId?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500 font-mono tracking-tighter truncate">REG: {claim.driverId?._id?.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getSeverityStyle(claim.reportId?.prediction?.severity)}`}>
                        {claim.reportId?.prediction?.severity || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-center">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(claim.status)}`}>
                        {claim.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      {claim.assignedAgent ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                            <UserCheck className="w-3 h-3 text-indigo-400" />
                          </div>
                          <span className="text-xs font-bold text-indigo-400 truncate max-w-[100px]">{claim.assignedAgent.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest italic">Vacant</span>
                      )}
                    </td>
                    <td className="py-5 px-8 text-center">
                      {claim.reportId?.reportUrl ? (
                        <a href={claim.reportId.reportUrl} target="_blank" rel="noreferrer" className="p-2.5 text-purple-400 hover:text-white hover:bg-purple-400/20 rounded-xl transition-all inline-block">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <FileText className="w-4 h-4 text-gray-800 mx-auto" />
                      )}
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/admin/claims/${claim._id}`)}
                          className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClaim(claim._id)}
                          className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-32 text-center">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ClipboardList className="w-12 h-12 text-gray-700" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-300">No Ledger Entries</h3>
                      <p className="text-gray-600 max-w-sm mx-auto font-medium">We couldn't locate any claim records matching your current filter set or search criteria.</p>
                      <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="text-purple-400 hover:text-purple-300 font-black text-xs uppercase tracking-widest py-2 px-6 border border-purple-400/20 rounded-xl hover:bg-purple-400/5 transition-all mt-4">Reset Parameters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClaims;