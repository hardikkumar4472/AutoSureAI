import { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  User, 
  Trash2, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Users as UsersIcon,
  ChevronRight,
  MoreVertical,
  Activity,
  UserCheck
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/user/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      case 'agent':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
      case 'traffic':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
      case 'driver':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-400 animate-pulse">Synchronizing user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Directory</span>
          </h1>
          <p className="text-gray-400">Manage access and account roles across the platform</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all group"
            title="Reload Directory"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <UsersIcon className="w-4 h-4" />
            <span className="text-sm font-bold">{users.length} Total</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, or system ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all min-w-[160px]"
              >
                <option value="all" className="bg-slate-900">All Platforms</option>
                <option value="driver" className="bg-slate-900">Drivers</option>
                <option value="agent" className="bg-slate-900">Insurance Agents</option>
                <option value="traffic" className="bg-slate-900">Traffic Officers</option>
                <option value="admin" className="bg-slate-900">System Admins</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
                <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Access Role</th>
                <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Channel Details</th>
                <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Engagement</th>
                <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Registry Date</th>
                <th className="py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-all duration-300 group">
                    <td className="py-5 px-8">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {user.name?.charAt(0) || <User className="w-6 h-6" />}
                          </div>
                          {user.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                              <Shield className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{user.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: {user._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getRoleStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                          <Mail className="w-3.5 h-3.5 mr-2 text-indigo-400/50" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                            <Phone className="w-3.5 h-3.5 mr-2 text-purple-400/50" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex flex-col items-center">
                        <div className={`px-4 py-1.5 rounded-2xl flex items-center space-x-2 ${user.claimCount > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-gray-500'}`}>
                          <Activity className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{user.claimCount || 0} Claims</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                        <span>{user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Pre-Launch'}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                          title="Purge User Data"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 text-gray-600 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-10 h-10 text-gray-700" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-400">No Match Found</h3>
                      <p className="text-gray-600 max-w-xs mx-auto text-sm">We couldn't find any users matching your current search parameters or filters.</p>
                      <button 
                        onClick={() => {setSearchTerm(''); setRoleFilter('all');}}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-sm"
                      >
                        Reset All Filters
                      </button>
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

export default Users;
