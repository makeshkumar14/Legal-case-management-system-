import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Briefcase, Building2, Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/mockData';

const roles = [
  { id: 'public', label: 'Citizen Portal', icon: User, desc: 'Track cases & hearings', gradient: 'from-cyan-500 via-blue-500 to-indigo-500' },
  { id: 'advocate', label: 'Advocate Portal', icon: Briefcase, desc: 'Manage cases & evidence', gradient: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { id: 'court', label: 'Court Administration', icon: Building2, desc: 'Full administrative access', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
];

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = users[selectedRole];
    if (user) { login(user); navigate(`/${selectedRole}`); }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-5xl">
        {/* Logo & Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-6 shadow-2xl shadow-indigo-500/25"
            animate={{ boxShadow: ['0 25px 50px -12px rgba(99,102,241,0.25)', '0 25px 50px -12px rgba(168,85,247,0.35)', '0 25px 50px -12px rgba(99,102,241,0.25)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Scale className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent mb-3">
            Legal Case Management
          </h1>
          <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Secure Digital Legal Infrastructure
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Role Selection */}
          <motion.div className="lg:col-span-2 space-y-4" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Select Access Level</p>
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left group relative overflow-hidden ${
                  selectedRole === role.id
                    ? 'bg-white/10 border-white/20 shadow-xl shadow-indigo-500/10'
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                {selectedRole === role.id && (
                  <motion.div layoutId="selected" className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-10`} />
                )}
                <div className="relative flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg`}>
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-base">{role.label}</h3>
                    <p className="text-sm text-slate-400">{role.desc}</p>
                  </div>
                  {selectedRole === role.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
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
                  className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roles.find(r => r.id === selectedRole)?.gradient} flex items-center justify-center`}>
                      {(() => { const R = roles.find(r => r.id === selectedRole)?.icon; return R ? <R className="w-5 h-5 text-white" /> : null; })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{roles.find(r => r.id === selectedRole)?.label}</h2>
                      <p className="text-sm text-slate-400">Enter credentials to continue</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                          className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                          className="w-full pl-12 pr-14 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/40" />
                        Remember me
                      </label>
                      <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
                    </div>

                    <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-right text-white font-semibold rounded-xl transition-all duration-500 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 disabled:opacity-50"
                    >
                      {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
                    </motion.button>
                  </form>
                  <p className="mt-6 text-center text-sm text-slate-500">Demo mode — Enter any credentials</p>
                </motion.div>
              ) : (
                <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex items-center justify-center bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] rounded-3xl p-8"
                >
                  <div className="text-center">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-slate-600" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">Select Access Level</h3>
                    <p className="text-slate-600">Choose your portal from the left to continue</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div className="mt-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <p className="text-slate-600 text-sm">© 2024 Legal Case Management System • Government of India</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
