import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Briefcase, Eye, EyeOff, ArrowRight, Shield, Sparkles, Phone, Fingerprint, Hash, Mail, Award, UserPlus } from 'lucide-react';
import { citizenRegister, advocateRegister } from '../../services/api';

const roles = [
  { id: 'public', label: 'Citizen Registration', icon: User, desc: 'Register with Aadhaar number' },
  { id: 'advocate', label: 'Advocate Registration', icon: Briefcase, desc: 'Register with Bar Council ID' },
];

export function SignupPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Citizen state
  const [citizenName, setCitizenName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');

  // Advocate state
  const [advName, setAdvName] = useState('');
  const [barCouncilId, setBarCouncilId] = useState('');
  const [advEmail, setAdvEmail] = useState('');
  const [advPhone, setAdvPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [advPassword, setAdvPassword] = useState('');
  const [advConfirmPassword, setAdvConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setCitizenName(''); setAadhaar(''); setCitizenPhone('');
    setAdvName(''); setBarCouncilId(''); setAdvEmail(''); setAdvPhone('');
    setSpecialization(''); setAdvPassword(''); setAdvConfirmPassword('');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    resetForm();
  };

  const inputClass = "w-full pl-12 pr-4 py-4 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/40 focus:border-[#b4f461] transition-all";

  // ── Citizen Signup ──
  const handleCitizenSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!citizenName || !aadhaar || !citizenPhone) {
      setError('All fields are required');
      return;
    }
    if (aadhaar.length !== 12) { setError('Aadhaar number must be 12 digits'); return; }
    if (citizenPhone.length !== 10) { setError('Phone number must be 10 digits'); return; }

    setIsLoading(true);
    try {
      await citizenRegister(citizenName, aadhaar, citizenPhone);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // ── Advocate Signup ──
  const handleAdvocateSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!advName || !barCouncilId || !advPassword) {
      setError('Name, Bar Council ID, and password are required');
      return;
    }
    if (advPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (advPassword !== advConfirmPassword) { setError('Passwords do not match'); return; }

    setIsLoading(true);
    try {
      await advocateRegister({
        name: advName,
        barCouncilId,
        email: advEmail,
        phone: advPhone,
        specialization,
        password: advPassword,
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // ── Citizen Form ──
  const renderCitizenForm = () => (
    <form onSubmit={handleCitizenSignup} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Full Name</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type="text" value={citizenName} onChange={(e) => setCitizenName(e.target.value)}
            placeholder="Enter your full name" className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Aadhaar Number</label>
        <div className="relative group">
          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="12-digit Aadhaar number" className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Phone Number</label>
        <div className="relative group">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type="text" value={citizenPhone} onChange={(e) => setCitizenPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit phone number" className={inputClass}
          />
        </div>
      </div>
      <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full py-4 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#b4f461]/25 disabled:opacity-50"
      >
        {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Register</span><UserPlus className="w-5 h-5" /></>}
      </motion.button>
    </form>
  );

  // ── Advocate Form ──
  const renderAdvocateForm = () => (
    <form onSubmit={handleAdvocateSignup} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Full Name *</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
            <input type="text" value={advName} onChange={(e) => setAdvName(e.target.value)}
              placeholder="Adv. Full Name" className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Bar Council ID *</label>
          <div className="relative group">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
            <input type="text" value={barCouncilId} onChange={(e) => setBarCouncilId(e.target.value)}
              placeholder="BCI/STATE/YEAR/NUM" className={inputClass}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
            <input type="email" value={advEmail} onChange={(e) => setAdvEmail(e.target.value)}
              placeholder="email@example.com" className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Phone</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
            <input type="text" value={advPhone} onChange={(e) => setAdvPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit phone" className={inputClass}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Specialization</label>
        <div className="relative group">
          <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Civil Law, Criminal Law" className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Password *</label>
          <div className="relative group">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
            <input type={showPassword ? 'text' : 'password'} value={advPassword} onChange={(e) => setAdvPassword(e.target.value)}
              placeholder="Min 6 characters" className={`${inputClass} !pr-14`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#6b6b80] hover:text-[#b4f461] transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Confirm Password *</label>
          <div className="relative group">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
            <input type={showPassword ? 'text' : 'password'} value={advConfirmPassword} onChange={(e) => setAdvConfirmPassword(e.target.value)}
              placeholder="Re-enter password" className={inputClass}
            />
          </div>
        </div>
      </div>
      <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full py-4 px-6 bg-[#b4f461] hover:bg-[#9ae04d] text-[#1a1a2e] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-[#b4f461]/25 disabled:opacity-50"
      >
        {isLoading ? <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" /> : <><span>Register</span><UserPlus className="w-5 h-5" /></>}
      </motion.button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-5xl">
        {/* Logo & Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#1a1a2e] mb-6 shadow-2xl" whileHover={{ scale: 1.05, rotate: 5 }}>
            <Scale className="w-10 h-10 text-[#b4f461]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] dark:text-white mb-3">Create Account</h1>
          <p className="text-[#6b6b80] text-lg flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-[#b4f461]" /> Register for Legal Case Management System
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Role Selection */}
          <motion.div className="lg:col-span-2 space-y-4" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-sm font-medium text-[#6b6b80] uppercase tracking-wider mb-4">Select Registration Type</p>
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
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

            <div className="mt-6 p-4 bg-white/60 dark:bg-[#232338]/60 border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-2xl">
              <p className="text-sm text-[#6b6b80]">
                <span className="font-medium text-[#1a1a2e] dark:text-white">Court Administrators</span> are pre-registered by the system. Contact the IT department for admin credentials.
              </p>
            </div>
          </motion.div>

          {/* Signup Form */}
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
                      <p className="text-sm text-[#6b6b80]">Fill in the details below</p>
                    </div>
                  </div>

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

                  {selectedRole === 'public' ? renderCitizenForm() : renderAdvocateForm()}

                  <p className="mt-6 text-center text-sm text-[#6b6b80]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#b4f461] hover:text-[#9ae04d] font-medium transition-colors">Sign In</Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex items-center justify-center bg-white/60 dark:bg-[#1a1a2e]/60 backdrop-blur-lg border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-3xl p-8"
                >
                  <div className="text-center">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1a1a2e] dark:bg-[#232338] border-2 border-[#2d2d45] flex items-center justify-center">
                      <UserPlus className="w-8 h-8 text-[#b4f461]" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">Select Registration Type</h3>
                    <p className="text-[#6b6b80]">Choose your role to begin registration</p>
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
