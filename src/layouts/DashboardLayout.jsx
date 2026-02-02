import { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

export const SidebarContext = createContext();
export function useSidebar() { return useContext(SidebarContext); }

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-slate-100 dark:bg-[#030712] transition-colors duration-300">
        {/* Premium Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-200/30 dark:from-indigo-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-gradient-to-b from-purple-300/10 dark:from-purple-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-gradient-to-t from-cyan-300/10 dark:from-cyan-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>
        
        <Sidebar />
        
        <motion.div 
          className="relative z-10 transition-all duration-300 ease-out"
          animate={{ marginLeft: isCollapsed ? 80 : 260 }}
        >
          <Navbar />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="p-8"
          >
            <Outlet />
          </motion.main>
        </motion.div>
      </div>
    </SidebarContext.Provider>
  );
}
