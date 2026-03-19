import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Briefcase, Building2, Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Sparkles, Phone, UserPlus, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../components/shared/Toast';

const roles = [
  { id: 'public', label: 'Citizen Portal', icon: User, desc: 'Track cases & hearings' },
  { id: 'advocate', label: 'Advocate Portal', icon: Briefcase, desc: 'Manage cases & evidence' },
  { id: 'court', label: 'Court Administration', icon: Building2, desc: 'Full administrative access' },
];

export function SignupPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    citizenId: '',
    barCouncilId: '',
    specialization: '',
    experience: '',
    courtName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: selectedRole,
        ...(selectedRole === 'public' && { citizenId: formData.citizenId }),
        ...(selectedRole === 'advocate' && { 
          barCouncilId: formData.barCouncilId,
          specialization: formData.specialization,
          experience: formData.experience
        }),
        ...(selectedRole === 'court' && { courtName: formData.courtName }),
      };

      const res = await authAPI.register(payload);
      const { user, token } = res.data;
      login(user, token);
      addToast({ type: 'success', title: 'Registration Successful', message: 'Welcome to the platform!' });
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-5xl">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link to="/login" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a1a2e] mb-6 shadow-2xl hover:scale-105 transition-transform">
            <Scale className="w-8 h-8 text-[#b4f461]" />
          </Link>
          <h1 className="text-4xl font-bold text-[#1a1a2e] dark:text-white mb-2">Create Account</h1>
          <p className="text-[#6b6b80]">Join the digital legal infrastructure</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Role Selection */}
          <motion.div className="lg:col-span-2 space-y-4" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-sm font-medium text-[#6b6b80] uppercase tracking-wider mb-4">Select User Type</p>
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                  selectedRole === role.id
                    ? 'bg-[#1a1a2e] border-[#b4f461] shadow-xl'
                    : 'bg-white/80 dark:bg-[#232338] border-[#e5e4df] dark:border-[#2d2d45] hover:border-[#b4f461]/50'
                }`}
              >
                <div className="relative flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    selectedRole === role.id ? 'bg-[#b4f461]' : 'bg-[#1a1a2e] dark:bg-[#2d2d45]'
                  }`}>
                    <role.icon className={`w-5 h-5 ${selectedRole === role.id ? 'text-[#1a1a2e]' : 'text-[#b4f461]'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm ${selectedRole === role.id ? 'text-white' : 'text-[#1a1a2e] dark:text-white'}`}>{role.label}</h3>
                    <p className={`text-xs ${selectedRole === role.id ? 'text-[#b4f461]' : 'text-[#6b6b80]'}`}>{role.desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}
            
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8 }}
               className="p-4 rounded-2xl bg-[#b4f461]/10 border border-[#b4f461]/20 mt-6"
            >
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-[#b4f461] shrink-0" />
                <p className="text-xs text-[#1a1a2e] dark:text-[#b4f461]/80 leading-relaxed">
                  Your registration information will be verified by the system. Advocates must provide a valid Bar Council ID for professional portal access.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Signup Form */}
          <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <AnimatePresence mode="wait">
              {selectedRole ? (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/90 dark:bg-[#1a1a2e] backdrop-blur-xl border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#b4f461] flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-[#1a1a2e]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#1a1a2e] dark:text-white">Registration Details</h2>
                      <p className="text-xs text-[#6b6b80]">Complete your {selectedRole} profile</p>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="john@example.com"
                            className="w-full pl-10 pr-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Confirm Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                          <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                      </div>
                    </div>

                    <div className="h-px bg-[#e5e4df] dark:bg-[#2d2d45] my-2" />

                    {/* Role Specific Fields */}
                    {selectedRole === 'public' && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                         <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Citizen ID / Aadhar Number</label>
                         <div className="relative group">
                           <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                           <input type="text" name="citizenId" value={formData.citizenId} onChange={handleInputChange} required placeholder="CIT-2024-XXXX"
                             className="w-full pl-10 pr-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                         </div>
                       </motion.div>
                    )}

                    {selectedRole === 'advocate' && (
                       <div className="space-y-4">
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Bar Council ID</label>
                            <input type="text" name="barCouncilId" value={formData.barCouncilId} onChange={handleInputChange} required placeholder="BCI/STATE/YEAR/XXXX"
                              className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                          </motion.div>
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                              <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Specialization</label>
                              <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} required placeholder="e.g. Criminal Law"
                                className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                              <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Experience (Years)</label>
                              <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} required placeholder="8"
                                className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                            </motion.div>
                          </div>
                       </div>
                    )}

                    {selectedRole === 'court' && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                         <label className="block text-xs font-medium text-[#6b6b80] mb-1.5 ml-1">Court Name / jurisdiction</label>
                         <div className="relative group">
                           <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
                           <input type="text" name="courtName" value={formData.courtName} onChange={handleInputChange} required placeholder="District Court, Mumbai"
                             className="w-full pl-10 pr-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm focus:outline-none focus:border-[#b4f461] transition-all" />
                         </div>
                       </motion.div>
                    )}

                    <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#b4f461]/20 disabled:opacity-50 mt-4"
                    >
                      {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-5 h-5" /></>}
                    </motion.button>
                  </form>
                  
                  <p className="mt-4 text-center text-xs text-[#6b6b80]">
                    Already have an account? <Link to="/login" className="text-[#b4f461] hover:underline font-bold">Sign In</Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="role-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[450px] flex items-center justify-center bg-white/60 dark:bg-[#1a1a2e]/60 backdrop-blur-lg border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-3xl p-8"
                >
                  <div className="text-center">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#1a1a2e] dark:bg-[#232338] border-2 border-[#2d2d45] flex items-center justify-center">
                      <Scale className="w-8 h-8 text-[#b4f461]" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-[#1a1a2e] dark:text-white mb-2">Join the System</h3>
                    <p className="text-sm text-[#6b6b80] max-w-xs">Select your role from the left to begin the registration process.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div className="mt-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <p className="text-[#6b6b80] text-xs">© 2024 Legal Case Management System • Secure Encryption Enabled</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
