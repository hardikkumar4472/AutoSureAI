import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, XCircle, FileText, TrendingUp, Users, AlertTriangle, DollarSign, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); 
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);
  const { socket } = useSocket();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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


  const getFilteredAndSortedClaims = () => {
    let result = claims;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      const scoredClaims = claims.map(claim => {
        const driverName = (claim.driverId?.name || '').toLowerCase();
        const driverEmail = (claim.driverId?.email || '').toLowerCase();

        let score = 0;

        if (driverName === query || driverEmail === query) {
          score = 1000;
        }
        else if (driverName.startsWith(query) || driverEmail.startsWith(query)) {
          score = 500;
        }
        else if (driverName.includes(query) || driverEmail.includes(query)) {
          score = 100;
        }
        else {
          const nameWords = driverName.split(' ');
          const emailParts = driverEmail.split('@')[0].split('.');

          for (const word of [...nameWords, ...emailParts]) {
            if (word.startsWith(query)) {
              score = 50;
              break;
            }
          }
        }

        return { claim, score };
      });

      result = scoredClaims
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.claim);
    }

    const sortedResult = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'latest':

          return new Date(b.createdAt) - new Date(a.createdAt);

        case 'oldest':

          return new Date(a.createdAt) - new Date(b.createdAt);

        case 'highest':
      
          return (b.estimatedCost || 0) - (a.estimatedCost || 0);

        case 'lowest':
    
          return (a.estimatedCost || 0) - (b.estimatedCost || 0);

        default:
          return 0;
      }
    });

    return sortedResult;
  };

  const filteredClaims = getFilteredAndSortedClaims();

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'in_review' || c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    totalAmount: claims.filter(c => c.status === 'approved').reduce((sum, claim) => sum + (claim.estimatedCost || 0), 0),
    totalRejectedAmount: claims.filter(c => c.status === 'rejected').reduce((sum, claim) => sum + (claim.estimatedCost || 0), 0)
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700/50 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 backdrop-blur-sm`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        { }
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
              Agent Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
              Manage and review all insurance claims efficiently
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-white/10 dark:bg-white/5 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-sm">
            <Users className="w-4 h-4" />
            <span>Welcome back, Agent</span>
          </div>
        </div>

        { }
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

        { }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.approved > 0 && (
            <div className="card p-6 border border-green-500/20 bg-green-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
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

          {stats.rejected > 0 && (
            <div className="card p-6 border border-red-500/20 bg-red-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Rejected Amount</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      ${stats.totalRejectedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400 transform rotate-180" />
              </div>
            </div>
          )}
        </div>

        { }
        <div className="card p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Claims</h2>
              {searchQuery && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredClaims.length} of {claims.length} results)
                </span>
              )}
            </div>

            {claims.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-2xl">
                <div className="relative sm:w-56" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full flex items-center justify-between pl-4 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:bg-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <ArrowUpDown className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">
                        {sortBy === 'latest' && 'Latest First'}
                        {sortBy === 'oldest' && 'Oldest First'}
                        {sortBy === 'highest' && 'Highest Cost'}
                        {sortBy === 'lowest' && 'Lowest Cost'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isSortOpen ? 'transform rotate-180' : ''}`} />
                  </button>

                  <div className={`absolute z-10 mt-2 w-full bg-white/10 dark:bg-black/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-200 origin-top backdrop-blur-xl ${isSortOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="p-1 space-y-1">
                      {[
                        { value: 'latest', label: 'Latest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'highest', label: 'Highest Cost' },
                        { value: 'lowest', label: 'Lowest Cost' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${sortBy === option.value
                            ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/10'
                            }`}
                        >
                          <span>{option.label}</span>
                          {sortBy === option.value && (
                            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by driver name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Claims Assigned</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                You don't have any assigned claims yet. New claims will appear here automatically when assigned to you.
              </p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                No claims match your search for "{searchQuery}". Try a different search term.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Driver</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Severity</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Est. Cost</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned To</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Report</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr
                      key={claim._id}
                      className="border-b border-white/10 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200"
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {claim.assignedAgent?.name || 'Unassigned'}
                        </p>
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
