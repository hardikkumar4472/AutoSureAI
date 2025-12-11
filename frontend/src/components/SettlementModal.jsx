import { useState } from 'react';
import { X, DollarSign, CreditCard, FileText, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SettlementModal = ({ isOpen, onClose, claim, onSettled }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: claim?.estimatedCost || '',
    method: 'bank_transfer',
    reference: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid settlement amount');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/settlement/claim/${claim._id}/settle`, formData);
      toast.success('Claim settled successfully!');
      onSettled(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to settle claim');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Settle Claim</h2>
                <p className="text-green-100 text-sm">Process final settlement payment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Claim Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Claim ID</p>
                <p className="font-mono text-gray-900 dark:text-white">#{claim?._id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Driver</p>
                <p className="font-semibold text-gray-900 dark:text-white">{claim?.driverId?.name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Estimated Cost</p>
                <p className="font-semibold text-gray-900 dark:text-white">${claim?.estimatedCost?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-semibold text-green-600 dark:text-green-400 capitalize">{claim?.status}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Settlement Amount *
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter settlement amount"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Final amount to be paid to the claimant
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Payment Method *
            </label>
            <div className="relative">
              <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Transaction Reference
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Transaction ID, Cheque Number"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional reference number for tracking
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Settlement Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Add any additional notes about the settlement..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Settle Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlementModal;
