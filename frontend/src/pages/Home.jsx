import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import ThreeDBackground from '../components/ThreeDBackground';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Logo from '../Assets/AutoSureAI_Logo_New.png';
import { User, X, Github, Linkedin, Mail } from 'lucide-react';

const TiltCard = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-4xl mx-auto"
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <div className="relative min-h-screen text-gray-900 dark:text-white overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Background Image */}
      {/* 3D Background */}
      <ThreeDBackground />

      {/* Content Overlay - Single Screen Layout */}
      <div className="relative z-10 flex flex-col h-screen overflow-hidden w-full">
        
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 dark:bg-black/30 px-4 py-2 rounded-full border border-white/20 shadow-lg">
            <img src={Logo} alt="AutoSureAI" className="w-8 h-8 object-contain bg-white rounded-full p-1" />
            <span className="font-bold tracking-tight text-lg text-white">AutoSureAI</span>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowDevModal(true)}
               className="backdrop-blur-md bg-white/10 dark:bg-black/30 px-4 py-2 rounded-full border border-white/20 shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-white text-sm font-medium hover:bg-white/20 cursor-pointer"
             >
               <User className="w-4 h-4" />
               <span className="hidden sm:inline">About Developer</span>
             </button>
             <ThemeToggle 
               showLabel={false} 
               className="!bg-white/10 !dark:bg-black/30 !border-white/20 !rounded-full !w-11 !h-11 hover:!scale-110" 
             />
          </div>
        </header>

        {/* Main Content Area - Fully Centered */}
        <main 
          className="flex-grow flex flex-col items-center justify-center px-6 text-center max-w-7xl mx-auto w-full h-full perspective-1000"
        >
          <TiltCard>
            {/* Hero Section */}
            <div className="space-y-6 p-8 md:p-12 rounded-3xl backdrop-blur-sm shadow-2xl border border-white/10 bg-black/20">
               <div className="inline-block">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-100 shadow-sm">
                  Next-Gen Insurance Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-2xl">
                Intelligent Claims. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">
                  Resolved in Minutes.
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-200 max-w-xl mx-auto leading-relaxed drop-shadow-md">
                Harness the power of AI for on-the-spot accident analysis, real-time evidence verification, and streamlined settlements.
              </p>

              <div className="flex flex-row gap-4 justify-center items-center pt-2">
                <Link to="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-full shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[140px]">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-base rounded-full border border-white/30 shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[140px]">
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Compact Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-8">
              {[
                { title: "AI Damage Detection", desc: "Instant ML-powered severity analysis from accident photos." },
                { title: "Unified Workflow", desc: "Seamless coordination between drivers, agents, and traffic police." },
                { title: "Real-time Analytics", desc: "Live dashboards tracking claim status and settlement efficiency." }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-colors text-left transform duration-300 hover:scale-105"
                >
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-300 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </TiltCard>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 py-3 text-center text-gray-400 text-xs bg-black/40 backdrop-blur-md border-t border-white/5 w-full absolute bottom-0">
          <p>© {new Date().getFullYear()} AutoSureAI.</p>
        </footer>
      </div>

      {/* Developer Modal */}
      <AnimatePresence>
        {showDevModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center"
            >
              <button 
                onClick={() => setShowDevModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Hardik Kumar</h2>
              <p className="text-indigo-300 mb-8 font-medium">Developer</p>

              <div className="space-y-4">
                <a href="https://github.com/hardikkumar4472" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all group">
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">GitHub</p>
                    <p className="text-sm font-medium text-white">@hardikkumar4472</p>
                  </div>
                </a>

                <a href="https://www.linkedin.com/in/hardik-kumar-63a4b3249" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all group">
                  <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">LinkedIn</p>
                    <p className="text-sm font-medium text-white">Connect on LinkedIn</p>
                  </div>
                </a>

                <a href="mailto:hardikv715@gmail.com" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all group">
                  <div className="p-2 bg-red-500 rounded-lg group-hover:bg-red-400 transition-colors">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-white">hardikv715@gmail.com</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;