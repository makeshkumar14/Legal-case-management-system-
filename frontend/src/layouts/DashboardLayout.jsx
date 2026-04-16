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
      <div className="min-h-screen transition-colors duration-300">
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
