import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Check, X } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import HomeImage from '../../Assets/Home.png';
import DarkImage from '../../Assets/dark.jpeg';
import Logo from '../../Assets/AutoSureAI_Logo_New.png';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: '',
    password: '',
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
  const { register } = useAuth();
  const navigate = useNavigate();

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

    if (name === 'password') {
      validatePassword(sanitizedValue);
      if (formData.confirmPassword) {
        validateConfirmPassword(sanitizedValue, formData.confirmPassword);
      }
    }

    if (name === 'confirmPassword') {
      validateConfirmPassword(formData.password, sanitizedValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (!isPasswordValid) {
      alert('Please fix password requirements before submitting');
      return;
    }

    if (!isConfirmPasswordValid) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name.replace(/[<>]/g, ''),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.replace(/[^0-9+\-() ]/g, ''), 
      vehicleNumber: formData.vehicleNumber.toUpperCase().replace(/[^A-Z0-9]/g, ''), 
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/verify-otp', { state: { email: formData.email } });
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
        className="relative z-10 w-full max-w-4xl p-8 rounded-3xl backdrop-blur-lg border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-3 shadow-lg shadow-indigo-500/30 overflow-hidden">
            <img src={Logo} alt="AutoSureAI Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-gray-300 text-sm mt-1">Sign up for AutoSureAI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-3xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Enter your name"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-3xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-3xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="+91 xxx xxxx xxx"
                  required
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-3xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Enter vehicle number"
                  required
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-3xl bg-white/5 border text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm ${
                    formData.password && !Object.values(passwordErrors).every(Boolean) 
                      ? 'border-yellow-500/50' 
                      : 'border-white/10'
                  }`}
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-3xl bg-white/5 border text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm ${
                    confirmPasswordError ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                {confirmPasswordError && (
                  <p className="mt-1 text-xs text-red-400 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {confirmPasswordError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Password Requirements - Full Width, conditional */}
          {formData.password && !Object.values(passwordErrors).every(Boolean) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-white/5 rounded-xl border border-white/5 grid grid-cols-2 gap-2"
            >
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
            </motion.div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !Object.values(passwordErrors).every(Boolean) || confirmPasswordError}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-3xl shadow-lg shadow-indigo-500/30 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            
            <p className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
