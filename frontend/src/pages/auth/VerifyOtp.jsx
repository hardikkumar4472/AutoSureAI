import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Car } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import HomeImage from '../../Assets/Home.png';
import DarkImage from '../../Assets/dark.jpeg';
import { motion } from 'framer-motion';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(email, otp);
    setLoading(false);

    if (result.success) {
      navigate('/login');
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verify Email</h1>
          <p className="text-gray-300 mt-2">Enter the OTP sent to your email</p>
          {email && (
            <p className="text-sm text-indigo-400 mt-2 font-medium bg-indigo-500/10 py-1 px-3 rounded-full inline-block border border-indigo-500/20">
              {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OTP
            </label>
            <div className="relative group">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-semibold rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all group-hover:bg-white/10"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;