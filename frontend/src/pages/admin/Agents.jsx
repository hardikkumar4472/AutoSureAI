import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Shield, TrendingUp, UserCheck } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

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
          ? Math.random() > 0.7 ? '#059669' : '#10b981' 
          : Math.random() > 0.7 ? '#047857' : '#059669';
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
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/admin/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-agent', formData);
      toast.success('Agent created successfully!');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create agent');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/agent/${editingAgent._id}`, formData);
      toast.success('Agent updated successfully!');
      setShowModal(false);
      setEditingAgent(null);
      setFormData({ name: '', email: '', phone: '' });
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update agent');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      await api.delete(`/admin/agent/${id}`);
      toast.success('Agent deleted successfully!');
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete agent');
    }
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgent(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="rounded-2xl p-6 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-white">{value}</p>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 backdrop-blur-sm border border-white/10`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading agents...</p>
        </div>
      </div>
    );
  }

  const totalClaims = agents.reduce((sum, agent) => sum + (agent.currentLoad || 0), 0);
  const avgLoad = agents.length > 0 ? Math.round(totalClaims / agents.length) : 0;

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">
                  Manage Insurance Agents
                </h1>
                <p className="text-lg text-gray-300 font-light">
                  Create and manage insurance agent accounts and assignments
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary rounded-2xl px-6 py-3 flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Agent</span>
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Agents"
            value={agents.length}
            icon={Users}
            color="text-green-400"
            description="Active insurance agents"
          />
          <StatCard
            title="Total Claims"
            value={totalClaims}
            icon={Shield}
            color="text-blue-400"
            description="Across all agents"
          />
          <StatCard
            title="Average Load"
            value={avgLoad}
            icon={TrendingUp}
            color="text-purple-400"
            description="Claims per agent"
          />
          <StatCard
            title="Available"
            value={agents.filter(a => (a.currentLoad || 0) < 10).length}
            icon={UserCheck}
            color="text-green-400"
            description="Agents with low load"
          />
        </div>

        {}
        <div className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Insurance Agents</h2>
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Agents Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Get started by creating your first insurance agent to handle claims and customer support.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Agent Details</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Workload</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-white text-lg">{agent.name}</p>
                          <p className="text-sm text-gray-400">ID: {agent._id.slice(-8)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-white">{agent.email}</p>
                          <p className="text-sm text-gray-400">{agent.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((agent.currentLoad || 0) * 10, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${
                            (agent.currentLoad || 0) > 15 ? 'text-red-600' :
                            (agent.currentLoad || 0) > 8 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {agent.currentLoad || 0} claims
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-2xl text-xs font-semibold ${
                          (agent.currentLoad || 0) > 15 ? 'bg-red-100 text-red-800 border border-red-200' :
                          (agent.currentLoad || 0) > 8 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {(agent.currentLoad || 0) > 15 ? 'Heavy Load' :
                           (agent.currentLoad || 0) > 8 ? 'Moderate Load' : 'Available'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(agent)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:shadow-lg"
                            title="Edit Agent"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent._id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:shadow-lg"
                            title="Delete Agent"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">
                  {editingAgent ? 'Edit Agent' : 'Create New Agent'}
                </h2>
              </div>

              <form onSubmit={editingAgent ? handleUpdate : handleCreate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field rounded-2xl border-white/20 bg-white/5 text-white focus:border-green-500 focus:ring-green-500 transition-all duration-200 placeholder-gray-500"
                    placeholder="Enter agent's full name"
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
                    className="input-field rounded-2xl border-white/20 bg-white/5 text-white focus:border-green-500 focus:ring-green-500 transition-all duration-200 placeholder-gray-500"
                    placeholder="Enter agent's email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field rounded-2xl border-white/20 bg-white/5 text-white focus:border-green-500 focus:ring-green-500 transition-all duration-200 placeholder-gray-500"
                    placeholder="Enter agent's phone number"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 btn-primary rounded-2xl py-3 font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    {editingAgent ? 'Update Agent' : 'Create Agent'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 btn-secondary rounded-2xl py-3 font-semibold transition-all duration-200 hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgents;