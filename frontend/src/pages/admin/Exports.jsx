import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  ArrowLeft, 
  Database, 
  Filter,
  Calendar,
  BarChart3,
  Users,
  Shield,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminExports = () => {
  const [loading, setLoading] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleExport = async (type) => {
    setLoading(type);
    try {
      let endpoint = '';
      let filename = '';
      let params = {};

      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      if (type === 'accidents-csv') {
        endpoint = '/admin/export/accidents/csv';
        filename = `accidents_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (type === 'claims-csv') {
        endpoint = '/admin/export/claims/csv';
        filename = `claims_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (type === 'accidents-pdf') {
        endpoint = '/admin/export/accidents/summary/pdf';
        filename = `accident_summary_${new Date().toISOString().split('T')[0]}.pdf`;
      } else if (type === 'users-csv') {
        endpoint = '/admin/export/users/csv';
        filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (type === 'agents-csv') {
        endpoint = '/admin/export/agents/csv';
        filename = `agents_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (type === 'traffic-csv') {
        endpoint = '/admin/export/traffic/csv';
        filename = `traffic_officers_${new Date().toISOString().split('T')[0]}.csv`;
      }

      const response = await api.get(endpoint, {
        responseType: 'blob',
        params: params
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${exportOptions.find(opt => opt.id === type)?.title} downloaded successfully!`);
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setLoading(null);
    }
  };

  const exportOptions = [
    {
      id: 'accidents-csv',
      title: 'Accident Reports',
      description: 'Complete accident data with all details and status',
      icon: FileSpreadsheet,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-400',
      format: 'CSV',
    },
    {
      id: 'claims-csv',
      title: 'Insurance Claims',
      description: 'All insurance claims with processing status and amounts',
      icon: ClipboardList,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      format: 'CSV',
    },
    {
      id: 'accidents-pdf',
      title: 'Accident Summary',
      description: 'Comprehensive PDF report with analytics and insights',
      icon: FileText,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/20',
      iconColor: 'text-red-400',
      format: 'PDF',
    }

  ];

  const ExportCard = ({ option }) => {
    const Icon = option.icon;
    const isLoading = loading === option.id;

    return (
      <div 
        className="rounded-2xl p-6 border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
        onClick={() => !isLoading && handleExport(option.id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${option.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${option.iconColor}`} />
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            option.format === 'PDF' 
              ? 'bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30'
              : 'bg-green-500/20 text-green-600 dark:text-green-300 border border-green-500/30'
          }`}>
            {option.format}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          {option.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
          {option.description}
        </p>

        <button
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${option.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Export</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="group w-10 h-10 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/20 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 hover:border-indigo-400 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </Link>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
                  Data Exports
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                  Export system data for analysis and reporting
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-white/5 px-4 py-2 rounded-2xl border border-indigo-500/20 shadow-sm">
            <Database className="w-4 h-4" />
            <span>Data Management</span>
          </div>
        </div>

        {}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Exports</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {exportOptions.length} data formats available for download
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-4 h-4" />
              <span>Real-time data</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exportOptions.map((option) => (
              <ExportCard key={option.id} option={option} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExports;