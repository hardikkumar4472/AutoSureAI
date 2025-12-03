import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Cpu, ArrowRight, Car } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    icon: ShieldCheck,
    title: 'Unified Claims Journey',
    description: 'One dashboard for drivers, agents, traffic officers, and admins to collaborate end-to-end.',
  },
  {
    icon: Sparkles,
    title: 'ML Accident Insights',
    description: 'Automatic damage severity detection and repair cost estimation for faster decisions.',
  },
  {
    icon: Cpu,
    title: 'Realtime Collaboration',
    description: 'Live chat, notifications, and audit logs keep everyone informed in real time.',
  },
];

const Home = () => {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.min-h-screen');

    if (!container) return;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-1/4 animate-float-car-1">
          <Car className="w-8 h-8 text-primary-400 dark:text-primary-600 opacity-60" />
        </div>

        <div className="absolute -right-20 top-1/2 animate-float-car-2">
          <Car className="w-6 h-6 text-primary-300 dark:text-primary-500 opacity-40" />
        </div>

        <div className="absolute -left-16 bottom-1/3 animate-float-car-3">
          <Car className="w-10 h-10 text-primary-500 dark:text-primary-400 opacity-50" />
        </div>
      </div>

      <header className="relative z-10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 tracking-widest uppercase">AutoSureAI</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ML-Based Insurance Platform</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 px-6 py-12 max-w-6xl mx-auto space-y-12">
        <section className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            On the spot Intelligent accident analysis, Realtime Accident information & Insurance dispute resolution
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            AutoSureAI connects ML-assisted accident assessment with streamlined workflows for drivers, insurance agents,
            traffic officers, and administrators. Submit, verify, collaborate, and settle — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn-primary inline-flex items-center justify-center space-x-2 px-6 py-3 text-lg rounded-full">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-secondary inline-flex items-center justify-center px-6 py-3 text-lg rounded-full">
              Create Account
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card h-full rounded-3xl relative z-10">
              <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          ))}
        </section>

        <section className="card bg-primary-600 text-white dark:bg-primary-900 rounded-3xl relative z-10">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest">Stay in control</p>
              <h3 className="text-3xl font-bold mt-2">Multi-role operational cockpit</h3>
              <p className="mt-3 text-primary-50">
                Drivers capture accidents with ML based analysis, agents verify and settle, traffic officers add FIR evidence,
                and administrators manage users, analytics, broadcasts, and exports.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <ul className="space-y-2 text-sm">
                <li>- Driver dashboard with claim tracking & chat</li>
                <li>- Agent verification & settlement workflows</li>
                <li>- Traffic verification & FIR uploads</li>
                <li>- Admin analytics, exports, and broadcasts</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

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

export default Home;