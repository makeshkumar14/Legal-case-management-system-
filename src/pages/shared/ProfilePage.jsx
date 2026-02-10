import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, Shield, Key, Bell, Palette, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false, hearings: true, documents: true, updates: true });
  const tabs = [{ id: 'profile', label: 'Profile', icon: User }, { id: 'security', label: 'Security', icon: Shield }, { id: 'notifications', label: 'Notifications', icon: Bell }, { id: 'preferences', label: 'Preferences', icon: Palette }];

  return (
    <div className="space-y-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Settings</motion.h1>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#1a1a2e] text-[#b4f461]' : 'text-[#6b6b80] hover:bg-white/80 dark:hover:bg-[#232338]'}`}>
              <tab.icon className="w-5 h-5" />{tab.label}</button>
          ))}
        </div>
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
              <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-6">Profile Information</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative"><div className="w-24 h-24 rounded-2xl bg-[#b4f461] flex items-center justify-center text-[#1a1a2e] text-3xl font-bold shadow-lg">{user?.name?.charAt(0) || 'U'}</div>
                  <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#1a1a2e] text-[#b4f461] shadow-lg"><Camera className="w-4 h-4" /></button></div>
                <div><h3 className="text-lg font-bold text-[#1a1a2e] dark:text-white">{user?.name}</h3><p className="text-sm text-[#b4f461] capitalize">{user?.role} Portal</p></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {[{ icon: User, label: 'Full Name', value: user?.name, type: 'text' }, { icon: Mail, label: 'Email', value: user?.email, type: 'email' }, { icon: Phone, label: 'Phone', value: '+91 98765 43210', type: 'tel' }].map(f => (
                  <div key={f.label}><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">{f.label}</label>
                    <div className="relative"><f.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
                      <input type={f.type} defaultValue={f.value} className="w-full pl-11 pr-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#b4f461]/30" /></div></div>
                ))}
                <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Role</label>
                  <input type="text" value={user?.role?.toUpperCase()} disabled className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#6b6b80] cursor-not-allowed" /></div>
              </div>
              <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#b4f461] text-[#1a1a2e] font-bold rounded-xl hover:bg-[#9ae04d] transition-all shadow-lg shadow-[#b4f461]/25"><Save className="w-4 h-4" />Save Changes</button>
            </motion.div>
          )}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
                <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  {['Current Password', 'New Password', 'Confirm Password'].map(label => (
                    <div key={label}><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">{label}</label>
                      <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
                        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-11 pr-12 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                  ))}
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#b4f461] text-[#1a1a2e] font-bold rounded-xl"><Key className="w-4 h-4" />Update Password</button>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
                <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-2">Two-Factor Authentication</h2>
                <p className="text-sm text-[#6b6b80] mb-4">Add an extra layer of security</p>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e]">
                  <div className="flex items-center gap-3"><Shield className={`w-5 h-5 ${twoFA ? 'text-[#2d6a25]' : 'text-[#6b6b80]'}`} /><span className="text-[#1a1a2e] dark:text-white font-medium">{twoFA ? 'Enabled' : 'Disabled'}</span></div>
                  <button onClick={() => setTwoFA(!twoFA)} className={`w-12 h-7 rounded-full transition-colors relative ${twoFA ? 'bg-[#b4f461]' : 'bg-[#e5e4df] dark:bg-[#2d2d45]'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform ${twoFA ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
              <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[{ key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' }, { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' }, { key: 'sms', label: 'SMS Alerts', desc: 'Critical alerts via SMS' }, { key: 'hearings', label: 'Hearing Reminders', desc: 'Get reminded before hearings' }, { key: 'documents', label: 'Document Updates', desc: 'When documents are uploaded' }, { key: 'updates', label: 'Case Updates', desc: 'Changes in case status' }].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e]">
                    <div><p className="text-[#1a1a2e] dark:text-white font-medium text-sm">{item.label}</p><p className="text-xs text-[#6b6b80]">{item.desc}</p></div>
                    <button onClick={() => setNotifications(p => ({...p, [item.key]: !p[item.key]}))} className={`w-12 h-7 rounded-full transition-colors relative ${notifications[item.key] ? 'bg-[#b4f461]' : 'bg-[#e5e4df] dark:bg-[#2d2d45]'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'preferences' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
              <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-white mb-6">App Preferences</h2>
              <div className="space-y-5 max-w-md">
                {[{ label: 'Language', options: ['English', 'हिन्दी (Hindi)', 'தமிழ் (Tamil)'] }, { label: 'Date Format', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] }, { label: 'Timezone', options: ['IST (UTC+5:30)'] }].map(f => (
                  <div key={f.label}><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">{f.label}</label>
                    <select className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                      {f.options.map(o => <option key={o} className="bg-white dark:bg-[#1a1a2e]">{o}</option>)}</select></div>
                ))}
                <button className="flex items-center gap-2 px-6 py-3 bg-[#b4f461] text-[#1a1a2e] font-bold rounded-xl"><Save className="w-4 h-4" />Save Preferences</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
