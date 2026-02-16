import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { MOCK_USERS } from '../constants';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
    Check, Crown, Zap, Plus, CreditCard, Shield, Users, 
    MoreHorizontal, Edit3, Trash2, TrendingUp, TrendingDown,
    Settings, Search, AlertCircle, DollarSign, Palette, FileText, 
    Tag, Eye, Loader2, Globe, Percent, Clock, AlertTriangle,
    Power, PowerOff, Bot, Map, Headphones, Lock, Car, Coffee, Bell,
    CalendarDays, ChevronDown, Bookmark, X, Filter, Download, 
    CheckCircle2, XCircle, ArrowUpRight, History, LayoutGrid, RefreshCw, Ban,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import gsap from 'gsap';

// --- Types ---

type PlanTier = 'Free' | 'Basic' | 'Standard' | 'Deluxe' | 'Premium' | 'Elite' | 'Supreme' | string;
type PlanStatus = 'Active' | 'Disabled' | 'Archived';
type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';

interface SubscriptionPlan {
    id: string;
    name: PlanTier;
    price: number;      // Monthly price
    yearlyPrice: number; // Yearly price
    yearlySavingsText?: string; // Custom text for savings badge
    kwhAllowance: number;
    period: string;
    activeUsers: number;
    features: string[];
    color: string;
    accentColor: string;
    icon: React.ReactNode;
    isPopular?: boolean;
    tag?: string; // Custom tag text (e.g. "Most Popular", "Best Value")
    status: PlanStatus; 
}

interface SubscriptionTransaction {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userEmail: string;
    planName: string;
    amount: number;
    status: TransactionStatus;
    date: string;
    paymentMethod: string;
    billingCycle: 'Monthly' | 'Yearly';
    autoBilling: boolean; // New field
}

interface GlobalSettings {
    currency: string;
    taxRate: number;
    gracePeriod: number;
    enableYearlyBilling: boolean;
    promoBanner: string;
}

// --- Mock Data ---

const INITIAL_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        yearlyPrice: 0,
        kwhAllowance: 0,
        period: 'month',
        activeUsers: 5420,
        features: ['Browse all charging stations', 'View real-time availability', 'Basic route planning', 'Limited AI assistance'],
        color: 'from-slate-700 to-slate-600',
        accentColor: 'text-slate-200',
        icon: <Zap size={20} />,
        status: 'Active'
    },
    {
        id: 'basic',
        name: 'Basic',
        price: 1300,
        yearlyPrice: 14040,
        yearlySavingsText: 'Save 10% with yearly billing',
        kwhAllowance: 50,
        period: 'month',
        activeUsers: 2100,
        features: ['50 kWh monthly allowance', 'Priority booking access', 'Advanced route planning', 'Full Wynx AI assistance', '24/7 customer support'],
        color: 'from-blue-600 to-indigo-600',
        accentColor: 'text-blue-100',
        icon: <Zap size={20} />,
        isPopular: true,
        tag: 'Most Popular',
        status: 'Active'
    },
    {
        id: 'standard',
        name: 'Standard',
        price: 2500,
        yearlyPrice: 27000,
        yearlySavingsText: 'Save 10% with yearly billing',
        kwhAllowance: 100,
        period: 'month',
        activeUsers: 1250,
        features: ['100 kWh monthly allowance', 'Priority booking access', 'Advanced route planning', 'Full Wynx AI assistance', '24/7 customer support', 'Exclusive station access'],
        color: 'from-cyan-600 to-blue-600',
        accentColor: 'text-cyan-100',
        icon: <Shield size={20} />,
        status: 'Active'
    },
    {
        id: 'deluxe',
        name: 'Deluxe',
        price: 3600,
        yearlyPrice: 38880,
        yearlySavingsText: 'Save 10% with yearly billing',
        kwhAllowance: 150,
        period: 'month',
        activeUsers: 840,
        features: ['150 kWh monthly allowance', 'Priority booking access', 'Advanced route planning', 'Full Wynx AI assistance', '24/7 customer support', 'Exclusive station access'],
        color: 'from-indigo-600 to-purple-600',
        accentColor: 'text-indigo-100',
        icon: <Shield size={20} />,
        tag: 'Best Value',
        status: 'Active'
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 4600,
        yearlyPrice: 49680,
        yearlySavingsText: 'Save 10% with yearly billing',
        kwhAllowance: 200,
        period: 'month',
        activeUsers: 620,
        features: ['200 kWh monthly allowance', 'Priority booking access', 'Advanced route planning', 'Full Wynx AI assistance', '24/7 customer support', 'Exclusive station access', 'Free valet charging', 'Premium lounge access'],
        color: 'from-purple-600 to-fuchsia-600',
        accentColor: 'text-purple-100',
        icon: <Crown size={20} />,
        status: 'Active'
    },
    {
        id: 'elite',
        name: 'Elite',
        price: 5500,
        yearlyPrice: 59400,
        yearlySavingsText: 'Save 10% with yearly billing',
        kwhAllowance: 250,
        period: 'month',
        activeUsers: 310,
        features: ['250 kWh monthly allowance', 'Priority booking access', 'Advanced route planning', 'Full Wynx AI assistance', '24/7 customer support', 'Exclusive station access', 'Free valet charging', 'Premium lounge access'],
        color: 'from-amber-500 to-orange-600',
        accentColor: 'text-amber-100',
        icon: <Crown size={20} />,
        status: 'Active'
    },
    {
        id: 'supreme',
        name: 'Supreme',
        price: 6300,
        yearlyPrice: 68040,
        yearlySavingsText: 'Save 10% with yearly billing',
        kwhAllowance: 300,
        period: 'month',
        activeUsers: 150,
        features: ['300 kWh monthly allowance', 'Priority booking access', 'Advanced route planning', 'Full Wynx AI assistance', '24/7 customer support', 'Exclusive station access', 'Free valet charging', 'Premium lounge access', 'Concierge service', 'Vehicle maintenance perks'],
        color: 'from-rose-500 to-pink-600',
        accentColor: 'text-rose-100',
        icon: <Crown size={20} />,
        status: 'Active'
    }
];

const REVENUE_DATA = [
    { name: 'Mon', revenue: 125000 },
    { name: 'Tue', revenue: 145000 },
    { name: 'Wed', revenue: 135000 },
    { name: 'Thu', revenue: 180000 },
    { name: 'Fri', revenue: 210000 },
    { name: 'Sat', revenue: 250000 },
    { name: 'Sun', revenue: 230000 },
];

const THEMES = [
    { id: 'slate', name: 'Slate', color: 'from-slate-700 to-slate-600', accent: 'text-slate-200' },
    { id: 'blue', name: 'Blue', color: 'from-blue-600 to-indigo-600', accent: 'text-blue-100' },
    { id: 'cyan', name: 'Cyan', color: 'from-cyan-600 to-blue-600', accent: 'text-cyan-100' },
    { id: 'purple', name: 'Purple', color: 'from-indigo-600 to-purple-600', accent: 'text-indigo-100' },
    { id: 'fuchsia', name: 'Fuchsia', color: 'from-purple-600 to-fuchsia-600', accent: 'text-purple-100' },
    { id: 'amber', name: 'Amber', color: 'from-amber-500 to-orange-600', accent: 'text-amber-100' },
    { id: 'rose', name: 'Rose', color: 'from-rose-500 to-pink-600', accent: 'text-rose-100' },
];

// Generate Mock Transactions
const generateMockTransactions = (): SubscriptionTransaction[] => {
    return Array.from({ length: 350 }).map((_, i) => { // Increased to 350 for better pagination demo
        const user = MOCK_USERS[i % MOCK_USERS.length];
        const plan = INITIAL_PLANS[Math.floor(Math.random() * INITIAL_PLANS.length)];
        const isYearly = Math.random() > 0.8;
        const statusPool: TransactionStatus[] = ['Completed', 'Completed', 'Completed', 'Pending', 'Failed'];
        
        return {
            id: `SUB-${10000 + i}`,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userAvatar: `https://i.pravatar.cc/150?u=${user.id}`,
            planName: plan.name,
            amount: isYearly ? plan.yearlyPrice : plan.price,
            status: statusPool[Math.floor(Math.random() * statusPool.length)],
            date: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 90)).toISOString().split('T')[0], // Last 90 days
            paymentMethod: i % 3 === 0 ? 'PayPal' : `Credit Card •••• ${4000 + i}`,
            billingCycle: (isYearly ? 'Yearly' : 'Monthly') as 'Monthly' | 'Yearly',
            autoBilling: Math.random() > 0.3 // 70% chance of auto billing on
        };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const MOCK_TRANSACTIONS = generateMockTransactions();

// --- Internal Components ---

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
                type === 'loading' ? 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/20 text-primary dark:text-blue-200' : 
                type === 'error' ? 'bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-200' :
                'bg-emerald-50/90 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-200'
            }`}>
                {type === 'loading' ? <Loader2 size={18} className="animate-spin text-primary dark:text-blue-400" /> : 
                 type === 'error' ? <AlertCircle size={14} className="text-red-500 dark:text-red-400" /> :
                 <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={14} className="text-emerald-500 dark:text-emerald-400" /></div>}
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    label: string;
    value: string;
    subValue?: string;
    trend?: string;
    trendUp?: boolean;
    icon: React.ReactNode;
    color: string;
}> = ({ label, value, subValue, trend, trendUp, icon, color }) => (
    <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden group hover:border-primary/20 dark:hover:border-white/10 transition-colors">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 dark:opacity-10 blur-xl ${color}`}></div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-white shadow-lg`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 ${trendUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {trendUp ? '+' : ''}{trend}
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                {subValue && <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{subValue}</p>}
            </div>
        </div>
    </div>
);

const FeatureItem: React.FC<{ text: string }> = ({ text }) => {
    // Map features to icons
    let icon = <Check size={12} className="text-emerald-500 dark:text-emerald-400" />;
    
    if (text.includes('AI')) icon = <Bot size={12} className="text-purple-500 dark:text-purple-400" />;
    else if (text.includes('route')) icon = <Map size={12} className="text-primary dark:text-blue-400" />;
    else if (text.includes('support')) icon = <Headphones size={12} className="text-cyan-500 dark:text-cyan-400" />;
    else if (text.includes('Exclusive')) icon = <Lock size={12} className="text-amber-500 dark:text-amber-400" />;
    else if (text.includes('valet')) icon = <Car size={12} className="text-red-500 dark:text-red-400" />;
    else if (text.includes('lounge')) icon = <Coffee size={12} className="text-orange-500 dark:text-orange-400" />;
    else if (text.includes('Concierge')) icon = <Bell size={12} className="text-rose-500 dark:text-rose-400" />;

    return (
        <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
            <div className="mt-1 p-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shrink-0">
                {icon}
            </div>
            <span className="leading-snug text-xs">{text}</span>
        </div>
    );
};

export const Subscription: React.FC = () => {
    const containerRef = useRef(null);
    const transactionsRef = useRef(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
    
    // Data State
    const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
    const [transactions, setTransactions] = useState<SubscriptionTransaction[]>(MOCK_TRANSACTIONS);
    
    // Modal State
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    // Feature Editing State
    const [editableFeatures, setEditableFeatures] = useState<string[]>([]);
    const [isAddingFeature, setIsAddingFeature] = useState(false);
    const [newFeatureText, setNewFeatureText] = useState('');
    const featureInputRef = useRef<HTMLInputElement>(null);

    // Deletion Logic
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

    // Status Toggle Logic (Enable/Disable)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [planToToggleStatus, setPlanToToggleStatus] = useState<SubscriptionPlan | null>(null);
    
    // UI State
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'loading' | 'error' } | null>(null);

    // Date Filter State (Overview)
    const [dateRangeLabel, setDateRangeLabel] = useState('This Month');
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    const dateRangeRef = useRef<HTMLDivElement>(null);

    // --- Transactions Tab State ---
    // Filters
    const [txnSearchQuery, setTxnSearchQuery] = useState('');
    const [txnStatusFilter, setTxnStatusFilter] = useState('All');
    
    // Transaction Date Filter
    const [txnDateRangeLabel, setTxnDateRangeLabel] = useState('All Time');
    const [isTxnDateRangeOpen, setIsTxnDateRangeOpen] = useState(false);
    const txnDateRangeRef = useRef<HTMLDivElement>(null);
    const [txnDateFilter, setTxnDateFilter] = useState({ start: '', end: '' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;
    
    // Global Settings State
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
        currency: 'PHP',
        taxRate: 12,
        gracePeriod: 3,
        enableYearlyBilling: true,
        promoBanner: ''
    });

    // Billing Cycle View State
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Create Form State
    const [createForm, setCreateForm] = useState({
        name: '',
        price: '',
        yearlyPrice: '',
        yearlySavingsText: '',
        kwhAllowance: '',
        features: '',
        tag: '', // Added tag field
        themeIndex: 0
    });

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
                setActiveDropdownId(null);
            }
            if (dateRangeRef.current && !dateRangeRef.current.contains(target)) {
                setIsDateRangeOpen(false);
            }
            if (txnDateRangeRef.current && !txnDateRangeRef.current.contains(target)) {
                setIsTxnDateRangeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [txnSearchQuery, txnStatusFilter, txnDateFilter]);

    // Sync features when plan is selected for editing
    useEffect(() => {
        if (selectedPlan) {
            setEditableFeatures([...selectedPlan.features]);
        } else {
            setEditableFeatures([]);
        }
        setIsAddingFeature(false);
        setNewFeatureText('');
    }, [selectedPlan]);

    // Focus input when adding feature
    useEffect(() => {
        if (isAddingFeature && featureInputRef.current) {
            featureInputRef.current.focus();
        }
    }, [isAddingFeature]);

    // Animate Tab Switch
    useEffect(() => {
        if (activeTab === 'transactions' && transactionsRef.current) {
             gsap.fromTo(transactionsRef.current, 
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        } else if (activeTab === 'overview' && containerRef.current) {
             gsap.fromTo(".overview-content", 
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    }, [activeTab]);

    // Form Validation State
    const isCreateFormValid = useMemo(() => {
        return (
            createForm.name.trim() !== '' &&
            createForm.price !== '' &&
            createForm.kwhAllowance !== '' &&
            createForm.features.trim() !== ''
        );
    }, [createForm]);

    // Calculate MRR (Monthly Recurring Revenue)
    const totalMRR = useMemo(() => plans.reduce((sum, plan) => sum + (plan.price * plan.activeUsers), 0), [plans]);
    const totalSubscribers = useMemo(() => plans.reduce((sum, plan) => sum + plan.activeUsers, 0), [plans]);
    const activePlanCount = plans.filter(p => p.status === 'Active').length;

    // --- Date Filter Logic Simulation ---
    const statsMultiplier = useMemo(() => {
        switch(dateRangeLabel) {
            case 'Today': return 0.03; // ~1/30th
            case 'Yesterday': return 0.032;
            case 'Last 7 Days': return 0.23; // ~1/4th
            case 'Last 30 Days': return 1.0; 
            case 'This Month': return 0.95; // Assume near end of month
            case 'All Time': return 12.5; // > 1 year
            default: return 1.0;
        }
    }, [dateRangeLabel]);

    // Scale the data for the charts based on the selected date range
    const displayRevenueData = useMemo(() => {
        return REVENUE_DATA.map(d => ({
            ...d,
            revenue: d.revenue * (statsMultiplier > 1 ? 1 : 1 + (Math.random() * 0.1 - 0.05)) // Add variance
        }));
    }, [statsMultiplier]);

    // Calculate Distribution Data with Dynamic Variance per Date Filter
    const distributionData = useMemo(() => {
        return plans.map((plan, index) => {
            let variance = 1.0;
            if (dateRangeLabel === 'Today') {
                variance = index < 2 ? 1.4 : 0.7; 
            } else if (dateRangeLabel === 'Yesterday') {
                variance = index > 3 ? 1.3 : 0.8;
            } else if (dateRangeLabel === 'Last 7 Days') {
                variance = index % 2 === 0 ? 1.1 : 0.9;
            } else if (dateRangeLabel === 'Last 30 Days') {
                variance = 1.0; 
            }
            const baseValue = plan.activeUsers * statsMultiplier;
            const finalValue = Math.floor(baseValue * variance);
            return {
                name: plan.name,
                value: Math.max(10, finalValue), 
                color: THEMES.find(t => plan.color === t.color)?.color.includes('slate') ? '#475569' : 
                       plan.color.includes('blue') ? '#3b82f6' :
                       plan.color.includes('cyan') ? '#06b6d4' :
                       plan.color.includes('indigo') ? '#6366f1' :
                       plan.color.includes('purple') ? '#a855f7' :
                       plan.color.includes('amber') ? '#f59e0b' :
                       plan.color.includes('rose') ? '#f43f5e' : '#94a3b8'
            };
        });
    }, [plans, statsMultiplier, dateRangeLabel]);

    const displayTotalSubscribers = useMemo(() => distributionData.reduce((sum, d) => sum + d.value, 0), [distributionData]);
    const displayRevenue = useMemo(() => totalMRR * statsMultiplier, [totalMRR, statsMultiplier]);

    // Initial Animation
    useEffect(() => {
        if (activeTab === 'overview') {
             const ctx = gsap.context(() => {
                gsap.fromTo(".chart-container",
                    { opacity: 0, scale: 0.98, y: 10 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
                gsap.fromTo(".stagger-card", 
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, delay: 0.2, ease: "power2.out" }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [activeTab]);

    const handleEditPlan = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsEditModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleStatusClick = (plan: SubscriptionPlan) => {
        setPlanToToggleStatus(plan);
        setIsStatusModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmToggleStatus = () => {
        if (!planToToggleStatus) return;
        
        const newStatus: PlanStatus = planToToggleStatus.status === 'Active' ? 'Disabled' : 'Active';
        setPlans(prev => prev.map(p => p.id === planToToggleStatus.id ? { ...p, status: newStatus } : p));
        setToast({ message: `Plan ${newStatus === 'Active' ? 'Enabled' : 'Disabled'} successfully`, type: 'success' });
        setIsStatusModalOpen(false);
        setPlanToToggleStatus(null);
    };

    const handleDeleteClick = (plan: SubscriptionPlan) => {
        setPlanToDelete(plan);
        setIsDeleteModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmDeletePlan = () => {
        if (!planToDelete) return;
        setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
        setIsDeleteModalOpen(false);
        setPlanToDelete(null);
        setToast({ message: 'Plan deleted successfully', type: 'success' });
    };

    const handleSaveGlobalSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setToast({ message: 'Saving configuration...', type: 'loading' });
        setTimeout(() => {
            setIsSettingsModalOpen(false);
            setToast({ message: 'Global settings updated', type: 'success' });
        }, 1000);
    };

    const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const featureList = createForm.features.split('\n').filter(f => f.trim() !== '');
        const selectedTheme = THEMES[createForm.themeIndex];
        const monthlyPrice = Number(createForm.price);
        const yearlyPrice = Number(createForm.yearlyPrice);

        const newPlan: SubscriptionPlan = {
            id: `plan-${Date.now()}`,
            name: createForm.name,
            price: monthlyPrice,
            yearlyPrice: yearlyPrice,
            yearlySavingsText: createForm.yearlySavingsText || 'Save 10% with yearly billing',
            kwhAllowance: Number(createForm.kwhAllowance),
            period: 'month',
            activeUsers: 0,
            features: featureList.length > 0 ? featureList : ['Standard charging access'],
            color: selectedTheme.color,
            accentColor: selectedTheme.accent,
            icon: <Zap size={20} />, 
            isPopular: false,
            tag: createForm.tag,
            status: 'Active'
        };

        setPlans(prev => [...prev, newPlan]);
        setIsCreateModalOpen(false);
        setToast({ message: 'New plan created successfully', type: 'success' });
        
        setCreateForm({
            name: '',
            price: '',
            yearlyPrice: '',
            yearlySavingsText: '',
            kwhAllowance: '',
            features: '',
            tag: '',
            themeIndex: 0
        });
    };

    const handleAddFeature = () => {
        if (newFeatureText.trim()) {
            setEditableFeatures([...editableFeatures, newFeatureText.trim()]);
            setNewFeatureText('');
            featureInputRef.current?.focus(); 
        }
    };

    const handleRemoveFeature = (index: number) => {
        setEditableFeatures(prev => prev.filter((_, i) => i !== index));
    };

    const handleCancelAddFeature = () => {
        setIsAddingFeature(false);
        setNewFeatureText('');
    };

    const handleUpdatePlan = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedPlan) return;

        const formData = new FormData(e.currentTarget);
        const name = String(formData.get('name'));
        const price = Number(formData.get('price'));
        const yearlyPrice = Number(formData.get('yearlyPrice'));
        const yearlySavingsText = String(formData.get('yearlySavingsText'));
        const kwhAllowance = Number(formData.get('kwhAllowance'));
        const tag = String(formData.get('tag'));

        setPlans(prevPlans => prevPlans.map(p => 
            p.id === selectedPlan.id 
                ? { ...p, name, price, yearlyPrice, yearlySavingsText, kwhAllowance, tag, features: editableFeatures } 
                : p
        ));
        
        setIsEditModalOpen(false);
        setToast({ message: 'Plan updated successfully', type: 'success' });
    };

    const handleExportTransactions = () => {
        setToast({ message: 'Exporting transactions...', type: 'loading' });
        setTimeout(() => {
            setToast({ message: 'Transactions exported to CSV', type: 'success' });
        }, 1200);
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);

    const handleDateRangeSelect = (range: string) => {
        setDateRangeLabel(range);
        setIsDateRangeOpen(false);
    };

    // --- Helper for Date Filtering ---
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const handleTxnDateRangeSelect = (range: 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Month' | 'All Time') => {
        const today = new Date();
        let start = '';
        let end = '';

        switch(range) {
            case 'Today':
                start = formatDate(today);
                end = formatDate(today);
                break;
            case 'Yesterday':
                const yest = new Date(today);
                yest.setDate(yest.getDate() - 1);
                start = formatDate(yest);
                end = formatDate(yest);
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
                start = '';
                end = '';
                break;
        }

        setTxnDateFilter({ start, end });
        setTxnDateRangeLabel(range);
        setIsTxnDateRangeOpen(false);
    };

    // Filter Transactions (Memoized)
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            const matchesSearch = 
                txn.id.toLowerCase().includes(txnSearchQuery.toLowerCase()) || 
                txn.userName.toLowerCase().includes(txnSearchQuery.toLowerCase()) ||
                txn.userEmail.toLowerCase().includes(txnSearchQuery.toLowerCase());
            
            const matchesStatus = txnStatusFilter === 'All' || txn.status === txnStatusFilter;
            
            let matchesDate = true;
            if (txnDateFilter.start && txn.date < txnDateFilter.start) matchesDate = false;
            if (txnDateFilter.end && txn.date > txnDateFilter.end) matchesDate = false;
            
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [transactions, txnSearchQuery, txnStatusFilter, txnDateFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div ref={containerRef} className="space-y-6 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Subscription Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                            Manage pricing tiers, features, and subscriber benefits. Monitor revenue streams and plan performance in real-time.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'overview' && (
                            <>
                                <button 
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-2"
                                >
                                    <Settings size={16} /> Global Settings
                                </button>
                                <button 
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-2 active:scale-95"
                                >
                                    <Plus size={18} /> Create New Plan
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tab Switcher & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 w-fit">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                                activeTab === 'overview' 
                                ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                            }`}
                        >
                            <LayoutGrid size={16} /> Overview
                        </button>
                        <button 
                            onClick={() => setActiveTab('transactions')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                                activeTab === 'transactions' 
                                ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                            }`}
                        >
                            <History size={16} /> Recent Transactions
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="relative" ref={dateRangeRef}>
                            <button 
                                onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                                className="flex items-center gap-2 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-all w-40 justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={14} className="text-primary dark:text-blue-400" /> 
                                    <span>{dateRangeLabel}</span>
                                </div>
                                <ChevronDown size={12} className={`opacity-50 transition-transform ${isDateRangeOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isDateRangeOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-1">
                                        {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'].map((option) => (
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
                    )}
                </div>
            </div>

            {/* Overview Content */}
            {activeTab === 'overview' && (
                <div className="overview-content space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            label={dateRangeLabel === 'All Time' ? 'Total Revenue' : `Revenue (${dateRangeLabel})`}
                            value={formatCurrency(displayRevenue)} 
                            subValue="Based on selected period"
                            trend="12.5%" 
                            trendUp={true} 
                            icon={<DollarSign size={20} />} 
                            color="bg-emerald-500" 
                        />
                        <StatCard 
                            label={dateRangeLabel === 'All Time' ? 'Total Subscribers' : `New Subscribers`}
                            value={displayTotalSubscribers.toLocaleString()} 
                            subValue={`${(displayTotalSubscribers / 25000 * 100).toFixed(1)}% of total users`}
                            trend="5.2%" 
                            trendUp={true} 
                            icon={<Users size={20} />} 
                            color="bg-primary dark:bg-blue-500" 
                        />
                        <StatCard 
                            label="Active Plans" 
                            value={activePlanCount.toString()} 
                            subValue="Across 3 billing cycles"
                            icon={<CreditCard size={20} />} 
                            color="bg-purple-500" 
                        />
                        <StatCard 
                            label="Churn Rate" 
                            value="2.4%" 
                            subValue="Down 0.8% from last month"
                            trend="0.8%" 
                            trendUp={false} 
                            icon={<AlertCircle size={20} />} 
                            color="bg-rose-500" 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 chart-container">
                        <Card className="lg:col-span-2 h-[400px]" title="Revenue Trend" subtitle={`Daily revenue breakdown (${dateRangeLabel})`}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={displayRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#153385" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#153385" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" className="dark:stroke-white/5" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `₱${value/1000}k`} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px' }} 
                                        itemStyle={{ color: '#0f172a' }}
                                        wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white"
                                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#153385" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card className="h-[400px]" title="Distribution" subtitle="Subscribers by plan tier">
                            <div className="flex flex-col h-full">
                                <div className="flex-1 min-h-0 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                                animationDuration={800} 
                                                isAnimationActive={true}
                                            >
                                                {distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                                ))}
                                            </Pie>
                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                                <tspan x="50%" dy="-0.6em" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-bold uppercase tracking-widest">Total</tspan>
                                                <tspan x="50%" dy="1.6em" className="fill-slate-900 dark:fill-white text-lg font-bold font-mono">{displayTotalSubscribers.toLocaleString()}</tspan>
                                            </text>
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px' }}
                                                itemStyle={{ color: '#0f172a' }}
                                                wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                <div className="flex flex-col gap-1 mt-4 max-h-[140px] overflow-y-auto custom-scrollbar pr-2 border-t border-slate-200 dark:border-white/5 pt-4">
                                    {distributionData.map((entry, index) => {
                                        const percentage = displayTotalSubscribers > 0 ? ((entry.value / displayTotalSubscribers) * 100).toFixed(1) : '0.0';
                                        return (
                                            <div key={`legend-${index}`} className="flex items-center justify-between p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors group">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-white/10" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{entry.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">{entry.value.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded min-w-[40px] text-center border border-slate-200 dark:border-white/5">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Plan Tiers Grid */}
                    <div>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Active Tiers <span className="bg-slate-200 dark:bg-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300">{plans.length}</span>
                                </h3>
                                
                                {/* Enhanced Billing Toggle */}
                                <div className="bg-slate-200 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-white/5 flex items-center relative shadow-inner">
                                    <button
                                        onClick={() => setBillingCycle('monthly')}
                                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all relative z-10 ${
                                            billingCycle === 'monthly' 
                                            ? 'text-white shadow-lg' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle('yearly')}
                                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all relative z-10 ${
                                            billingCycle === 'yearly' 
                                            ? 'text-white shadow-lg' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Yearly
                                    </button>
                                    {/* Sliding Background */}
                                    <div className={`absolute top-1 bottom-1 w-[48%] bg-primary dark:bg-blue-600 rounded-lg transition-all duration-300 ease-in-out shadow-lg ${
                                        billingCycle === 'yearly' ? 'left-[50%]' : 'left-1'
                                    }`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.id} className={`stagger-card group relative flex flex-col h-full ${plan.status === 'Archived' ? 'opacity-60 grayscale-[0.8] hover:grayscale-0 transition-all duration-300' : plan.status === 'Disabled' ? 'grayscale-[0.5]' : ''}`}>
                                    {/* Card Background & Border */}
                                    <div className={`absolute inset-0 bg-white dark:bg-[#0f172a] rounded-2xl border transition-all duration-300 group-hover:translate-y-[-4px] group-hover:shadow-xl ${
                                        plan.status === 'Disabled' ? 'border-red-500/10' : 'border-slate-200 dark:border-white/5 group-hover:border-primary/20 dark:group-hover:border-white/10'
                                    }`}></div>
                                    
                                    {/* Content */}
                                    <div className="relative p-6 flex flex-col h-full z-10">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg ${plan.status === 'Disabled' ? 'opacity-50' : ''}`}>
                                                {plan.icon}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {(plan.tag || (plan.isPopular && plan.status === 'Active')) && (
                                                    <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-full shadow-lg shadow-orange-500/20">
                                                        {plan.tag || 'Most Popular'}
                                                    </span>
                                                )}
                                                {plan.status === 'Archived' && (
                                                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wide rounded-full">
                                                        Archived
                                                    </span>
                                                )}
                                                {plan.status === 'Disabled' && (
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wide rounded-full">
                                                        Disabled
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Plan Info */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors mb-2">{plan.name}</h3>
                                            
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                                    {plan.price === 0 ? 'Free' : formatCurrency(billingCycle === 'monthly' ? plan.price : plan.yearlyPrice)}
                                                </span>
                                                {plan.price > 0 && (
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {billingCycle === 'yearly' && plan.price > 0 && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                                    <Check size={12} className="text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{plan.yearlySavingsText || 'Save 10% with yearly billing'}</span>
                                                </div>
                                            )}

                                            {billingCycle === 'yearly' && plan.price > 0 && (
                                                <p className="text-[10px] text-slate-500 mt-1.5 ml-0.5">
                                                    Equivalent to {formatCurrency(plan.yearlyPrice / 12)}/mo
                                                </p>
                                            )}
                                        </div>

                                        {/* Stats Divider */}
                                        <div className="grid grid-cols-2 gap-2 mb-6 p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                                            <div className="text-center">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Allowance</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{plan.kwhAllowance} kWh/mo</p>
                                            </div>
                                            <div className="text-center border-l border-slate-200 dark:border-white/5">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Users</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{plan.activeUsers.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Features List */}
                                        <div className="space-y-3 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[100px]">
                                            {plan.features.map((feature, idx) => (
                                                <FeatureItem key={idx} text={feature} />
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-white/5 relative">
                                            <button 
                                                onClick={() => handleEditPlan(plan)}
                                                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors border border-slate-200 dark:border-white/5 flex items-center justify-center gap-2"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                            <div className="relative">
                                                <button 
                                                    data-dropdown-trigger
                                                    onClick={() => setActiveDropdownId(activeDropdownId === plan.id ? null : plan.id)}
                                                    className={`p-2 rounded-lg transition-colors border border-slate-200 dark:border-white/5 ${activeDropdownId === plan.id ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdownId === plan.id && (
                                                    <div 
                                                        data-dropdown-menu
                                                        className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        <div className="py-1">
                                                            {plan.status !== 'Archived' && (
                                                                <button 
                                                                    onClick={() => handleStatusClick(plan)}
                                                                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 ${plan.status === 'Active' ? 'text-red-500 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                                >
                                                                    {plan.status === 'Active' ? <PowerOff size={14} /> : <Power size={14} />}
                                                                    {plan.status === 'Active' ? 'Disable Plan' : 'Enable Plan'}
                                                                </button>
                                                            )}
                                                            
                                                            <button 
                                                                className="w-full text-left px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                                                            >
                                                                <Eye size={14} /> View Subscribers
                                                            </button>
                                                            <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-1"></div>
                                                            <button 
                                                                onClick={() => handleDeleteClick(plan)}
                                                                className="w-full text-left px-4 py-2.5 text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Delete Plan
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Content */}
            {activeTab === 'transactions' && (
                <div ref={transactionsRef} className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by ID, User, or Email..." 
                                    value={txnSearchQuery}
                                    onChange={(e) => setTxnSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                                />
                            </div>
                            
                            {/* Transaction Date Filter */}
                            <div className="relative" ref={txnDateRangeRef}>
                                <button 
                                    onClick={() => setIsTxnDateRangeOpen(!isTxnDateRangeOpen)}
                                    className="flex items-center gap-2 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-all whitespace-nowrap shadow-sm"
                                >
                                    <CalendarDays size={14} className="text-primary dark:text-blue-400" /> 
                                    <span>{txnDateRangeLabel}</span>
                                    <ChevronDown size={12} className={`opacity-50 transition-transform ${isTxnDateRangeOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isTxnDateRangeOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="py-1">
                                            {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => handleTxnDateRangeSelect(option as any)}
                                                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${txnDateRangeLabel === option ? 'text-primary dark:text-blue-400 bg-slate-50 dark:bg-blue-600/10' : 'text-slate-700 dark:text-slate-300'}`}
                                                >
                                                    {option}
                                                    {txnDateRangeLabel === option && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                                {['All', 'Completed', 'Pending', 'Failed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setTxnStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            txnStatusFilter === status 
                                            ? 'bg-primary dark:bg-blue-600 text-white shadow-md' 
                                            : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleExportTransactions}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-white/5"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    {/* Transaction Table */}
                    <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/5 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Transaction ID</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Plan</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Billing</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {currentTransactions.length > 0 ? (
                                        currentTransactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-slate-900 dark:text-white font-medium text-xs group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">#{txn.id}</span>
                                                    <div className="text-[10px] text-slate-500 mt-1">{txn.paymentMethod}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={txn.userAvatar} 
                                                            alt="User" 
                                                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-700 dark:text-slate-200 text-xs font-bold">{txn.userName}</span>
                                                            <span className="text-[10px] text-slate-500">{txn.userEmail}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                        txn.planName === 'Supreme' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                                                        txn.planName === 'Elite' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                                                        txn.planName === 'Premium' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                        txn.planName === 'Deluxe' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                                                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                                    }`}>
                                                        {txn.planName}
                                                    </span>
                                                    <div className="text-[10px] text-slate-500 mt-1">{txn.billingCycle}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                        <CalendarDays size={12} className="text-slate-400" />
                                                        <span>{txn.date}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-900 dark:text-white font-bold font-mono">
                                                        {formatCurrency(txn.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                                        txn.autoBilling 
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                        : 'bg-slate-200 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-500/20'
                                                    }`}>
                                                        {txn.autoBilling ? <RefreshCw size={10} /> : <Ban size={10} />}
                                                        {txn.autoBilling ? 'Auto On' : 'Manual'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {txn.status === 'Completed' && <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" />}
                                                        {txn.status === 'Pending' && <Loader2 size={14} className="text-amber-500 dark:text-amber-400 animate-spin" />}
                                                        {txn.status === 'Failed' && <XCircle size={14} className="text-red-500 dark:text-red-400" />}
                                                        <span className={`text-xs font-bold ${
                                                            txn.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' :
                                                            txn.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' :
                                                            'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {txn.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => setToast({ message: `Downloading invoice for ${txn.id}...`, type: 'loading' })}
                                                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/20 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
                                                        title="Download Invoice"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Search size={32} className="opacity-20" />
                                                    <p>No transactions found matching your criteria.</p>
                                                    <button 
                                                        onClick={() => { setTxnSearchQuery(''); setTxnStatusFilter('All'); handleTxnDateRangeSelect('All Time'); }} 
                                                        className="text-primary dark:text-blue-500 hover:underline text-xs"
                                                    >
                                                        Clear Filters
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/30">
                            <span className="text-xs text-slate-500">
                                Showing {currentTransactions.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} results
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {/* Simple Pagination Logic: Show range around current page if too many pages */}
                                    {(() => {
                                        const pages = [];
                                        const maxVisiblePages = 5;
                                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                                        if (endPage - startPage + 1 < maxVisiblePages) {
                                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                        }

                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                        currentPage === i
                                                        ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }
                                        return pages;
                                    })()}
                                </div>

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Plan Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Subscription Plan"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Plan Name</label>
                            <input 
                                required
                                type="text" 
                                name="name"
                                value={createForm.name}
                                onChange={handleCreateInputChange}
                                placeholder="e.g. Starter"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500" 
                            />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Monthly Price (PHP)</label>
                            <input 
                                required
                                type="number" 
                                name="price"
                                min="0"
                                value={createForm.price}
                                onChange={handleCreateInputChange}
                                placeholder="e.g. 1500"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Yearly Price (PHP)</label>
                             <div className="relative">
                                <input 
                                    type="number" 
                                    name="yearlyPrice"
                                    min="0"
                                    value={createForm.yearlyPrice}
                                    onChange={handleCreateInputChange}
                                    placeholder="e.g. 15000"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 pr-16 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 text-[10px]">
                                    Optional
                                </div>
                             </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">kWh Allowance</label>
                            <input 
                                required
                                type="number" 
                                name="kwhAllowance"
                                min="0"
                                value={createForm.kwhAllowance}
                                onChange={handleCreateInputChange}
                                placeholder="e.g. 100"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                                <Tag size={14} /> Yearly Savings Text
                            </label>
                            <input 
                                type="text"
                                name="yearlySavingsText"
                                value={createForm.yearlySavingsText}
                                onChange={handleCreateInputChange}
                                placeholder="e.g. Save 10% with yearly billing"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                                <Bookmark size={14} /> Plan Tag / Badge
                            </label>
                            <input 
                                type="text"
                                name="tag"
                                value={createForm.tag}
                                onChange={handleCreateInputChange}
                                placeholder="e.g. Most Popular"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                            <Palette size={14} /> Card Theme
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {THEMES.map((theme, index) => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => setCreateForm(prev => ({ ...prev, themeIndex: index }))}
                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.color} shrink-0 border-2 transition-all ${
                                        createForm.themeIndex === index ? 'border-primary dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                                    }`}
                                    title={theme.name}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500">Selected: <span className="text-slate-900 dark:text-white font-medium">{THEMES[createForm.themeIndex].name}</span></p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                             <FileText size={14} /> Features List
                        </label>
                        <textarea 
                            name="features"
                            value={createForm.features}
                            onChange={handleCreateInputChange}
                            placeholder="Enter features (one per line)..."
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 resize-none custom-scrollbar" 
                        />
                        <p className="text-[10px] text-slate-500">Separate each feature with a new line.</p>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-white/10 mt-2">
                        <button 
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!isCreateFormValid}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all ${
                                isCreateFormValid 
                                ? 'bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white shadow-blue-500/20' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            Create Plan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Plan Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Plan: ${selectedPlan?.name || ''}`}
            >
                {selectedPlan && (
                    <form onSubmit={handleUpdatePlan} className="space-y-6">
                        <div className={`p-4 rounded-xl bg-gradient-to-r ${selectedPlan.color} flex items-center justify-between shadow-lg`}>
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    {selectedPlan.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedPlan.name} Tier</h3>
                                    <p className="text-white/80 text-xs">ID: {selectedPlan.id}</p>
                                </div>
                            </div>
                            <div className="text-right text-white">
                                <p className="text-2xl font-bold">{formatCurrency(selectedPlan.price)}</p>
                                <p className="text-white/80 text-xs">per month</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Plan Name</label>
                                <input 
                                    name="name"
                                    type="text" 
                                    defaultValue={selectedPlan.name}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-2">
                                    <Bookmark size={12} /> Plan Tag / Badge
                                </label>
                                <input 
                                    name="tag"
                                    type="text" 
                                    defaultValue={selectedPlan.tag || ''}
                                    placeholder="e.g. Most Popular"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Monthly Price (PHP)</label>
                                <input 
                                    name="price"
                                    type="number" 
                                    defaultValue={selectedPlan.price}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Yearly Price (PHP)</label>
                                <input 
                                    name="yearlyPrice"
                                    type="number" 
                                    defaultValue={selectedPlan.yearlyPrice}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">kWh Allowance</label>
                                    <input 
                                        name="kwhAllowance"
                                        type="number" 
                                        defaultValue={selectedPlan.kwhAllowance}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                    />
                            </div>
                            <div>
                                 <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Yearly Savings Text</label>
                                    <input 
                                        name="yearlySavingsText"
                                        type="text" 
                                        defaultValue={selectedPlan.yearlySavingsText || 'Save 10% with yearly billing'}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                                    />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2">Features & Benefits</label>
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2 max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                {editableFeatures.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg group animate-in fade-in slide-in-from-left-2 duration-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 dark:bg-blue-500/50 flex-shrink-0" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-1">{feature}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveFeature(idx)}
                                            className="ml-auto text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                
                                {isAddingFeature ? (
                                    <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-primary/20 dark:border-blue-500/30 animate-in fade-in zoom-in-95 duration-200">
                                        <input
                                            ref={featureInputRef}
                                            type="text"
                                            value={newFeatureText}
                                            onChange={(e) => setNewFeatureText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddFeature();
                                                }
                                                if (e.key === 'Escape') {
                                                    handleCancelAddFeature();
                                                }
                                            }}
                                            placeholder="Type feature..."
                                            className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500 p-0"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleAddFeature}
                                            className="p-1 hover:bg-blue-500/20 text-primary dark:text-blue-400 rounded transition-colors"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleCancelAddFeature}
                                            className="p-1 hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddingFeature(true)}
                                        className="w-full py-2 text-xs text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium border-t border-slate-200 dark:border-white/5 mt-1 flex items-center justify-center gap-1 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors rounded-b-lg"
                                    >
                                        <Plus size={14} /> Add Feature
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-white/10">
                            <button 
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-2.5 rounded-xl bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Global Settings Modal */}
            <Modal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title="Global Subscription Settings"
            >
                <form onSubmit={handleSaveGlobalSettings} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                                <Globe size={14} /> Default Currency
                            </label>
                            <select 
                                value={globalSettings.currency}
                                onChange={(e) => setGlobalSettings({...globalSettings, currency: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none"
                            >
                                <option value="PHP">Philippine Peso (PHP)</option>
                                <option value="USD">US Dollar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                                <Percent size={14} /> VAT Rate (%)
                            </label>
                            <input 
                                type="number" 
                                min="0"
                                max="100"
                                value={globalSettings.taxRate}
                                onChange={(e) => setGlobalSettings({...globalSettings, taxRate: Number(e.target.value)})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                            <div className="space-y-1">
                                <span className="text-sm font-bold text-slate-900 dark:text-white block">Enable Yearly Billing</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Allow users to subscribe to yearly plans for a discount.</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setGlobalSettings(prev => ({ ...prev, enableYearlyBilling: !prev.enableYearlyBilling }))}
                                className={`w-12 h-6 rounded-full transition-colors relative ${globalSettings.enableYearlyBilling ? 'bg-primary dark:bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${globalSettings.enableYearlyBilling ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                                <Clock size={14} /> Payment Grace Period (Days)
                            </label>
                            <input 
                                type="number" 
                                min="0"
                                value={globalSettings.gracePeriod}
                                onChange={(e) => setGlobalSettings({...globalSettings, gracePeriod: Number(e.target.value)})}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" 
                            />
                            <p className="text-[10px] text-slate-500">Number of days before a subscription is suspended after failed payment.</p>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-white/10 mt-2">
                        <button 
                            type="button"
                            onClick={() => setIsSettingsModalOpen(false)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Status Toggle Confirmation Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title={planToToggleStatus?.status === 'Active' ? 'Disable Plan' : 'Enable Plan'}
            >
                {planToToggleStatus && (
                    <div className="space-y-4">
                        <div className={`border rounded-lg p-4 flex items-start gap-3 ${
                            planToToggleStatus.status === 'Active' 
                            ? 'bg-red-500/10 border-red-500/30' 
                            : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}>
                            {planToToggleStatus.status === 'Active' 
                                ? <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                : <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                            }
                            <div>
                                <h4 className={`font-bold text-sm uppercase tracking-wide ${
                                    planToToggleStatus.status === 'Active' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    {planToToggleStatus.status === 'Active' ? 'Confirm Deactivation' : 'Confirm Activation'}
                                </h4>
                                <p className={`text-sm mt-1 ${
                                    planToToggleStatus.status === 'Active' ? 'text-red-700 dark:text-red-200' : 'text-emerald-700 dark:text-emerald-200'
                                }`}>
                                    {planToToggleStatus.status === 'Active' 
                                        ? `Are you sure you want to disable the ${planToToggleStatus.name} plan? New users will not be able to subscribe, but existing users may continue until their cycle ends.` 
                                        : `Are you sure you want to enable the ${planToToggleStatus.name} plan? It will become immediately visible to all users for subscription.`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                            <button 
                                onClick={() => setIsStatusModalOpen(false)} 
                                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmToggleStatus} 
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center gap-2 ${
                                    planToToggleStatus.status === 'Active'
                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                                }`}
                            >
                                {planToToggleStatus.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                                {planToToggleStatus.status === 'Active' ? 'Disable Plan' : 'Enable Plan'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Plan"
            >
                <div className="space-y-4">
                    {planToDelete && planToDelete.activeUsers > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">Warning: Active Subscribers</h4>
                                <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                    There are currently <strong>{planToDelete.activeUsers.toLocaleString()}</strong> active users on this plan. 
                                    Deleting it will force these users to migrate or lose access.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <p className="text-slate-600 dark:text-slate-300">
                        Are you sure you want to permanently delete the <strong className="text-slate-900 dark:text-white">{planToDelete?.name}</strong> plan? 
                        This action cannot be undone.
                    </p>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDeletePlan} 
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Delete Plan
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};