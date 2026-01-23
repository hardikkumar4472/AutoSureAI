import { useEffect, useState } from 'react';
import { Search, Trash2, Users, Shield, TrendingUp, UserCheck, Star, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentsRes, usersRes] = await Promise.all([
        api.get('/admin/agents'),
        api.get('/admin/users')
      ]);
      setAgents(agentsRes.data.agents || []);
      setAllUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, field, value) => {
    try {
      await api.put(`/admin/user/${userId}/role`, { [field]: value, role: field === 'isAgent' && value ? 'agent' : field === 'isTraffic' && value ? 'traffic' : field === 'isAdmin' && value ? 'admin' : 'driver' });
      toast.success('Role updated successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this agent?')) return;
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="rounded-2xl p-6 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 backdrop-blur-sm border border-gray-200 dark:border-white/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const filteredUsers = searchTerm ? allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
      </div>
    );
  }

  const totalClaims = agents.reduce((sum, agent) => sum + (agent.claimCount || 0), 0);
  const avgLoad = agents.length > 0 ? Math.round(totalClaims / agents.length) : 0;

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-green-600 dark:from-white dark:to-green-400">
                  Manage Insurance Agents
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Search and promote users to insurance agent roles
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <div className="relative group">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearching(true)}
                className="w-full pl-12 pr-10 py-4 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm"
                placeholder="Search user by name, email or ID to add..."
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearching && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Matched Users</span>
                  <button onClick={() => setIsSearching(false)} className="text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">ESC</button>
                </div>
                {filteredUsers.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[400px] overflow-y-auto">
                    {filteredUsers.map(user => (
                      <div key={user._id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                              {user.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleRole(user._id, 'isAgent', !user.isAgent)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                user.isAgent 
                                  ? 'bg-green-100 text-green-700 border-green-200 border shadow-sm' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {user.isAgent ? '✓ Agent' : '+ Agent'}
                            </button>
                            <button
                              onClick={() => handleToggleRole(user._id, 'isTraffic', !user.isTraffic)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                user.isTraffic 
                                  ? 'bg-blue-100 text-blue-700 border-blue-200 border' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              {user.isTraffic ? '✓ Traffic' : '+ Traffic'}
                            </button>
                            <button
                              onClick={() => handleToggleRole(user._id, 'isAdmin', !user.isAdmin)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                user.isAdmin 
                                  ? 'bg-purple-100 text-purple-700 border-purple-200 border' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              {user.isAdmin ? '✓ Admin' : '+ Admin'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm italic">No users found matching "{searchTerm}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Agents"
            value={agents.length}
            icon={Users}
            color="text-green-500"
            description="Active insurance agents"
          />
          <StatCard
            title="Total Claims"
            value={totalClaims}
            icon={Shield}
            color="text-blue-500"
            description="Across all agents"
          />
          <StatCard
            title="Average Load"
            value={avgLoad}
            icon={TrendingUp}
            color="text-purple-500"
            description="Claims per agent"
          />
          <StatCard
            title="Available"
            value={agents.filter(a => (a.claimCount || 0) < 10).length}
            icon={UserCheck}
            color="text-emerald-500"
            description="Agents with low load"
          />
        </div>

        {/* Current Agents Table */}
        <div className="rounded-3xl p-8 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Insurance Agents</h2>
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl">
              <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Active Agents</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto italic">
                Use the search bar above to find users and assign them the agent role.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Agent</th>
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Workload</th>
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Roles</th>
                    <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {agents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 font-bold">
                              {agent.name?.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-gray-900 dark:text-white">{agent.name}</p>
                             <p className="text-xs text-gray-500 font-medium">{agent.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 min-w-[100px]">
                            <div 
                              className="bg-green-500 h-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-500"
                              style={{ width: `${Math.min((agent.claimCount || 0) * 10, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-16">
                            {agent.claimCount || 0} claims
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">AGENT</span>
                          {agent.isAdmin && <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200">ADMIN</span>}
                          {agent.isTraffic && <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">TRAFFIC</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-2">
                           <button
                            onClick={() => handleToggleRole(agent._id, 'isAgent', false)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                            title="Remove Agent Role"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
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

export default AdminAgents;