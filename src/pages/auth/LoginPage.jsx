import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Briefcase, Building2, Eye, EyeOff, ArrowRight, Shield, Sparkles, KeyRound, Fingerprint, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { citizenSendOtp, citizenVerifyOtp, advocateLogin, adminLogin } from '../../services/api';

const roles = [
  { id: 'public', label: 'Citizen Portal', icon: User, desc: 'Login with Aadhaar + OTP' },
  { id: 'advocate', label: 'Advocate Portal', icon: Briefcase, desc: 'Login with Registration ID' },
  { id: 'court', label: 'Court Administration', icon: Building2, desc: 'Admin ID + Password' },
];

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Citizen state
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Advocate state
  const [barCouncilId, setBarCouncilId] = useState('');
  const [advocatePassword, setAdvocatePassword] = useState('');
  const [showAdvPassword, setShowAdvPassword] = useState(false);

  // Admin state
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setAadhaar('');
    setOtp('');
    setOtpSent(false);
    setSimulatedOtp('');
    setBarCouncilId('');
    setAdvocatePassword('');
    setAdminId('');
    setAdminPassword('');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    resetForm();
  };

  // ── Citizen: Send OTP ──
  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    if (!aadhaar || aadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    setIsLoading(true);
    try {
      const data = await citizenSendOtp(aadhaar);
      setOtpSent(true);
      setSimulatedOtp(data.otp);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // ── Citizen: Verify OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) { setError('Please enter the OTP'); return; }
    setIsLoading(true);
    try {
      const data = await citizenVerifyOtp(aadhaar, otp);
      login(data.user, data.token);
      navigate('/public');
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // ── Advocate: Login ──
  const handleAdvocateLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!barCouncilId || !advocatePassword) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const data = await advocateLogin(barCouncilId, advocatePassword);
      login(data.user, data.token);
      navigate('/advocate');
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // ── Admin: Login ──
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!adminId || !adminPassword) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const data = await adminLogin(adminId, adminPassword);
      login(data.user, data.token);
      navigate('/court');
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const inputClass = "w-full pl-12 pr-4 py-4 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/40 focus:border-[#b4f461] transition-all";

  // ── Citizen Login Form ──
  const renderCitizenForm = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Aadhaar Number</label>
        <div className="relative group">
          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input
            type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Enter 12-digit Aadhaar number"
            className={inputClass} disabled={otpSent}
          />
        </div>
      </div>

      {!otpSent ? (
        <motion.button type="button" onClick={handleSendOtp} disabled={isLoading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="w-full py-4 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#b4f461]/25 disabled:opacity-50"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Send OTP</span><ArrowRight className="w-5 h-5" /></>}
        </motion.button>
      ) : (
        <>
          {simulatedOtp && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#b4f461]/15 border-2 border-[#b4f461]/30 rounded-xl text-center"
            >
              <p className="text-sm text-[#6b6b80] mb-1">🔐 Simulated OTP (for demo)</p>
              <p className="text-3xl font-mono font-bold text-[#1a1a2e] dark:text-white tracking-[0.3em]">{simulatedOtp}</p>
            </motion.div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Enter OTP</label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
              <input
                type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP" className={inputClass} autoFocus
              />
            </div>
          </div>
          <motion.button type="submit" disabled={isLoading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full py-4 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#b4f461]/25 disabled:opacity-50"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Verify & Sign In</span><ArrowRight className="w-5 h-5" /></>}
          </motion.button>
          <button type="button" onClick={() => { setOtpSent(false); setSimulatedOtp(''); setOtp(''); setError(''); setSuccess(''); }}
            className="w-full text-sm text-[#6b6b80] hover:text-[#b4f461] transition-colors"
          >
            ← Change Aadhaar number
          </button>
        </>
      )}
    </form>
  );

  // ── Advocate Login Form ──
  const renderAdvocateForm = () => (
    <form onSubmit={handleAdvocateLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Bar Council Registration ID</label>
        <div className="relative group">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type="text" value={barCouncilId} onChange={(e) => setBarCouncilId(e.target.value)}
            placeholder="e.g. BCI/MAH/2019/4521" className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Password</label>
        <div className="relative group">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type={showAdvPassword ? 'text' : 'password'} value={advocatePassword} onChange={(e) => setAdvocatePassword(e.target.value)}
            placeholder="••••••••" className={`${inputClass} !pr-14`}
          />
          <button type="button" onClick={() => setShowAdvPassword(!showAdvPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#6b6b80] hover:text-[#b4f461] transition-colors">
            {showAdvPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full py-4 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#b4f461]/25 disabled:opacity-50"
      >
        {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
      </motion.button>
    </form>
  );

  // ── Admin Login Form ──
  const renderAdminForm = () => (
    <form onSubmit={handleAdminLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Admin ID</label>
        <div className="relative group">
          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)}
            placeholder="e.g. ADMIN001" className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Password</label>
        <div className="relative group">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type={showAdminPassword ? 'text' : 'password'} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="••••••••" className={`${inputClass} !pr-14`}
          />
          <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#6b6b80] hover:text-[#b4f461] transition-colors">
            {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full py-4 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#b4f461]/25 disabled:opacity-50"
      >
        {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
      </motion.button>
    </form>
  );

  const renderForm = () => {
    switch (selectedRole) {
      case 'public': return renderCitizenForm();
      case 'advocate': return renderAdvocateForm();
      case 'court': return renderAdminForm();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-5xl">
        {/* Logo & Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#1a1a2e] mb-6 shadow-2xl" whileHover={{ scale: 1.05, rotate: 5 }}>
            <Scale className="w-10 h-10 text-[#b4f461]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] dark:text-white mb-3">Legal Case Management</h1>
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
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                  selectedRole === role.id
                    ? 'bg-[#1a1a2e] border-[#b4f461] shadow-xl'
                    : 'bg-white/80 dark:bg-[#232338] border-[#e5e4df] dark:border-[#2d2d45] hover:border-[#b4f461]/50 hover:shadow-lg'
                }`}
              >
                <div className="relative flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    selectedRole === role.id ? 'bg-[#b4f461]' : 'bg-[#1a1a2e] dark:bg-[#2d2d45]'
                  }`}>
                    <role.icon className={`w-6 h-6 ${selectedRole === role.id ? 'text-[#1a1a2e]' : 'text-[#b4f461]'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-base ${selectedRole === role.id ? 'text-white' : 'text-[#1a1a2e] dark:text-white'}`}>{role.label}</h3>
                    <p className={`text-sm ${selectedRole === role.id ? 'text-[#b4f461]' : 'text-[#6b6b80]'}`}>{role.desc}</p>
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
                <motion.div key={`form-${selectedRole}`}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  className="bg-white/90 dark:bg-[#1a1a2e] backdrop-blur-xl border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#b4f461] flex items-center justify-center">
                      {(() => { const R = roles.find(r => r.id === selectedRole)?.icon; return R ? <R className="w-5 h-5 text-[#1a1a2e]" /> : null; })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white">{roles.find(r => r.id === selectedRole)?.label}</h2>
                      <p className="text-sm text-[#6b6b80]">
                        {selectedRole === 'public' ? 'Login with Aadhaar & OTP verification' :
                         selectedRole === 'advocate' ? 'Login with Bar Council ID & password' :
                         'Login with Admin ID & password'}
                      </p>
                    </div>
                  </div>

                  {/* Error / Success messages */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 bg-red-500/10 border-2 border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium"
                    >{error}</motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 bg-green-500/10 border-2 border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium"
                    >{success}</motion.div>
                  )}

                  {renderForm()}

                  {selectedRole !== 'court' && (
                    <p className="mt-6 text-center text-sm text-[#6b6b80]">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-[#b4f461] hover:text-[#9ae04d] font-medium transition-colors">Sign Up</Link>
                    </p>
                  )}
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
