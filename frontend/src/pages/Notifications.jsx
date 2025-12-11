import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadParam = filter === 'unread' ? '&unreadOnly=true' : '';
      const response = await api.get(`/notifications?page=${page}&limit=20${unreadParam}`);
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      if (pagination) {
        setPagination(prev => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (pagination) {
        setPagination(prev => ({ ...prev, unreadCount: 0 }));
      }
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    try {
      await api.delete('/notifications/read/all');
      setNotifications(prev => prev.filter(n => !n.isRead));
      toast.success('All read notifications deleted');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Failed to delete read notifications');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'claim_approved':
        return <Check className={`${iconClass} text-green-600`} />;
      case 'claim_rejected':
        return <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-xs font-bold">✕</span>
        </div>;
      case 'claim_settled':
        return <CheckCheck className={`${iconClass} text-purple-600`} />;
      case 'new_message':
        return <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 text-xs font-bold">💬</span>
        </div>;
      case 'claim_assigned':
      case 'agent_assigned':
        return <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 text-xs font-bold">👤</span>
        </div>;
      case 'admin_broadcast':
      case 'system_announcement':
        return <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-purple-600 text-xs font-bold">📢</span>
        </div>;
      default:
        return <Bell className={`${iconClass} text-gray-600`} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500';
      case 'high':
        return 'border-l-4 border-orange-500';
      case 'medium':
        return 'border-l-4 border-blue-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {pagination?.unreadCount || 0} unread • {pagination?.total || 0} total
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={async () => {
                try {
                  await api.post('/notifications/test');
                  toast.success('Test notification sent!');
                } catch (error) {
                  toast.error('Failed to send test notification');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-4 py-2 flex items-center space-x-2 transition-colors duration-200"
            >
              <Bell className="w-4 h-4" />
              <span>Test</span>
            </button>
            
            <button
              onClick={fetchNotifications}
              className="btn-primary rounded-2xl px-4 py-2 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            {pagination?.unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-4 py-2 flex items-center space-x-2 transition-colors duration-200"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
            
            <button
              onClick={deleteAllRead}
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-4 py-2 flex items-center space-x-2 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Read</span>
            </button>
          </div>
        </div>

        <div className="card rounded-3xl p-4 mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setFilter('all');
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilter('unread');
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                  filter === 'unread'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Unread ({pagination?.unreadCount || 0})
              </button>
            </div>
          </div>
        </div>

        <div className="card rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  } ${getPriorityColor(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className={`text-lg font-semibold ${
                            !notification.isRead 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                              title="Mark as read"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        {notification.priority !== 'low' && (
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            notification.priority === 'urgent' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : notification.priority === 'high'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {notification.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
