import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { MOCK_USERS } from '../constants';
import { User } from '../types';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    Search, MoreHorizontal, UserPlus, Filter, Shield, ShieldAlert, 
    User as UserIcon, Check, X, Mail, Phone, Calendar, Clock, 
    Loader2, Trash2, Edit2, AlertTriangle, ChevronRight, CheckCircle2,
    XCircle, Ban, History, CreditCard, ChevronLeft, ChevronRight as ChevronRightIcon,
    Zap, Layers, ChevronDown, Power, PowerOff, Lock
} from 'lucide-react';

// --- Components ---

// Toast Notification
const Toast: React.FC<{ message: string; type: 'success' | 'loading' | 'error'; onClose?: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        if (type !== 'loading') {
            const timer = setTimeout(() => onClose && onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [type, onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${
                type === 'loading' 
                ? 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/20 text-primary dark:text-blue-200' 
                : type === 'error' 
                ? 'bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-200'
                : 'bg-emerald-50/90 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-200'
            }`}>
                {type === 'loading' ? <Loader2 size={18} className="animate-spin text-primary dark:text-blue-400" /> : 
                 type === 'error' ? <AlertTriangle size={14} className="text-red-500 dark:text-red-400" /> :
                 <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={14} className="text-emerald-500 dark:text-emerald-400" /></div>}
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

// Summary Stat Card
const StatCard: React.FC<{ label: string; value: string; trend: string; trendUp: boolean; icon: React.ReactNode; color: string }> = ({ label, value, trend, trendUp, icon, color }) => (
    <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
        <div className={`absolute right-2 top-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-lg ${color}`}>
            {icon}
        </div>
        <div className="relative z-10 mt-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{label}</p>
            <div className={`flex items-center gap-1 text-xs font-bold mt-3 ${trendUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {trendUp ? '+' : ''}{trend}
                <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">vs last month</span>
            </div>
        </div>
    </div>
);

export const Users: React.FC = () => {
    const containerRef = useRef(null);
    const tableRef = useRef(null);
    const statusFilterRef = useRef<HTMLDivElement>(null);
    const dateFilterRef = useRef<HTMLDivElement>(null);

    // State
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All'); 
    
    // Filter States
    const [statusFilter, setStatusFilter] = useState('All');
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
    
    const [dateRangeLabel, setDateRangeLabel] = useState('All Time');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    
    // Selection State
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // For Drawer
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    
    // Action Target State
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

    // Form States
    const [newUserForm, setNewUserForm] = useState({
        name: '', email: '', role: 'User', plan: 'Free', phoneNumber: '', password: ''
    });

    const [toast, setToast] = useState<{ message: string, type: 'success' | 'loading' | 'error' } | null>(null);

    const ITEMS_PER_PAGE = 8;

    // Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".stat-card", 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
            gsap.fromTo(tableRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
                setActiveDropdownId(null);
            }
            if (statusFilterRef.current && !statusFilterRef.current.contains(target)) {
                setIsStatusFilterOpen(false);
            }
            if (dateFilterRef.current && !dateFilterRef.current.contains(target)) {
                setIsDateFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset page on tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, statusFilter, searchQuery, dateFilter]);

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesTab = activeTab === 'All' || user.role === activeTab;
            const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

            let matchesDate = true;
            if (dateFilter.start && user.joinDate < dateFilter.start) matchesDate = false;
            if (dateFilter.end && user.joinDate > dateFilter.end) matchesDate = false;

            return matchesSearch && matchesTab && matchesStatus && matchesDate;
        });
    }, [users, searchQuery, activeTab, statusFilter, dateFilter]);

    // Date Range Logic
    const handleDateRangeSelect = (range: string) => {
        const today = new Date();
        const formatDate = (d: Date) => d.toISOString().split('T')[0];
        let start = '';
        let end = '';

        switch(range) {
            case 'Today':
                start = formatDate(today);
                end = formatDate(today);
                break;
            case 'Last 7 Days':
                const last7 = new Date(today);
                last7.setDate(last7.getDate() - 7);
                start = formatDate(last7);
                end = formatDate(today);
                break;
            case 'Last 30 Days':
                const last30 = new Date(today);
                last30.setDate(last30.getDate() - 30);
                start = formatDate(last30);
                end = formatDate(today);
                break;
            case 'This Month':
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                start = formatDate(firstDay);
                end = formatDate(today);
                break;
            case 'All Time':
            default:
                start = '';
                end = '';
                break;
        }

        setDateFilter({ start, end });
        setDateRangeLabel(range);
        setIsDateFilterOpen(false);
    };

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const currentUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Stats & Tab Counts Logic
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        admins: users.filter(u => u.role.includes('Admin')).length,
        subscribers: users.filter(u => u.role === 'Subscriber').length,
        
        // Specific Counts for Tabs
        countSuperAdmin: users.filter(u => u.role === 'Super Admin').length,
        countAdmin: users.filter(u => u.role === 'Admin').length,
        countSubscriber: users.filter(u => u.role === 'Subscriber').length,
        countUser: users.filter(u => u.role === 'User').length
    }), [users]);

    // Tab Configuration
    const tabs = [
        { id: 'All', label: 'All Users', count: stats.total, icon: <Layers size={14} /> },
        { id: 'Super Admin', label: 'Super Admins', count: stats.countSuperAdmin, icon: <ShieldAlert size={14} /> },
        { id: 'Admin', label: 'Admins', count: stats.countAdmin, icon: <Shield size={14} /> },
        { id: 'Subscriber', label: 'Subscribers', count: stats.countSubscriber, icon: <Zap size={14} /> },
        { id: 'User', label: 'Regular Users', count: stats.countUser, icon: <UserIcon size={14} /> },
    ];

    // --- Actions ---

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `usr_${Date.now()}`,
            name: newUserForm.name,
            email: newUserForm.email,
            role: newUserForm.role as any,
            status: 'Active',
            subscriptionPlan: newUserForm.plan as any,
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
            lastLogin: 'Never',
            joinDate: new Date().toISOString().split('T')[0],
            phoneNumber: newUserForm.phoneNumber
        };
        
        setUsers([newUser, ...users]);
        setIsAddModalOpen(false);
        setNewUserForm({ name: '', email: '', role: 'User', plan: 'Free', phoneNumber: '', password: '' });
        setToast({ message: 'User added successfully', type: 'success' });
    };

    const handleEditUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const updatedRole = formData.get('role') as string;
        const updatedStatus = formData.get('status') as string;
        const updatedPlan = formData.get('plan') as string;

        setUsers(users.map(u => u.id === userToEdit.id ? { 
            ...u, 
            role: updatedRole as any, 
            status: updatedStatus as any,
            subscriptionPlan: updatedPlan as any
        } : u));

        setIsEditModalOpen(false);
        setUserToEdit(null);
        setToast({ message: 'User profile updated', type: 'success' });
    };

    const handleDeactivateClick = (user: User) => {
        setUserToDeactivate(user);
        setIsDeactivateModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmDeactivateUser = () => {
        if (!userToDeactivate) return;
        setUsers(users.map(u => u.id === userToDeactivate.id ? { ...u, status: 'Inactive' } : u));
        setIsDeactivateModalOpen(false);
        setUserToDeactivate(null);
        setToast({ message: 'User account deactivated', type: 'success' });
    };

    const handleActivateUser = (user: User) => {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: 'Active' } : u));
        setActiveDropdownId(null);
        setToast({ message: 'User account activated successfully', type: 'success' });
    };

    // Helper to get Role Badge
    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'Super Admin': 
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <ShieldAlert size={12} /> Super Admin
                    </span>
                );
            case 'Admin': 
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Shield size={12} /> Admin
                    </span>
                );
            case 'Subscriber': 
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Subscriber
                    </span>
                );
            default: 
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                        <UserIcon size={12} /> User
                    </span>
                );
        }
    };

    return (
        <div ref={containerRef} className="space-y-6 pb-10 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Manage user roles, subscriptions, and access controls across the platform.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-2 active:scale-95"
                >
                    <UserPlus size={18} /> Add New User
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <StatCard label="Total Users" value={stats.total.toLocaleString()} trend="12%" trendUp={true} icon={<UserIcon size={20} />} color="text-primary dark:text-blue-400" />
                </div>
                <div className="stat-card">
                    <StatCard label="Active Subscribers" value={stats.subscribers.toLocaleString()} trend="5.4%" trendUp={true} icon={<CreditCard size={20} />} color="text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="stat-card">
                    <StatCard label="Admins" value={stats.admins.toLocaleString()} trend="0%" trendUp={true} icon={<Shield size={20} />} color="text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="stat-card">
                    <StatCard label="New This Month" value="128" trend="2.1%" trendUp={false} icon={<UserPlus size={20} />} color="text-amber-500 dark:text-amber-400" />
                </div>
            </div>

            {/* Tab Navigation & Toolbar Container - Added z-20 to fix dropdown occlusion */}
            <div className="flex flex-col gap-4 relative z-20">
                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/5 no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-bold transition-all relative group whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'text-primary dark:text-white' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {/* Active Tab Background Highlight */}
                            {activeTab === tab.id && (
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent rounded-t-lg border-b-2 border-primary dark:border-blue-500"></div>
                            )}
                            
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.icon}
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    activeTab === tab.id 
                                    ? 'bg-primary dark:bg-blue-600 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                                }`}>
                                    {tab.count}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="bg-white/80 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center backdrop-blur-md shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeTab === 'All' ? 'all users' : activeTab.toLowerCase() + 's'}...`}
                            className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-full placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Date Filter */}
                        <div className="relative flex-1 md:flex-none" ref={dateFilterRef}>
                            <button 
                                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                                className="flex items-center gap-2 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-500 transition-all min-w-[150px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-primary dark:text-blue-400" />
                                    <span>{dateRangeLabel}</span>
                                </div>
                                <ChevronDown size={12} className={`opacity-50 transition-transform ${isDateFilterOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isDateFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-1">
                                        {['All Time', 'Today', 'Last 7 Days', 'Last 30 Days', 'This Month'].map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleDateRangeSelect(option)}
                                                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${dateRangeLabel === option ? 'text-primary dark:text-blue-400 bg-slate-50 dark:bg-blue-600/10' : 'text-slate-700 dark:text-slate-300'}`}
                                            >
                                                {option}
                                                {dateRangeLabel === option && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="relative flex-1 md:flex-none" ref={statusFilterRef}>
                            <button 
                                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                                className="flex items-center gap-2 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-500 transition-all min-w-[150px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${statusFilter === 'Active' ? 'bg-emerald-500' : statusFilter === 'Inactive' ? 'bg-slate-500' : 'bg-primary dark:bg-blue-500'}`}></div>
                                    <span>{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
                                </div>
                                <ChevronDown size={12} className={`opacity-50 transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isStatusFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-1">
                                        {['All', 'Active', 'Inactive'].map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setStatusFilter(option);
                                                    setIsStatusFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${statusFilter === option ? 'text-primary dark:text-blue-400 bg-slate-50 dark:bg-blue-600/10' : 'text-slate-700 dark:text-slate-300'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                     <div className={`w-1.5 h-1.5 rounded-full ${option === 'Active' ? 'bg-emerald-500' : option === 'Inactive' ? 'bg-slate-500' : 'bg-primary dark:bg-blue-500'}`}></div>
                                                     {option === 'All' ? 'All Status' : option}
                                                </div>
                                                {statusFilter === option && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table - Added relative z-10 to stay below toolbar */}
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-white/5 relative z-10" ref={tableRef}>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs uppercase bg-slate-50/90 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 backdrop-blur-sm border-b border-slate-200 dark:border-white/5 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">User Profile</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Role & Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Plan</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Join Date</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Last Login</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr 
                                        key={user.id} 
                                        className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-600/5' : ''} ${user.status === 'Inactive' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white font-bold border border-slate-300 dark:border-white/10">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0f172a] ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{user.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1.5">
                                                {getRoleBadge(user.role)}
                                                {user.status === 'Inactive' && (
                                                     <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1 border border-slate-200 dark:border-slate-600 px-1.5 rounded bg-slate-100 dark:bg-slate-800">
                                                        <PowerOff size={10} /> Deactivated
                                                     </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.subscriptionPlan ? (
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                                    user.subscriptionPlan === 'Supreme' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                                                    user.subscriptionPlan === 'Elite' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
                                                    user.subscriptionPlan === 'Premium' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                    'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'
                                                }`}>
                                                    {user.subscriptionPlan}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
                                                <Calendar size={12} /> {user.joinDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
                                                <Clock size={12} /> {user.lastLogin}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                                                <button 
                                                    data-dropdown-trigger
                                                    onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                                                    className={`p-2 rounded-lg transition-colors ${activeDropdownId === user.id ? 'bg-slate-100 dark:bg-white/10 text-primary dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-primary dark:hover:text-white'}`}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {activeDropdownId === user.id && (
                                                    <div 
                                                        data-dropdown-menu
                                                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        <div className="py-1">
                                                            <button 
                                                                onClick={() => {
                                                                    setUserToEdit(user);
                                                                    setIsEditModalOpen(true);
                                                                    setActiveDropdownId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                                                            >
                                                                <Edit2 size={14} /> Edit Profile
                                                            </button>
                                                            {user.role !== 'Super Admin' && (
                                                                <>
                                                                    <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-1"></div>
                                                                    {user.status === 'Active' ? (
                                                                        <button 
                                                                            onClick={() => handleDeactivateClick(user)}
                                                                            className="w-full text-left px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                                                                        >
                                                                            <PowerOff size={14} /> Deactivate User
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => handleActivateUser(user)}
                                                                            className="w-full text-left px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                                                                        >
                                                                            <Power size={14} /> Activate User
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p>No users found in <span className="text-slate-900 dark:text-white font-bold">"{activeTab}"</span> category matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/30">
                    <span className="text-xs text-slate-500">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === page
                                        ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRightIcon size={16} />
                        </button>
                    </div>
                </div>
            </Card>

            {/* User Details Drawer (Slide-over) */}
            {createPortal(
                <AnimatePresence mode="wait">
                    {selectedUser && (
                        <>
                            {/* Backdrop Overlay */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm z-[59]"
                                onClick={() => setSelectedUser(null)}
                            />
                            
                            {/* Drawer Panel */}
                            <motion.div 
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
                                className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-[#0b1121]/95 backdrop-blur-xl border-l border-slate-200 dark:border-white/10 shadow-2xl z-[60]"
                            >
                                <div className="h-full flex flex-col">
                                    {/* Drawer Header */}
                                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-start bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#0b1121]">
                                        <div className="flex items-center gap-4">
                                            <img src={selectedUser.avatar || `https://i.pravatar.cc/150?u=${selectedUser.id}`} className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-white/10 shadow-lg object-cover" alt="" />
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{selectedUser.id}</p>
                                                <div className="flex gap-2 mt-2">
                                                    {getRoleBadge(selectedUser.role)}
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${selectedUser.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'}`}>
                                                        {selectedUser.status === 'Inactive' ? 'Deactivated' : selectedUser.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Drawer Content */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                        {/* Contact Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-2"><Mail size={12} /> Email</p>
                                                <p className="text-sm text-slate-900 dark:text-white truncate" title={selectedUser.email}>{selectedUser.email}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-2"><Phone size={12} /> Phone</p>
                                                <p className="text-sm text-slate-900 dark:text-white">{selectedUser.phoneNumber || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Plan Details */}
                                        <div className="bg-gradient-to-br from-primary to-blue-600 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-white/10 relative overflow-hidden text-white">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <CreditCard size={100} />
                                            </div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 relative z-10">Current Subscription</h3>
                                            <div className="flex justify-between items-end relative z-10">
                                                <div>
                                                    <div className="text-3xl font-bold text-white mb-1">{selectedUser.subscriptionPlan || 'Free'}</div>
                                                    <p className="text-xs text-blue-100 dark:text-slate-400">Renews on Oct 24, 2024</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-white dark:text-emerald-400 font-mono">152 <span className="text-xs text-blue-100 dark:text-slate-500 font-sans font-normal">kWh left</span></div>
                                                    <div className="w-32 h-1.5 bg-white/20 dark:bg-slate-700/50 rounded-full mt-2 overflow-hidden">
                                                        <div className="w-[70%] h-full bg-white dark:bg-emerald-500 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Activity (Mock) */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                                                <History size={14} /> Recent Activity
                                            </h3>
                                            <div className="space-y-4 border-l-2 border-slate-200 dark:border-white/5 pl-4 ml-2">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="relative">
                                                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary dark:bg-blue-500 ring-4 ring-white dark:ring-[#0b1121]"></div>
                                                        <p className="text-sm text-slate-900 dark:text-white">Charged at <span className="font-bold">Ayala Triangle Gardens</span></p>
                                                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                                            <span>Oct {20 - i}, 2024</span>
                                                            <span>•</span>
                                                            <span>45 mins</span>
                                                            <span>•</span>
                                                            <span>24.5 kWh</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Drawer Footer Actions */}
                                    <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b1121] flex gap-3">
                                         <button 
                                            onClick={() => {
                                                setUserToEdit(selectedUser);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="flex-1 py-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl text-sm font-bold transition-colors border border-slate-200 dark:border-white/5 shadow-sm"
                                        >
                                            Edit Profile
                                        </button>
                                         {selectedUser.role !== 'Super Admin' && (
                                            <>
                                                {selectedUser.status === 'Active' ? (
                                                    <button 
                                                        onClick={() => {
                                                            handleDeactivateClick(selectedUser);
                                                        }}
                                                        className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl transition-colors border border-amber-500/10"
                                                        title="Deactivate Account"
                                                    >
                                                        <PowerOff size={20} />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => {
                                                            handleActivateUser(selectedUser);
                                                        }}
                                                        className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors border border-emerald-500/10"
                                                        title="Activate Account"
                                                    >
                                                        <Power size={20} />
                                                    </button>
                                                )}
                                            </>
                                         )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Create User Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
                            <input required type="text" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" placeholder="John Doe" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Phone Number</label>
                            <input type="text" value={newUserForm.phoneNumber} onChange={e => setNewUserForm({...newUserForm, phoneNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" placeholder="+63 9..." />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                            <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5"><Lock size={12} /> Password</label>
                            <input required type="password" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" placeholder="••••••••" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Role</label>
                            <select value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                <option value="User">User</option>
                                <option value="Subscriber">Subscriber</option>
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Initial Plan</label>
                            <select value={newUserForm.plan} onChange={e => setNewUserForm({...newUserForm, plan: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                <option value="Free">Free</option>
                                <option value="Basic">Basic</option>
                                <option value="Premium">Premium</option>
                                <option value="Elite">Elite</option>
                                <option value="Supreme">Supreme</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex gap-3 mt-2">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all">Create User</button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${userToEdit?.name}`}>
                {userToEdit && (
                    <form onSubmit={handleEditUser} className="space-y-4">
                         <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 mb-4">
                             <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white font-bold text-lg">
                                {userToEdit.name.charAt(0)}
                             </div>
                             <div>
                                 <h4 className="font-bold text-slate-900 dark:text-white">{userToEdit.name}</h4>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{userToEdit.id}</p>
                             </div>
                         </div>
                        
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Role</label>
                            <select name="role" defaultValue={userToEdit.role} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                <option value="User">User</option>
                                <option value="Subscriber">Subscriber</option>
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                            </select>
                        </div>

                         <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Subscription Plan</label>
                            <select name="plan" defaultValue={userToEdit.subscriptionPlan || 'Free'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                <option value="Free">Free</option>
                                <option value="Basic">Basic</option>
                                <option value="Standard">Standard</option>
                                <option value="Deluxe">Deluxe</option>
                                <option value="Premium">Premium</option>
                                <option value="Elite">Elite</option>
                                <option value="Supreme">Supreme</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Account Status</label>
                            <select name="status" defaultValue={userToEdit.status} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                <option value="Active">Active</option>
                                <option value="Inactive">Deactivated</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex gap-3 mt-2">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold">Cancel</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all">Save Changes</button>
                        </div>
                    </form>
                )}
            </Modal>

             {/* Deactivate User Modal */}
            <Modal isOpen={isDeactivateModalOpen} onClose={() => setIsDeactivateModalOpen(false)} title="Deactivate User">
                {userToDeactivate && (
                    <div className="space-y-4">
                         <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wide">Account Deactivation</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                                    You are about to deactivate <strong className="text-slate-900 dark:text-white">{userToDeactivate.name}</strong> ({userToDeactivate.email}). 
                                    They will lose access to the platform immediately, but their data will be preserved.
                                </p>
                            </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                            <button onClick={() => setIsDeactivateModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">Cancel</button>
                            <button onClick={confirmDeactivateUser} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2">
                                <PowerOff size={16} /> Deactivate
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};