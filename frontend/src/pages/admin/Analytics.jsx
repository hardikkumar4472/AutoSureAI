import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Users, Shield, Clock } from 'lucide-react';
import api from '../../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Particle animation removed
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="rounded-2xl p-6 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 backdrop-blur-sm border border-gray-200 dark:border-white/10`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Analytics Data</h3>
          <p className="text-gray-600 dark:text-gray-300">Analytics data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  const severityData = analytics.severityStats?.map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0,
  })) || [];

  const claimStatusData = analytics.claimStats?.map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0,
  })) || [];

  const monthlyData = analytics.monthlyTrend?.map(item => ({
    month: item._id,
    count: item.count,
  })) || [];

  const costData = analytics.costStats?.map(item => ({
    severity: item._id || 'Unknown',
    estimated: Math.round(item.avgEstimated || 0),
    min: Math.round(item.avgMin || 0),
    max: Math.round(item.avgMax || 0),
  })) || [];

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Comprehensive system insights and performance metrics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Verifications"
            value={analytics.fraud?.totalVerifications || 0}
            icon={Shield}
            color="text-purple-400"
            description="Completed verifications"
          />
          <StatCard
            title="Fraudulent Cases"
            value={analytics.fraud?.fraudCount || 0}
            icon={AlertTriangle}
            color="text-red-400"
            description="Detected fraud cases"
          />
          <StatCard
            title="Fraud Percentage"
            value={`${analytics.fraud?.fraudPercentage?.toFixed(2) || 0}%`}
            icon={TrendingUp}
            color="text-yellow-400"
            description="Of total verifications"
          />
          <StatCard
            title="Avg Verification Time"
            value={analytics.avgVerificationMs ? `${Math.round(analytics.avgVerificationMs / (1000 * 60 * 60))}h` : 'N/A'}
            icon={Clock}
            color="text-blue-400"
            description="Processing time"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Severity Chart */}
          <div className="rounded-3xl p-6 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Accidents by Severity</h2>
            </div>
            {severityData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(8px)'
                      }}
                      itemStyle={{ color: '#374151' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No severity data available</p>
              </div>
            )}
          </div>

          {/* Claims Status Chart */}
          <div className="rounded-3xl p-6 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Claims by Status</h2>
            </div>
            {claimStatusData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={claimStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(8px)'
                      }}
                       cursor={{ fill: 'transparent' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]}
                      activeBar={({ x, y, width, height, fill }) => (
                        <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} style={{ filter: `drop-shadow(0 0 6px ${fill})` }} />
                      )}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No claim status data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="rounded-3xl p-6 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Accident Trend</h2>
          </div>
          {monthlyData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#8884d8', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No monthly trend data available</p>
            </div>
          )}
        </div>

        {/* Cost Analysis Chart */}
        <div className="rounded-3xl p-6 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Average Repair Costs by Severity</h2>
          </div>
          {costData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="severity" stroke="#6b7280" axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      border: 'none', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="estimated" fill="#8884d8" name="Estimated" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="min" fill="#82ca9d" name="Minimum" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" fill="#ffc658" name="Maximum" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No cost data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;