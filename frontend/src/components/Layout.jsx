import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  Users, 
  Shield, 
  BarChart3, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  ClipboardList,
  AlertCircle,
  Settings,
  Database,
  ChevronRight,
  Building,
  Car,
  UserCheck,
  Bell,
  Search,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isAgent, isTraffic, isDriver } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'from-purple-500 to-indigo-600';
      case 'agent': return 'from-green-500 to-emerald-600';
      case 'traffic': return 'from-yellow-500 to-amber-600';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Shield;
      case 'agent': return UserCheck;
      case 'traffic': return Shield;
      default: return Car;
    }
  };

  const driverNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, description: 'Overview and quick actions' },
    { path: '/report-accident', label: 'Report Accident', icon: PlusCircle, description: 'File new accident report' },
    { path: '/my-reports', label: 'My Reports', icon: FileText, description: 'View your accident history' },
    { path: '/hotspot-map', label: 'Hotspot Map', icon: Building, description: 'Accident-prone areas' },
  ];

  const agentNavItems = [
    { path: '/agent', label: 'Dashboard', icon: Home, description: 'Claims overview and assignments' },
  ];

  const trafficNavItems = [
    { path: '/traffic', label: 'Dashboard', icon: Home, description: 'Verification requests overview' },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: Home, description: 'System overview and analytics' },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, description: 'Detailed system analytics' },
    { path: '/admin/claims', label: 'Claims Management', icon: ClipboardList, description: 'Oversee all insurance claims' },
    { path: '/admin/agents', label: 'Agents', icon: Users, description: 'Manage insurance agents' },
    { path: '/admin/traffic', label: 'Traffic Officers', icon: Shield, description: 'Manage verification officers' },
    { path: '/admin/broadcast', label: 'Broadcast', icon: MessageSquare, description: 'Send system announcements' },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: AlertCircle, description: 'System activity monitoring' },
    { path: '/admin/exports', label: 'Data Exports', icon: Database, description: 'Export system data' },
  ];

  const getNavItems = () => {
    if (isAdmin) return adminNavItems;
    if (isAgent) return agentNavItems;
    if (isTraffic) return trafficNavItems;
    return driverNavItems;
  };

  const navItems = getNavItems();
  const RoleIcon = getRoleIcon(user?.role);
  const roleColor = getRoleColor(user?.role);

  const NavItem = ({ item, isActive, isMobile = false }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`group flex items-center space-x-4 p-2 rounded-2xl transition-all duration-300 ${
          isActive
            ? `bg-gradient-to-r ${roleColor} text-white shadow-lg scale-1`
            : 'text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
        } ${isMobile ? 'mx-2' : ''}`}
      >
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
          isActive 
            ? 'bg-white/20' 
            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700'
        }`}>
          <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-current'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-lg leading-tight ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {item.label}
          </p>
          {item.description && (
            <p className={`text-sm mt-1 ${isActive ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
              {item.description}
            </p>
          )}
        </div>
        {isActive && (
          <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl z-40 hidden lg:block border-r border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                  AutoSureAI
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Intelligent Claims Platform</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavItem key={item.path} item={item} isActive={isActive} />
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4">
            <ThemeToggle showLabel={true} className="w-full justify-center rounded-2xl py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" />
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className={`w-12 h-12 bg-gradient-to-r ${roleColor} rounded-2xl flex items-center justify-center shadow-md`}>
                <RoleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'Driver'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg z-50 border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                AutoSureAI
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle showLabel={false} className="rounded-2xl" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <nav className="p-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavItem key={item.path} item={item} isActive={isActive} isMobile={true} />
                  );
                })}
              </div>
            </nav>
            
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className={`w-10 h-10 bg-gradient-to-r ${roleColor} rounded-2xl flex items-center justify-center`}>
                  <RoleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role || 'Driver'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 border border-red-200 dark:border-red-800"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:ml-80 pt-20 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;