import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Check, X } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

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

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.min-h-screen');

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';

    if (container) {
      container.appendChild(canvas);
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    const vehicles = [];
    const vehicleCount = 15;

    for (let i = 0; i < vehicleCount; i++) {
      vehicles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 1 + 0.5,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

      vehicles.forEach(vehicle => {
        ctx.save();
        ctx.translate(vehicle.x, vehicle.y);
        ctx.rotate(vehicle.angle);
        ctx.fillRect(-vehicle.size / 2, -vehicle.size / 4, vehicle.size, vehicle.size / 2);
        ctx.fillStyle = 'rgba(30, 64, 175, 0.2)';
        ctx.fillRect(-vehicle.size / 2 + 2, -vehicle.size / 4 + 2, vehicle.size - 4, vehicle.size / 2 - 4);
        ctx.restore();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

        vehicle.x += Math.cos(vehicle.angle) * vehicle.speed;
        vehicle.y += Math.sin(vehicle.angle) * vehicle.speed;

        if (vehicle.x < -20) vehicle.x = canvas.width + 20;
        if (vehicle.x > canvas.width + 20) vehicle.x = -20;
        if (vehicle.y < -20) vehicle.y = canvas.height + 20;
        if (vehicle.y > canvas.height + 20) vehicle.y = -20;

        if (Math.random() < 0.01) {
          vehicle.angle += (Math.random() - 0.5) * 0.5;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  const sanitizeVehicleNumber = (value) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  };

  const sanitizePhoneNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let sanitizedValue = value;
    if (name === 'vehicleNumber') {
      sanitizedValue = sanitizeVehicleNumber(value);
    } else if (name === 'phone') {
      sanitizedValue = sanitizePhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    if (name === 'password') {
      validatePassword(value);
    }

    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      if (name === 'password') {
        validateConfirmPassword(formData.confirmPassword, value);
      } else {
        validateConfirmPassword(value, formData.password);
      }
    }
  };

  const validatePassword = (password) => {
    setPasswordErrors({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  };

  const validateConfirmPassword = (confirmPassword, password = formData.password) => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    const isPasswordValid = Object.values(passwordErrors).every(error => error);
    if (!isPasswordValid) {
      return;
    }

    if (formData.phone.length !== 10) {
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        vehicleNumber: formData.vehicleNumber.toUpperCase()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordErrors).every(error => error);
  const isFormValid = formData.name && 
                     formData.email && 
                     formData.phone.length === 10 && 
                     formData.vehicleNumber && 
                     isPasswordValid && 
                     formData.confirmPassword && 
                     !confirmPasswordError;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Car className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Join our parking community
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter 10-digit phone number"
                maxLength="10"
                required
              />
              {formData.phone.length > 0 && formData.phone.length !== 10 && (
                <p className="mt-1 text-sm text-red-600">Phone number must be 10 digits</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., AB12CD1234"
                maxLength="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Create a strong password"
                required
              />
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center">
                  {passwordErrors.minLength ? <Check className="w-4 h-4 text-green-500 mr-2" /> : <X className="w-4 h-4 text-red-500 mr-2" />}
                  <span className="text-sm">At least 8 characters</span>
                </div>
                <div className="flex items-center">
                  {passwordErrors.hasUppercase ? <Check className="w-4 h-4 text-green-500 mr-2" /> : <X className="w-4 h-4 text-red-500 mr-2" />}
                  <span className="text-sm">One uppercase letter</span>
                </div>
                <div className="flex items-center">
                  {passwordErrors.hasLowercase ? <Check className="w-4 h-4 text-green-500 mr-2" /> : <X className="w-4 h-4 text-red-500 mr-2" />}
                  <span className="text-sm">One lowercase letter</span>
                </div>
                <div className="flex items-center">
                  {passwordErrors.hasNumber ? <Check className="w-4 h-4 text-green-500 mr-2" /> : <X className="w-4 h-4 text-red-500 mr-2" />}
                  <span className="text-sm">One number</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                required
              />
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
