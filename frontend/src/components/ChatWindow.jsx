import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Image as ImageIcon,
  FileText,
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  User,
  Bot
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { format, isToday, isYesterday } from 'date-fns';

const ChatWindow = ({ claimId, onClose, title = "Chat with Agent" }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    if (socket) {

      socket.emit('join_claim', claimId);

      socket.on('receive_chat', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on('user_online', (userId) => {
        setOnlineUsers(prev => new Set(prev).add(userId));
      });

      socket.on('user_offline', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      socket.on('users_online', (userIds) => {
        setOnlineUsers(new Set(userIds));
      });

      socket.on('user_typing', (data) => {

      });

      return () => {
        socket.off('receive_chat');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('users_online');
        socket.off('user_typing');
      };
    }
  }, [claimId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${claimId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post(`/chat/${claimId}`, {
        message: newMessage.trim(),
      });

      if (socket) {
        socket.emit('send_chat', response.data.message);
      }

      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {


    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const formatDateHeader = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM dd, yyyy');
    }
  };

  const getMessageStatusIcon = (message, isOwn) => {
    if (!isOwn) return null;

    if (message.readBy && message.readBy.length > 0) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (message.delivered) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else if (message.sent) {
      return <Check className="w-3 h-3 text-gray-400" />;
    } else {
      return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getGroupedMessages = () => {
    const grouped = [];
    let currentDate = null;

    messages.forEach((message, index) => {
      const messageDate = formatDateHeader(message.createdAt);

      if (messageDate !== currentDate) {
        grouped.push({ type: 'date', content: messageDate, id: `date-${messageDate}` });
        currentDate = messageDate;
      }

      grouped.push({ type: 'message', content: message, id: message._id || index });
    });

    return grouped;
  };

  const MessageBubble = ({ message }) => {
    const isOwn = message.sender?._id === user?.id || message.sender === user?.id;
    const isSystem = message.sender?.role === 'system';
    // const isOnline = onlineUsers.has(message.sender?._id);

    if (isSystem) {
      return (
        <div className="flex justify-center my-2">
          <div className="bg-white/10 dark:bg-white/5 px-4 py-2 rounded-2xl max-w-md backdrop-blur-sm border border-white/10">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {message.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              {formatMessageTime(message.createdAt)}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
          {}
          {!isOwn && (
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              
            </div>
          )}

          {}
          <div
            className={`relative px-4 py-3 rounded-3xl ${
              isOwn
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-lg shadow-blue-500/20'
                : 'bg-white/10 dark:bg-white/5 text-gray-900 dark:text-white border border-white/10 dark:border-white/10 rounded-bl-md backdrop-blur-md'
            } shadow-sm group-hover:shadow-md transition-all duration-200`}
          >
            {}
            {!isOwn && (
              <p className="text-xs font-semibold mb-1 opacity-90">
                {message.sender?.name || 'Unknown User'}
              </p>
            )}

            {}
            <p className="text-sm leading-relaxed">{message.message}</p>

            {}
            <div className={`flex items-center space-x-1 mt-2 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}>
              <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DateHeader = ({ date }) => (
    <div className="flex justify-center my-6">
      <div className="bg-white/10 dark:bg-white/5 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {date}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-[600px] bg-white/10 dark:bg-black/40 rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white/10 dark:bg-black/40 rounded-3xl border border-white/20 shadow-xl overflow-hidden backdrop-blur-xl">
      {}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
              
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
         
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/10 rounded-2xl transition-all duration-200"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-6 bg-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              No messages yet. Send the first message to start discussing claim #{claimId}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {getGroupedMessages().map((item) =>
              item.type === 'date' ? (
                <DateHeader key={item.id} date={item.content} />
              ) : (
                <MessageBubble key={item.id} message={item.content} />
              )
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {}
      <div className="p-6 border-t border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-md">
        <form onSubmit={sendMessage} className="flex items-end space-x-3">
          {}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/10 rounded-2xl transition-all duration-200 flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          {}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />

            {}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          {/* <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400"> */}
            {/* <span>Press Enter to send</span>
            <span>•</span>
            <span>Shift + Enter for new line</span> */}
          {/* </div> */}

          {/* <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
              <Mic className="w-4 h-4" />
            </button> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;