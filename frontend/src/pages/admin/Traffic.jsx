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
    <div className="card rounded-lg p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{officer.name}</h3>
              {officer.badgeNumber && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  {officer.badgeNumber}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{officer.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{officer.phone || 'Not provided'}</span>
              </div>
              {officer.department && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
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
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Edit officer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(officer._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Delete officer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Joined {new Date(officer.createdAt).toLocaleDateString()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            officer.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {officer.status || 'active'}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading traffic officers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="group w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400" />
              </Link>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-yellow-700 dark:from-white dark:to-yellow-400 bg-clip-text text-transparent">
                  Traffic Officers
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Manage traffic police officers and verification workflows
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-yellow-200 dark:border-yellow-800">
            <Shield className="w-4 h-4" />
            <span>Officer Management</span>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Total Officers</p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{officers.length}</p>
              </div>
              <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="card rounded-2xl p-6 border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{officers.length}</p>
              </div>
              <BadgeCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="card rounded-2xl p-6 border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">This Month</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">+0</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="card rounded-2xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-yellow-400 dark:hover:border-yellow-600 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">Add New Officer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create new account</p>
            </div>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="card rounded-3xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search officers by name, email, or badge number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 transition-all duration-300"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-300">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-300">
                <span className="text-sm font-medium">Sort</span>
              </button>
            </div>
          </div>
        </div>

        {/* Officers Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Traffic Officers ({filteredOfficers.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredOfficers.length} of {officers.length} officers
            </p>
          </div>

          {filteredOfficers.length === 0 ? (
            <div className="card rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No officers found' : 'No traffic officers'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'No traffic officers match your search criteria. Try adjusting your search terms.'
                  : 'Get started by creating your first traffic officer account to manage accident verifications.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto rounded-2xl px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingOfficer ? 'Edit Traffic Officer' : 'Create Traffic Officer'}
              </h2>
            </div>
            
            <form onSubmit={editingOfficer ? handleUpdate : handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field rounded-2xl px-4 py-3 border-2 border-gray-200 dark:border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 transition-all duration-300"
                  placeholder="Enter officer's full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field rounded-2xl px-4 py-3 border-2 border-gray-200 dark:border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 transition-all duration-300"
                  placeholder="officer@department.gov"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field rounded-2xl px-4 py-3 border-2 border-gray-200 dark:border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 transition-all duration-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    className="input-field rounded-2xl px-4 py-3 border-2 border-gray-200 dark:border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 transition-all duration-300"
                    placeholder="BADGE-001"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field rounded-2xl px-4 py-3 border-2 border-gray-200 dark:border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 transition-all duration-300"
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
                  className="flex-1 btn-secondary rounded-2xl py-4 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
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