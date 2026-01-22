import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, Users, Shield, ClipboardList, Bell } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminBroadcast = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    roles: [],
    priority: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const roles = [
    { value: 'driver', label: 'Drivers', icon: Users, color: 'text-blue-600', count: 1250},
    { value: 'agent', label: 'Insurance Agents', icon: ClipboardList, color: 'text-green-600', count: 45 },
    { value: 'traffic', label: 'Traffic Officers', icon: Shield, color: 'text-yellow-600', count: 89 },
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
  ];

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      roles: formData.roles.includes(role)
        ? formData.roles.filter(r => r !== role)
        : [...formData.roles, role],
    });
  };

  const handleMessageChange = (e) => {
    const message = e.target.value;
    setFormData({ ...formData, message });
    setCharacterCount(message.length);
  };

  const getSelectedRecipientsCount = () => {
    return roles.reduce((total, role) => {
      return formData.roles.includes(role.value) ? total + role.count : total;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.message || formData.roles.length === 0) {
      toast.error('Please fill all fields and select at least one recipient group');
      return;
    }

    if (formData.message.length < 10) {
      toast.error('Message should be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/broadcast/send', formData);
      toast.success(`Broadcast sent successfully`);
      setFormData({
        subject: '',
        message: '',
        roles: [],
        priority: 'normal',
      });
      setCharacterCount(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ role, selected, onChange }) => {
    const Icon = role.icon;
    return (
      <button
        type="button"
        onClick={() => onChange(role.value)}
        className={`p-4 rounded-2xl border transition-all duration-300 transform hover:scale-105 ${
          selected
            ? 'border-indigo-500 bg-indigo-500/20 shadow-md'
            : 'border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 hover:border-indigo-300 dark:hover:border-white/40 hover:bg-gray-50 dark:hover:bg-white/10'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            selected ? 'bg-indigo-500/20' : 'bg-gray-100 dark:bg-white/5'
          }`}>
            <Icon className={`w-5 h-5 ${selected ? 'text-indigo-600 dark:text-indigo-400' : role.color}`} />
          </div>
          <div className="flex-1 text-left">
            <h3 className={`font-semibold ${
              selected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'
            }`}>
              {role.label}
            </h3>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-gray-300 dark:border-gray-500'
          }`}>
            {selected && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>
        </div>
      </button>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
        {priorityConfig.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="group w-10 h-10 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/20 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 hover:border-indigo-400 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </Link>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
                  Broadcast Messages
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Send announcements and notifications to users
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-white/5 px-4 py-2 rounded-2xl border border-indigo-500/20 shadow-sm">
            <Bell className="w-4 h-4" />
            <span>Communication Center</span>
          </div>
        </div>

        {}
        <div className="rounded-3xl p-8 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field rounded-2xl px-4 py-3 text-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter a clear and concise subject line..."
                required
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      formData.priority === priority.value
                        ? `${priority.bgColor} border-current scale-105 shadow-md`
                        : 'border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/40'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      formData.priority === priority.value ? priority.color : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {priority.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Recipients *
                </label>
                {/* <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  {getSelectedRecipientsCount().toLocaleString()} users selected
                </span> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <RoleCard
                    key={role.value}
                    role={role}
                    selected={formData.roles.includes(role.value)}
                    onChange={handleRoleChange}
                  />
                ))}
              </div>
            </div>

            {}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Message *
                </label>
                <span className={`text-sm font-medium ${
                  characterCount > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {characterCount} characters
                </span>
              </div>
              <textarea
                value={formData.message}
                onChange={handleMessageChange}
                className="input-field rounded-2xl px-4 py-4 border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                rows={12}
                placeholder="Write your broadcast message here... Be clear and concise to ensure your message is understood by all recipients."
                required
              />
            </div>

            {}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <span>Priority:</span>
                  <PriorityBadge priority={formData.priority} />
                </div>
                <span>•</span>
                <span>{formData.roles.length} recipient groups</span>
              </div>

              <button
                type="submit"
                disabled={loading || formData.roles.length === 0 || !formData.subject || !formData.message}
                className="btn-primary flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Broadcast...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {}
        <div className="rounded-3xl p-6 border border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Broadcast Best Practices</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Keep subject lines clear and under 50 characters</li>
                <li>• Use high priority only for urgent system-wide announcements</li>
                <li>• Test messages with a small group before broadcasting to all users</li>
                <li>• Include clear call-to-actions when appropriate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;