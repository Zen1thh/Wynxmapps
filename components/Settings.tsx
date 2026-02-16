import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/Card';
import gsap from 'gsap';
import { 
    User, Bell, Shield, Key, Mail, Smartphone, Globe, Moon, Sun, Save, 
    Palette, LogOut, Monitor
} from 'lucide-react';

export const Settings: React.FC = () => {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Initialize state based on current document class
        setIsDarkMode(document.documentElement.classList.contains('dark'));

        const ctx = gsap.context(() => {
            gsap.fromTo(".setting-section", 
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [activeTab]);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    const toggleTheme = (checked: boolean) => {
        setIsDarkMode(checked);
        if (checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange?: (val: boolean) => void }) => (
        <button 
            type="button"
            onClick={() => onChange && onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${checked ? 'bg-primary dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 space-y-2">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <User size={18} /> Profile & Account
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <Bell size={18} /> Notifications
                    </button>
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'appearance' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <Palette size={18} /> Appearance
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <Shield size={18} /> Security
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <Card className="min-h-[500px]">
                        {activeTab === 'profile' && (
                            <div className="space-y-8 setting-section">
                                <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
                                    <div className="relative">
                                        <img src="https://picsum.photos/id/64/150/150" alt="Avatar" className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-xl" />
                                        <button className="absolute bottom-0 right-0 p-1.5 bg-primary dark:bg-blue-600 rounded-full text-white border-4 border-white dark:border-slate-800 hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors">
                                            <User size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mark Johnson</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Super Administrator</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">ID: usr_000_123</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Display Name</label>
                                        <input type="text" defaultValue="Mark Johnson" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                                        <input type="email" defaultValue="mark.admin@wynx.com" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Phone Number</label>
                                        <input type="text" defaultValue="+63 917 123 4567" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Language</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none">
                                            <option>English (US)</option>
                                            <option>Filipino</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 setting-section">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Notification Preferences</h3>
                                
                                <div className="space-y-4">
                                    {[
                                        { title: "Booking Alerts", desc: "Receive alerts when a booking is created or cancelled." },
                                        { title: "Station Status", desc: "Get notified if a station goes offline." },
                                        { title: "User Reports", desc: "Alerts for new user feedback or flagged content." },
                                        { title: "System Updates", desc: "Notifications about Wynxsmapp system maintenance." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs">{item.desc}</p>
                                            </div>
                                            <Toggle checked={i < 3} />
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Delivery Channels</h4>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                                            <Mail size={16} /> Email
                                        </label>
                                        <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                                            <Smartphone size={16} /> Push Notifications
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6 setting-section">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Theme Preferences</h3>
                                
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 space-y-6">
                                    {/* Dark Mode Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-100 text-accent'}`}>
                                                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs">
                                                    {isDarkMode ? 'Dark theme is currently enabled' : 'Light theme is currently enabled'}
                                                </p>
                                            </div>
                                        </div>
                                        <Toggle checked={isDarkMode} onChange={toggleTheme} />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 mt-4">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Accent Color</h4>
                                    <div className="flex gap-3">
                                        {['bg-blue-600', 'bg-emerald-500', 'bg-purple-600', 'bg-rose-500', 'bg-amber-500'].map((color, i) => (
                                            <button 
                                                key={i} 
                                                className={`w-8 h-8 rounded-full ${color} border-2 ${i === 0 ? 'border-slate-300 dark:border-white ring-2 ring-blue-500/20 dark:ring-white/20' : 'border-transparent opacity-60 hover:opacity-100'} transition-all`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                         {activeTab === 'security' && (
                            <div className="space-y-6 setting-section">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Security & Authentication</h3>
                                
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Key className="text-amber-500 dark:text-amber-400" size={20} />
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Password</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs">Last changed 3 months ago</p>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">Change</button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Shield className="text-emerald-500 dark:text-emerald-400" size={20} />
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Authentication</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs">Added layer of security for your account</p>
                                            </div>
                                        </div>
                                        <Toggle checked={true} />
                                    </div>
                                </div>

                                <div className="pt-6 mt-8 border-t border-slate-100 dark:border-white/5">
                                    <button className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 text-sm font-bold transition-colors">
                                        <LogOut size={16} /> Sign out of all devices
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};