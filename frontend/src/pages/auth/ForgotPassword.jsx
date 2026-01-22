import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Car } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import HomeImage from '../../Assets/Home.png';
import DarkImage from '../../Assets/dark.jpeg';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      navigate('/reset-password', { state: { email } });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-4 px-4 sm:px-6">
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
          <img src={HomeImage} alt="Background Light" className="w-full h-full object-cover object-center dark:hidden" />
          <img src={DarkImage} alt="Background Dark" className="w-full h-full object-cover object-center hidden dark:block" />
          <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle 
           showLabel={false} 
           className="!bg-white/10 !dark:bg-black/30 !border-white/20 !rounded-full !w-11 !h-11 hover:!scale-110 text-white" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-lg border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4 shadow-lg shadow-indigo-500/30">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Forgot Password</h1>
          <p className="text-gray-300 mt-2">Enter your email to receive OTP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </span>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;