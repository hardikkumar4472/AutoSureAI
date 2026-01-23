import { useEffect, useState } from 'react';
import { Search, Shield, UserPlus, BadgeCheck, X, Mail, Phone, User, Star } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminTraffic = () => {
  const [officers, setOfficers] = useState([]);
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
      const [trafficRes, usersRes] = await Promise.all([
        api.get('/admin/traffic'),
        api.get('/admin/users')
      ]);
      // Assuming traffic endpoint returns users with isTraffic: true
      setOfficers(trafficRes.data.officers || []);
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
      // Find the user to get current roles
      const user = allUsers.find(u => u._id === userId);
      const roles = {
        isAdmin: field === 'isAdmin' ? value : user?.isAdmin,
        isAgent: field === 'isAgent' ? value : user?.isAgent,
        isTraffic: field === 'isTraffic' ? value : user?.isTraffic,
      };
      
      // Determine the primary 'role' string for compatibility
      let primaryRole = 'driver';
      if (roles.isAdmin) primaryRole = 'admin';
      else if (roles.isAgent) primaryRole = 'agent';
      else if (roles.isTraffic) primaryRole = 'traffic';

      await api.put(`/admin/user/${userId}/role`, { 
        [field]: value,
        role: primaryRole
      });
      
      toast.success('Permissions updated successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update roles');
    }
  };

  const filteredUsers = searchTerm ? allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
           <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-yellow-600 dark:from-white dark:to-yellow-400">
                  Traffic Officers
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Search and verify traffic police officer accounts
                </p>
              </div>
            </div>

            <div className="relative w-full max-w-md">
            <div className="relative group">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-yellow-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearching(true)}
                className="w-full pl-12 pr-10 py-4 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm"
                placeholder="Search user to promote to Traffic..."
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
                  <button onClick={() => setIsSearching(false)} className="text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">ESC</button>
                </div>
                {filteredUsers.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[400px] overflow-y-auto">
                    {filteredUsers.map(user => (
                      <div key={user._id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {user.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleRole(user._id, 'isTraffic', !user.isTraffic)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                user.isTraffic 
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200 border shadow-sm' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-yellow-300'
                              }`}
                            >
                              {user.isTraffic ? '✓ Traffic' : '+ Traffic'}
                            </button>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm italic">No users match "{searchTerm}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Officers Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Traffic Officers ({officers.length})</h2>
          </div>

          {officers.length === 0 ? (
             <div className="rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Officers Assigned</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Search for a user above and toggle the "Traffic" button to promote them to an officer role.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {officers.map((officer) => (
                <div key={officer._id} className="rounded-2xl p-6 border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => handleToggleRole(officer._id, 'isTraffic', false)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Remove Role"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{officer.name}</h3>
                      <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 font-bold tracking-wider uppercase">
                        <BadgeCheck className="w-3 h-3 mr-1" />
                        Verified Officer
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="truncate">{officer.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span>{officer.phone || 'Phone not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-[10px]">{officer._id}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Joined {new Date(officer.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                       {officer.isAdmin && <span className="bg-purple-500/10 text-purple-600 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-500/20">ADMIN</span>}
                       {officer.isAgent && <span className="bg-green-500/10 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded border border-green-500/20">AGENT</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTraffic;