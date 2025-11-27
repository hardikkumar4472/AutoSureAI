import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

    container.style.position = 'relative';
    container.appendChild(canvas);

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;

        this.color = document.documentElement.classList.contains('dark') 
          ? Math.random() > 0.7 ? '#60a5fa' : '#93c5fd' 
          : Math.random() > 0.7 ? '#2563eb' : '#3b82f6';
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.reset();
          this.y = -10;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class CarParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.color = document.documentElement.classList.contains('dark')
          ? '#fbbf24'
          : '#dc2626';
        this.life = 100;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = this.life / 100 * 0.8;

        if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 50 }, () => new Particle());
    const carParticles = Array.from({ length: 20 }, () => new CarParticle());

    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      carParticles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'agent') {
        navigate('/agent');
      } else if (role === 'traffic') {
        navigate('/traffic');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-950 px-4 transition-colors overflow-hidden">
      {}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {}
        <div className="absolute -left-20 top-1/4 animate-float-car-1">
          <Car className="w-8 h-8 text-primary-400 dark:text-primary-600 opacity-60" />
        </div>

        {}
        <div className="absolute -right-20 top-1/2 animate-float-car-2">
          <Car className="w-6 h-6 text-primary-300 dark:text-primary-500 opacity-40" />
        </div>

        {}
        <div className="absolute -left-16 bottom-1/3 animate-float-car-3">
          <Car className="w-10 h-10 text-primary-500 dark:text-primary-400 opacity-50" />
        </div>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 relative z-10">
        {}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 animate-pulse">
            <Car className="w-8 h-8 text-white animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-pulse">AutoSureAI</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field rounded-2xl"
              required
            >
              <option value="driver">Driver</option>
              <option value="agent">Agent</option>
              <option value="traffic">Traffic Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field rounded-full"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field rounded-full"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between ">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 "
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl transform transition-transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign up
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes float-car-1 {
          0% { transform: translateX(-100px) translateY(0px); }
          50% { transform: translateX(calc(100vw + 100px)) translateY(-20px); }
          100% { transform: translateX(calc(100vw + 100px)) translateY(0px); }
        }

        @keyframes float-car-2 {
          0% { transform: translateX(calc(100vw + 100px)) translateY(0px); }
          50% { transform: translateX(-100px) translateY(20px); }
          100% { transform: translateX(-100px) translateY(0px); }
        }

        @keyframes float-car-3 {
          0% { transform: translateX(-100px) translateY(0px) rotate(0deg); }
          25% { transform: translateX(25vw) translateY(-15px) rotate(5deg); }
          50% { transform: translateX(50vw) translateY(0px) rotate(0deg); }
          75% { transform: translateX(75vw) translateY(15px) rotate(-5deg); }
          100% { transform: translateX(calc(100vw + 100px)) translateY(0px) rotate(0deg); }
        }

        .animate-float-car-1 {
          animation: float-car-1 20s linear infinite;
        }

        .animate-float-car-2 {
          animation: float-car-2 25s linear infinite;
        }

        .animate-float-car-3 {
          animation: float-car-3 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;