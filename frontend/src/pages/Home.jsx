import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreeDBackground from '../components/ThreeDBackground';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Logo from '../Assets/AutoSureAI_Logo_New.png';
import { User, X, Github, Linkedin, Mail, MapPin, Navigation, AlertTriangle, ChevronDown, Loader, Camera } from 'lucide-react';
import HotspotMap from './driver/HotspotMap';
import { getCurrentLocation } from '../utils/locationService';
import toast from 'react-hot-toast';

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
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      toast.success("Image uploaded!");
    }
  };

  const handleReportRedirect = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const location = await getCurrentLocation();
      setAddress(location.address);
      toast.success("Location captured successfully!");
    } catch (error) {
      console.error("Location error:", error);
      toast.error("Failed to get location. Please enter manually.");
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative min-h-screen text-gray-900 dark:text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Background Image */}
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <ThreeDBackground />
      </div>

      {/* Content Overlay - Scrollable Layout */}
      <div className="relative z-10 flex flex-col w-full">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full transition-all duration-300">
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

        {/* Main Content Area */}
        <main className="flex-grow w-full">
          
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-7xl mx-auto w-full perspective-1000 pt-20">
            <TiltCard>
              {/* Hero Content */}
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
                  <button 
                    onClick={scrollToContent} 
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-full shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[160px] flex items-center justify-center gap-2"
                  >
                    <span>Let's Try</span>
                    <ChevronDown className="w-5 h-5 animate-bounce" />
                  </button>
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

            <button 
              onClick={scrollToContent} 
              className="mt-12 animate-bounce p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </section>

          {/* Reporting Preview Section */}
          <section className="py-20 px-6 w-full relative overflow-hidden">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              
              <div className="relative space-y-6 text-left p-8 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-md -z-10 border border-white/10" />
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-2">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                  Report in Seconds. <br />
                  <span className="text-indigo-400">Get Help Immediately.</span>
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  In an emergency, every second counts. AutoSureAI allows you to report accidents instantly with precise location tracking and AI-powered damage assessment.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-gray-200">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                      <Navigation className="w-6 h-6" />
                    </div>
                    <span>One-tap GPS Location Capture</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-200">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <span>Automatic Address Detection</span>
                  </div>
                </div>
              </div>

              {/* Mock Report Form */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-white">Quick Report</h3>
                </div>

                <form onSubmit={handleReportRedirect} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Evidence</label>
                    <div className="relative group">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {imagePreview ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/20 bg-black/40 group">
                           <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                           <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                           >
                             <X className="w-4 h-4" />
                           </button>
                           <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-center">
                              <p className="text-xs text-green-400 font-medium">Ready for analysis</p>
                           </div>
                        </div>
                      ) : (
                        <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-8 h-8 mb-2 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-sm text-gray-400 group-hover:text-gray-300">
                              <span className="font-semibold">Click to upload</span> accident photo
                            </p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-500" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Enter location or use GPS" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        required
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-indigo-300 cursor-pointer disabled:opacity-50"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                      >
                         {isLocating ? <Loader className="w-5 h-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/25 transform transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Get AI based analysis now</span>
                  </button>
                </form>
              </motion.div>

            </div>
          </section>

          {/* Hotspot Map Section */}
          <section className="py-20 px-6 w-full bg-black/40 backdrop-blur-md">
            <div className="max-w-[1400px] mx-auto">
              <div className="text-center mb-12">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 border border-red-400/30 text-red-100 shadow-sm mb-4 inline-block">
                  Live Global Data
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Accident Hotspots</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Visualize high-risk areas in real-time. Our AI analyzes global accident data to help you stay safe on the roads.
                </p>
              </div>
              
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[750px] w-full relative z-0">
                <HotspotMap className="w-full h-full" />
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 py-6 text-center text-gray-400 text-xs bg-black/60 backdrop-blur-xl border-t border-white/5 w-full">
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