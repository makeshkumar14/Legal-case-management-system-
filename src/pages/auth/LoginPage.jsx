import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Briefcase, Building2, Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const roles = [
  { id: 'public', label: 'Citizen Portal', icon: User, desc: 'Track cases & hearings' },
  { id: 'advocate', label: 'Advocate Portal', icon: Briefcase, desc: 'Manage cases & evidence' },
  { id: 'court', label: 'Court Administration', icon: Building2, desc: 'Full administrative access' },
];

const defaultCredentials = {
  public: { email: 'rajesh@example.com', password: 'password123' },
  advocate: { email: 'priya@example.com', password: 'password123' },
  court: { email: 'court@example.com', password: 'password123' },
};

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    const creds = defaultCredentials[roleId];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await authAPI.login(email, password);
      const { user, token } = res.data;
      login(user, token);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-5xl">
        {/* Logo & Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#1a1a2e] mb-6 shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Scale className="w-10 h-10 text-[#b4f461]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] dark:text-white mb-3">
            Legal Case Management
          </h1>
          <p className="text-[#6b6b80] text-lg flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-[#b4f461]" /> Secure Digital Legal Infrastructure
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Role Selection */}
          <motion.div className="lg:col-span-2 space-y-4" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-sm font-medium text-[#6b6b80] uppercase tracking-wider mb-4">Select Access Level</p>
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                  selectedRole === role.id
                    ? 'bg-[#1a1a2e] border-[#b4f461] shadow-xl'
                    : 'bg-white/80 dark:bg-[#232338] border-[#e5e4df] dark:border-[#2d2d45] hover:border-[#b4f461]/50 hover:shadow-lg'
                }`}
              >
                <div className="relative flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    selectedRole === role.id 
                      ? 'bg-[#b4f461]' 
                      : 'bg-[#1a1a2e] dark:bg-[#2d2d45]'
                  }`}>
                    <role.icon className={`w-6 h-6 ${selectedRole === role.id ? 'text-[#1a1a2e]' : 'text-[#b4f461]'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-base ${
                      selectedRole === role.id ? 'text-white' : 'text-[#1a1a2e] dark:text-white'
                    }`}>{role.label}</h3>
                    <p className={`text-sm ${
                      selectedRole === role.id ? 'text-[#b4f461]' : 'text-[#6b6b80]'
                    }`}>{role.desc}</p>
                  </div>
                  {selectedRole === role.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-[#b4f461] flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-[#1a1a2e]" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Login Form */}
          <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <AnimatePresence mode="wait">
              {selectedRole ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  className="bg-white/90 dark:bg-[#1a1a2e] backdrop-blur-xl border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#b4f461] flex items-center justify-center">
                      {(() => { const R = roles.find(r => r.id === selectedRole)?.icon; return R ? <R className="w-5 h-5 text-[#1a1a2e]" /> : null; })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white">{roles.find(r => r.id === selectedRole)?.label}</h2>
                      <p className="text-sm text-[#6b6b80]">Enter credentials to continue</p>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                          className="w-full pl-12 pr-4 py-4 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/40 focus:border-[#b4f461] transition-all" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                          className="w-full pl-12 pr-14 py-4 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/40 focus:border-[#b4f461] transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#6b6b80] hover:text-[#b4f461] transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-[#e5e4df] dark:border-[#2d2d45] bg-[#f7f6f3] dark:bg-[#232338] text-[#b4f461] focus:ring-[#b4f461]/40 accent-[#b4f461]" />
                        Remember me
                      </label>
                      <button type="button" className="text-[#b4f461] hover:text-[#9ae04d] font-medium transition-colors">Forgot password?</button>
                    </div>

                    <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full py-4 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#b4f461]/25 disabled:opacity-50"
                    >
                      {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
                    </motion.button>
                  </form>
                  <p className="mt-6 text-center text-sm text-[#6b6b80]">Credentials auto-filled • Connected to MySQL</p>
                </motion.div>
              ) : (
                <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex items-center justify-center bg-white/60 dark:bg-[#1a1a2e]/60 backdrop-blur-lg border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-3xl p-8"
                >
                  <div className="text-center">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1a1a2e] dark:bg-[#232338] border-2 border-[#2d2d45] flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-[#b4f461]" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">Select Access Level</h3>
                    <p className="text-[#6b6b80]">Choose your portal from the left to continue</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div className="mt-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <p className="text-[#6b6b80] text-sm">© 2024 Legal Case Management System • Government of India</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
