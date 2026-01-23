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
  Zap,
  MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import HomeImage from '../Assets/Home.png';
import DarkImage from '../Assets/dark.jpeg';
import Logo from '../Assets/AutoSureAI_Logo_New.png';

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
    { path: '/driver/analytics', label: 'Analytics', icon: BarChart3, description: 'My accident statistics' },
    { path: '/report-accident', label: 'Report', icon: PlusCircle, description: 'File new accident report' },
    { path: '/my-reports', label: 'History', icon: FileText, description: 'View your accident history' },
    { path: '/hotspot-map', label: 'Hotspots', icon: Building, description: 'Accident-prone areas' },
  ];

  const agentNavItems = [
    { path: '/agent', label: 'Dashboard', icon: Home, description: 'Claims overview' },
    { path: '/agent/analytics', label: 'Analytics', icon: BarChart3, description: 'Detailed claims analytics' },
    { path: '/agent/hotspots', label: 'Hotspots', icon: MapPin, description: 'Accident heatmaps' },
  ];

  const trafficNavItems = [
    { path: '/traffic', label: 'Dashboard', icon: Home, description: 'Verification requests' },
    { path: '/traffic/analytics', label: 'Analytics', icon: BarChart3, description: 'Traffic reports analytics' },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: Home, description: 'System overview' },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, description: 'System analytics' },
    { path: '/admin/claims', label: 'Claims', icon: ClipboardList, description: 'Claims Management' },
    { path: '/admin/agents', label: 'Agents', icon: Users, description: 'Manage agents' },
    { path: '/admin/traffic', label: 'Traffic', icon: Shield, description: 'Traffic Officers' },
    { path: '/admin/users', label: 'Users', icon: Users, description: 'Manage all users' },
    { path: '/admin/broadcast', label: 'Broadcast', icon: MessageSquare, description: 'Announcements' },
    { path: '/admin/audit-logs', label: 'Audit', icon: AlertCircle, description: 'Audit Logs' },
    { path: '/admin/exports', label: 'Exports', icon: Database, description: 'Data Exports' },
  ];

  const getNavItems = () => {
    const path = location.pathname;
    
    if (path.startsWith('/admin')) return adminNavItems;
    if (path.startsWith('/agent')) return agentNavItems;
    if (path.startsWith('/traffic')) return trafficNavItems;
    
    // Default to driver navigation for /dashboard and other common routes
    return driverNavItems;
  };

  const navItems = getNavItems();
  const RoleIcon = getRoleIcon(user?.role);
  const roleColor = getRoleColor(user?.role);

  const NavItem = ({ item, isActive, isMobile = false }) => {
    const Icon = item.icon;
    
    if (isMobile) {
      return (
        <Link
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={`group flex items-center space-x-4 p-2 rounded-2xl transition-all duration-300 ${isActive
            ? `bg-gradient-to-r ${roleColor} text-white shadow-lg`
            : 'text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
            } mx-2`}
        >
          <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-semibold">{item.label}</span>
        </Link>
      );
    }

    // Desktop Nav Item
    return (
      <Link
        to={item.path}
        className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
          ? 'text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        {isActive && (
          <div className={`absolute inset-0 bg-gradient-to-r ${roleColor} opacity-90 rounded-xl shadow-md -z-10`} />
        )}
        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-current'}`} />
        <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors">
      
      {/* Global Background Images */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={HomeImage} alt="Background Light" className="w-full h-full object-cover object-center dark:hidden opacity-100" />
          <img src={DarkImage} alt="Background Dark" className="w-full h-full object-cover object-center hidden dark:block opacity-100" />
          <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-900/40 backdrop-blur-[2px]" /> 
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Top Navigation Bar */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg py-2' : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-md py-4'
        }`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              
              {/* Logo and Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
                  <img src={Logo} alt="AutoSureAI Logo" className="w-full h-full object-contain p-1" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                    AutoSureAI
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto px-4 nav-scrollbar">
                {navItems.map((item) => (
                  <NavItem key={item.path} item={item} isActive={location.pathname === item.path} />
                ))}
              </nav>

              {/* Right Side Actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <NotificationBell />
                <ThemeToggle showLabel={false} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10" />
                
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Driver'}</p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-r ${roleColor} rounded-xl flex items-center justify-center shadow-md`}>
                    <RoleIcon className="w-5 h-5 text-white" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex lg:hidden items-center space-x-2">
                 <NotificationBell />
                 <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden pt-20">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl rounded-b-3xl p-4 overflow-y-auto max-h-[80vh]">
              <nav className="space-y-2 mb-6">
                {navItems.map((item) => (
                  <NavItem key={item.path} item={item} isActive={location.pathname === item.path} isMobile={true} />
                ))}
              </nav>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${roleColor} rounded-xl flex items-center justify-center`}>
                      <RoleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <ThemeToggle showLabel={false} />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 pt-24 pb-8 w-full relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;