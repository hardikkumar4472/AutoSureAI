import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Car, Check, X } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import HomeImage from '../../Assets/Home.png';
import DarkImage from '../../Assets/dark.jpeg';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const validatePassword = (password) => {
    const errors = {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
    setPasswordErrors(errors);
    return Object.values(errors).every(Boolean);
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[<>]/g, '');
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    if (name === 'newPassword') {
      validatePassword(sanitizedValue);
      if (formData.confirmPassword) {
        validateConfirmPassword(sanitizedValue, formData.confirmPassword);
      }
    }

    if (name === 'confirmPassword') {
      validateConfirmPassword(formData.newPassword, sanitizedValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Email not found. Please try again.');
      navigate('/forgot-password');
      return;
    }

    const isPasswordValid = validatePassword(formData.newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(formData.newPassword, formData.confirmPassword);

    if (!isPasswordValid) {
      alert('Please fix password requirements before submitting');
      return;
    }

    if (!isConfirmPasswordValid) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, formData.otp, formData.newPassword);
    setLoading(false);

    if (result.success) {
      navigate('/login');
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${
      met ? 'text-green-400' : 'text-gray-400'
    }`}>
      {met ? (
        <Check className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      <span>{text}</span>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-gray-300 mt-2">Enter OTP and new password</p>
          {email && (
            <p className="text-sm text-indigo-400 mt-2 font-medium bg-indigo-500/10 py-1 px-3 rounded-full inline-block border border-indigo-500/20">
              {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OTP
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full px-4 py-3 text-center text-xl tracking-widest rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                formData.newPassword && !Object.values(passwordErrors).every(Boolean) 
                  ? 'border-yellow-500/50' 
                  : 'border-white/10'
              }`}
              placeholder="Enter new password"
              required
              minLength={6}
            />
            
            {formData.newPassword && (
              <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                <p className="text-xs font-medium text-gray-300 mb-2">
                  Password must contain:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <PasswordRequirement 
                    met={passwordErrors.minLength} 
                    text="6+ chars" 
                  />
                  <PasswordRequirement 
                    met={passwordErrors.hasUppercase} 
                    text="Uppercase" 
                  />
                  <PasswordRequirement 
                    met={passwordErrors.hasLowercase} 
                    text="Lowercase" 
                  />
                  <PasswordRequirement 
                    met={passwordErrors.hasNumber} 
                    text="Number" 
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                confirmPasswordError ? 'border-red-500/50' : 'border-white/10'
              }`}
              placeholder="Confirm new password"
              required
            />
            {confirmPasswordError && (
              <p className="mt-2 text-sm text-red-400 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !Object.values(passwordErrors).every(Boolean) || confirmPasswordError}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;