import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Globe, Lock, Mail, Palette, Phone, Save, Shield, User } from 'lucide-react';
import { updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getRoleTheme } from '../../utils/roleTheme';

const preferenceStorageKey = 'legalcms:user-preferences';

function loadStoredPreferences() {
  try {
    return JSON.parse(localStorage.getItem(preferenceStorageKey) || '{}');
  } catch {
    return {};
  }
}

export function ProfilePage() {
  const { user, token, login } = useAuth();
  const theme = getRoleTheme(user?.role);

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    experience: '',
    courtName: '',
  });
  const [preferences, setPreferences] = useState({
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'IST (UTC+5:30)',
    notifications: {
      hearings: true,
      documents: true,
      updates: true,
    },
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      specialization: user?.specialization || '',
      experience: user?.experience || '',
      courtName: user?.courtName || '',
    });
    setPreferences((prev) => ({
      ...prev,
      ...loadStoredPreferences(),
      notifications: {
        ...prev.notifications,
        ...loadStoredPreferences().notifications,
      },
    }));
  }, [user]);

  const tabs = useMemo(
    () => [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'preferences', label: 'Preferences', icon: Palette },
      { id: 'security', label: 'Security', icon: Shield },
    ],
    []
  );

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
      };

      if (user?.role === 'advocate') {
        payload.specialization = profileForm.specialization;
        payload.experience = profileForm.experience;
      }

      if (user?.role === 'court') {
        payload.courtName = profileForm.courtName;
      }

      const response = await updateProfile(payload);
      const updatedUser = response.user || response;
      login(updatedUser, token);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = () => {
    localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
    setMessage('Preferences saved locally for this browser.');
  };

  return (
    <div className="space-y-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">
        Settings
      </motion.h1>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? `${theme.accentBg} text-white` : 'text-[#6b6b80] hover:bg-white/80 dark:hover:bg-[#232338]'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {message && (
            <div className={['mb-4 px-4 py-3 rounded-xl text-sm font-medium', theme.accentSoftBg, theme.accentSoftText].join(' ')}>
              {message}
            </div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
              <div className="flex items-center gap-5 mb-8">
                <div className={['w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg', theme.accentBg].join(' ')}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white">{user?.name}</h2>
                  <p className={`text-sm font-medium capitalize ${theme.accentText}`}>{user?.role} portal</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Full Name</span>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
                    <input value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full pl-11 pr-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none" />
                  </div>
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Email</span>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
                    <input value={user?.email || 'Not provided'} disabled className="w-full pl-11 pr-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#6b6b80]" />
                  </div>
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Phone</span>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
                    <input value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full pl-11 pr-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none" />
                  </div>
                </label>

                {user?.role === 'public' && (
                  <label className="block">
                    <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Aadhaar Number</span>
                    <input value={user?.aadhaarNumber || 'Not available'} disabled className="w-full px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#6b6b80]" />
                  </label>
                )}

                {user?.role === 'advocate' && (
                  <>
                    <label className="block">
                      <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Specialization</span>
                      <input value={profileForm.specialization} onChange={(e) => setProfileForm((prev) => ({ ...prev, specialization: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none" />
                    </label>
                    <label className="block">
                      <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Experience</span>
                      <input value={profileForm.experience} onChange={(e) => setProfileForm((prev) => ({ ...prev, experience: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none" />
                    </label>
                  </>
                )}

                {user?.role === 'court' && (
                  <label className="block md:col-span-2">
                    <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Court Name</span>
                    <input value={profileForm.courtName} onChange={(e) => setProfileForm((prev) => ({ ...prev, courtName: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none" />
                  </label>
                )}
              </div>

              <button onClick={saveProfile} disabled={saving} className={['mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg', theme.accentBg, theme.accentHoverBg, theme.shadow].join(' ')}>
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm space-y-5">
              <div className="grid md:grid-cols-3 gap-5">
                <label className="block">
                  <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Language</span>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
                    <select value={preferences.language} onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value }))} className="w-full pl-11 pr-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Tamil</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Date Format</span>
                  <select value={preferences.dateFormat} onChange={(e) => setPreferences((prev) => ({ ...prev, dateFormat: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Timezone</span>
                  <select value={preferences.timezone} onChange={(e) => setPreferences((prev) => ({ ...prev, timezone: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none">
                    <option>IST (UTC+5:30)</option>
                    <option>UTC</option>
                  </select>
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </h3>
                {[
                  ['hearings', 'Hearing reminders'],
                  ['documents', 'Document updates'],
                  ['updates', 'Case status updates'],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[#f7f6f3]">
                    <span className="text-sm font-medium text-[#1a1a2e]">{label}</span>
                    <button onClick={() => setPreferences((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: !prev.notifications[key] } }))} className={`w-12 h-7 rounded-full transition-colors relative ${preferences.notifications[key] ? theme.accentBg : 'bg-[#d7d6d1]'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform ${preferences.notifications[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={savePreferences} className={['flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg', theme.accentBg, theme.accentHoverBg, theme.shadow].join(' ')}>
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm space-y-5">
              <div className="p-5 rounded-2xl bg-[#f7f6f3]">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className={`w-5 h-5 ${theme.accentText}`} />
                  <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">Account Security</h3>
                </div>
                <p className="text-sm text-[#6b6b80]">
                  Authentication for this project is currently handled by the login flow for your role. Password changes and OTP policies are managed by the backend auth endpoints and seed/demo credentials.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-[#f7f6f3]">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className={`w-5 h-5 ${theme.accentText}`} />
                  <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">Recommended Practice</h3>
                </div>
                <p className="text-sm text-[#6b6b80]">
                  For production use, switch the default JWT secret to a strong 32-byte value or longer and replace demo login credentials with environment-managed secrets.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
