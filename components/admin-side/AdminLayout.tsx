import React, { useState, useEffect } from 'react';
import { ViewState } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    Settings, LogOut, Bell, Search, Menu, AlertTriangle, LayoutDashboard, MapPin, Users
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface AdminLayoutProps {
    currentView: ViewState;
    setCurrentView: (view: ViewState) => void;
    children: React.ReactNode;
    onLogout: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 border-l-2
        ${active ? 'active-nav-item' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
    >
        <div className={`${active ? 'text-primary dark:text-blue-500' : 'text-current'}`}>
            {icon}
        </div>
        <span>{label}</span>
    </button>
);

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentView, setCurrentView, children, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        // Initialize theme on mount
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b1121] text-slate-900 dark:text-white transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed md:relative z-50 w-64 h-full bg-white dark:bg-transparent dark:glass-panel border-r border-slate-200 dark:border-white/5 flex flex-col transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary dark:bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-lg text-white">W</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Wynxsmapp <span className="text-primary dark:text-blue-500">Admin</span></span>
                </div>

                <div className="w-full h-[1px] bg-slate-100 dark:bg-gradient-to-r dark:from-transparent dark:via-white/10 dark:to-transparent my-2" />

                <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <NavItem 
                        icon={<LayoutDashboard size={18} />} 
                        label="Dashboard" 
                        active={currentView === ViewState.DASHBOARD}
                        onClick={() => { setCurrentView(ViewState.DASHBOARD); setSidebarOpen(false); }}
                    />
                    <NavItem 
                        icon={<MapPin size={18} />} 
                        label="Stations" 
                        active={currentView === ViewState.STATIONS}
                        onClick={() => { setCurrentView(ViewState.STATIONS); setSidebarOpen(false); }}
                    />
                    <NavItem 
                        icon={<Users size={18} />} 
                        label="Users" 
                        active={currentView === ViewState.USERS}
                        onClick={() => { setCurrentView(ViewState.USERS); setSidebarOpen(false); }}
                    />
                    <NavItem 
                        icon={<Settings size={18} />} 
                        label="Settings" 
                        active={currentView === ViewState.SETTINGS}
                        onClick={() => { setCurrentView(ViewState.SETTINGS); setSidebarOpen(false); }}
                    />
                    {/* Categories will be added here later */}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-white/5">
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Confirm Logout"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-500 dark:text-red-400" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Are you sure you want to logout?</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        You will be returned to the login screen. Any unsaved changes may be lost.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setIsLogoutModalOpen(false);
                                onLogout();
                            }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                {/* Background Blobs (Dark mode only) */}
                <div className="hidden dark:block absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
                <div className="hidden dark:block absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />

                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-slate-200 dark:border-white/5 z-10 bg-white/80 dark:bg-[#0b1121]/50 backdrop-blur-md sticky top-0">
                    <div className="flex items-center gap-4">
                        <button 
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white md:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden md:flex items-center text-sm">
                            <span className="text-primary dark:text-blue-500 font-medium">Wynxsmapp Admin</span>
                            <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>
                            <span className="text-slate-900 dark:text-white capitalize">{currentView.toLowerCase().replace('_', ' ')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-full px-4 py-2 border border-slate-200 dark:border-white/5 focus-within:border-primary/50 dark:focus-within:border-blue-500/50 transition-colors">
                            <Search size={16} className="text-slate-400 mr-2" />
                            <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm text-slate-700 dark:text-white w-40 placeholder-slate-400 dark:placeholder-slate-500" />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white relative p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0b1121]" />
                            </button>
                            <button 
                                onClick={() => setCurrentView(ViewState.SETTINGS)}
                                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <Settings size={20} />
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Admin User</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Admin</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 dark:from-blue-400 dark:to-indigo-500 p-[2px] shadow-lg shadow-blue-500/20">
                                    <img 
                                        src="https://picsum.photos/id/64/100/100" 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0b1121]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 z-10 scroll-smooth custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};
