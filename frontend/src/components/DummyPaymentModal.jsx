import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  ChevronRight, 
  Smartphone, 
  Building2, 
  Clock,
  CheckCircle2,
  Lock,
  IndianRupee
} from "lucide-react";
import Logo from "../Assets/AutoSureAI_Logo_New.png";

const DummyPaymentModal = ({ isOpen, onClose, onSuccess, amount = 1000 }) => {
  const [step, setStep] = useState(1); // 1: Methods, 2: Processing, 3: Success
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedMethod(null);
    }
  }, [isOpen]);

  const handlePay = () => {
    if (!selectedMethod) return;
    setStep(2);
    // Simulate payment processing
    setTimeout(() => {
      setStep(3);
      // Pass the success back after a short delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay, PhonePe)', icon: Smartphone, color: 'text-purple-500' },
    { id: 'card', name: 'Cards (Visa, Master, RuPay)', icon: CreditCard, color: 'text-blue-500' },
    { id: 'netbanking', name: 'Netbanking', icon: Building2, color: 'text-orange-500' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Razorpay-like Header */}
          <div className="bg-[#1a2536] p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg p-1">
                <img src={Logo} alt="AutoSureAI" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <p className="text-white text-xs font-bold uppercase tracking-wider">Checkout</p>
                <p className="text-gray-400 text-[10px]">AutoSureAI Inc.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Amount to pay</span>
                  <div className="flex items-center text-white text-2xl font-black">
                    <IndianRupee className="w-5 h-5" />
                    <span>{amount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Payment Methods</p>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        selectedMethod === method.id 
                          ? 'bg-blue-500/10 border-blue-500/50' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-slate-800 ${method.color}`}>
                          <method.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-white">{method.name}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${selectedMethod === method.id ? 'translate-x-1 text-blue-400' : ''}`} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePay}
                  disabled={!selectedMethod}
                  className="w-full py-4 bg-[#3395ff] hover:bg-[#2088ff] disabled:opacity-50 disabled:grayscale transition-all text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{amount}.00</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secure Payment</span>
                  </div>
                  <span>•</span>
                  <span>Powered by Razorpay</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="py-12 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                  />
                  <Clock className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Processing Payment</h3>
                  <p className="text-sm text-gray-400">Please do not refresh the page or click back</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/50">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Payment Successful</h3>
                  <p className="text-sm text-gray-400 transition-opacity animate-pulse">Submitting your accident report...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DummyPaymentModal;
