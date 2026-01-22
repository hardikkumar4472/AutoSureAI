import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ArrowLeft, 
  Search, 
  Filter,
  UserPlus,
  BadgeCheck,
  MoreVertical,
  Mail,
  Phone,
  User
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminTraffic = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    badgeNumber: '',
    department: '',
  });

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await api.get('/admin/traffic');
      setOfficers(response.data.officers || []);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast.error('Failed to load traffic officers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-traffic', formData);
      toast.success('Traffic officer created successfully!');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', badgeNumber: '', department: '' });
      fetchOfficers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create traffic officer');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/traffic/${editingOfficer._id}`, formData);
      toast.success('Traffic officer updated successfully!');
      setShowModal(false);
      setEditingOfficer(null);
      setFormData({ name: '', email: '', phone: '', badgeNumber: '', department: '' });
      fetchOfficers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update traffic officer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this traffic officer?')) return;
    
    try {
      await api.delete(`/admin/traffic/${id}`);
      toast.success('Traffic officer deleted successfully!');
      fetchOfficers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete traffic officer');
    }
  };

  const openEditModal = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      name: officer.name || '',
      email: officer.email || '',
      phone: officer.phone || '',
      badgeNumber: officer.badgeNumber || '',
      department: officer.department || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOfficer(null);
    setFormData({ name: '', email: '', phone: '', badgeNumber: '', department: '' });
  };

  const filteredOfficers = officers.filter(officer =>
    officer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.badgeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const OfficerCard = ({ officer }) => (
    <div className="rounded-lg p-6 border border-white/20 bg-white/10 backdrop-blur-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-white">{officer.name}</h3>
              {officer.badgeNumber && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  {officer.badgeNumber}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{officer.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{officer.phone || 'Not provided'}</span>
              </div>
              {officer.department && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{officer.department}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-0">
          <button
            onClick={() => openEditModal(officer)}
            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Edit officer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(officer._id)}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Delete officer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Joined {new Date(officer.createdAt).toLocaleDateString()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            officer.status === 'active' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-white/10 text-gray-300 border border-white/20'
          }`}>
            {officer.status || 'active'}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading traffic officers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="group w-10 h-10 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </Link>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-yellow-500/30">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Traffic Officers
                </h1>
                <p className="text-lg text-gray-300 font-light">
                  Manage traffic police officers and verification workflows
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-yellow-400 bg-white/5 px-4 py-2 rounded-2xl border border-yellow-500/20 backdrop-blur-sm">
            <Shield className="w-4 h-4" />
            <span>Officer Management</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl p-6 border border-yellow-500/20 bg-yellow-500/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-400">Total Officers</p>
                <p className="text-3xl font-bold text-yellow-300">{officers.length}</p>
              </div>
              <Shield className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-green-500/20 bg-green-500/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-400">Active</p>
                <p className="text-3xl font-bold text-green-300">{officers.length}</p>
              </div>
              <BadgeCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-blue-500/20 bg-blue-500/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-400">This Month</p>
                <p className="text-3xl font-bold text-blue-300">+0</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-2xl p-6 border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-yellow-500/50 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 border border-yellow-500/30">
                <UserPlus className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="font-semibold text-white">Add New Officer</p>
              <p className="text-sm text-gray-400 mt-1">Create new account</p>
            </div>
          </button>
        </div>

        <div className="rounded-3xl p-6 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search officers by name, email, or badge number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-400 transition-all duration-300"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-300">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-300">
                <span className="text-sm font-medium">Sort</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Traffic Officers ({filteredOfficers.length})
            </h2>
            <p className="text-sm text-gray-300">
              Showing {filteredOfficers.length} of {officers.length} officers
            </p>
          </div>

          {filteredOfficers.length === 0 ? (
            <div className="rounded-3xl p-12 text-center border border-white/20 bg-white/10 backdrop-blur-xl">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No officers found' : 'No traffic officers'}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'No traffic officers match your search criteria. Try adjusting your search terms.'
                  : 'Get started by creating your first traffic officer account to manage accident verifications.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto rounded-2xl px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white shadow-lg"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Create First Officer</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOfficers.map((officer) => (
                <OfficerCard key={officer._id} officer={officer} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                <UserPlus className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {editingOfficer ? 'Edit Traffic Officer' : 'Create Traffic Officer'}
              </h2>
            </div>
            
            <form onSubmit={editingOfficer ? handleUpdate : handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-4 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-500 transition-all duration-300"
                  placeholder="Enter officer's full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-4 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-500 transition-all duration-300"
                  placeholder="officer@department.gov"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-4 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    className="w-full pl-4 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="BADGE-001"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-4 pr-4 py-3 rounded-2xl border border-white/20 bg-white/5 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-500 transition-all duration-300"
                  placeholder="Traffic Division"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary rounded-2xl py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 transform hover:scale-105 transition-all duration-300"
                >
                  {editingOfficer ? 'Update Officer' : 'Create Officer'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-secondary rounded-2xl py-4 border border-white/20 text-gray-300 hover:bg-white/5 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTraffic;  