import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Cpu, ArrowRight } from 'lucide-react';
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 tracking-widest uppercase">AutoSureAI</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ML-Based Insurance Platform</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-6 py-12 max-w-6xl mx-auto space-y-12">
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
            <div key={title} className="card h-full rounded-3xl">
              <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          ))}
        </section>

        <section className="card bg-primary-600 text-white dark:bg-primary-900 rounded-3xl">
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
                <li>-Driver dashboard with claim tracking & chat</li>
                <li>-Agent verification & settlement workflows</li>
                <li>-Traffic verification & FIR uploads</li>
                <li>-Admin analytics, exports, and broadcasts</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;