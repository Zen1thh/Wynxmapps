import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { MOCK_REVIEWS, MOCK_USERS, MOCK_STATIONS } from '../constants';
import gsap from 'gsap';
import { 
    Star, ThumbsUp, AlertCircle, Check, X, Search, Filter, 
    MessageSquare, Smartphone, MapPin, MoreHorizontal, 
    CornerDownRight, Trash2, CheckCircle2, 
    TrendingUp, Flag, Eye, Download, Loader2,
    Reply, AlertTriangle, Hammer, CheckCheck, Timer,
    Calendar, ChevronDown, Archive, RotateCcw, Inbox
} from 'lucide-react';

// --- Types ---

type ReviewType = 'App' | 'Station';
// Expanded status list to include issue tracking
type ReviewStatus = 'Published' | 'Pending' | 'Flagged' | 'Hidden' | 'Priority' | 'In Progress' | 'Resolved';

interface ExtendedReview {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: ReviewType;
    rating: number;
    comment: string;
    date: string;
    status: ReviewStatus;
    likes: number;
    reply?: string;
    isArchived: boolean; // New property
    // Station specific
    stationId?: string;
    stationName?: string;
    // App specific
    appVersion?: string;
    platform?: 'iOS' | 'Android';
    device?: string;
}

// --- Mock Data Generation ---

const generateMockData = (): ExtendedReview[] => {
    // Curated lists for variety
    const APP_COMMENTS = [
        "The new UI update is sleek! Love the dark mode, but the map takes a while to load on 4G.",
        "App crashes frequently when I try to filter by connector type. Please fix asap.",
        "Best EV charging app in Manila. The route planner is a lifesaver.",
        "Payment failed three times before going through. Needs work on the gateway.",
        "Very user friendly, but it drains my battery in the background significantly.",
        "I wish there was a way to reserve a slot more than 30 mins in advance.",
        "Smooth experience on iOS, verified with GCash works perfectly.",
        "The QR code scanner is a bit hit or miss in low light conditions.",
        "Great updates recently. The real-time availability is finally accurate.",
        "Can we get Apple Watch support? Would be great to check charge status on wrist.",
        "Login via biometrics keeps resetting. Annoying bug.",
        "Love the rewards program integration!",
        "Navigation sometimes directs to the back entrance of malls.",
        "Clean interface, no clutter. Exactly what I need.",
        "Notification delays make it hard to know when my car is done charging."
    ];

    const STATION_COMMENTS = [
        "Charging was fast but the area is a bit dark at night. Would appreciate more lighting.",
        "Great location near the mall entrance. Clean and well maintained.",
        "One of the connectors (Slot 2) is damaged and won't lock properly.",
        "Blocked by a gas car again! Security needs to enforce the EV-only rules.",
        "Excellent charging speed, hit 120kW consistent on my Ioniq 5.",
        "The touch screen on the charger is unresponsive and sun-damaged.",
        "Nice waiting area with a vending machine nearby. Very convenient.",
        "Queue was long but the line moved fast. Good turnover rate.",
        "Cable is a bit short for cars with charging ports on the rear left.",
        "Solar canopy is awesome, nice to know I'm charging with green energy.",
        "Station offline but app said it was available. Wasted trip.",
        "Best charging hub in the city. Always reliable.",
        "Connectors are heavy and hard to maneuver.",
        "Pricier than other stations but worth it for the speed.",
        "Needs a trash bin nearby, area was a bit littered."
    ];

    // Combine existing mock reviews with generated ones for a full UI
    const stationReviews: ExtendedReview[] = MOCK_REVIEWS.map(r => ({
        ...r,
        userAvatar: `https://i.pravatar.cc/150?u=${r.userId}`,
        type: 'Station',
        likes: Math.floor(Math.random() * 20),
        status: r.status as ReviewStatus,
        isArchived: false
    }));

    const generatedReviews: ExtendedReview[] = Array.from({ length: 25 }).map((_, i) => {
        const isStation = Math.random() > 0.4;
        const user = MOCK_USERS[i % MOCK_USERS.length];
        const station = MOCK_STATIONS[i % MOCK_STATIONS.length];
        
        // Weighted random status generation
        const rand = Math.random();
        let status: ReviewStatus = 'Published';
        if (rand > 0.9) status = 'Flagged';
        else if (rand > 0.8) status = 'Pending';
        else if (rand > 0.7) status = 'Priority';
        else if (rand > 0.6) status = 'In Progress';
        else if (rand > 0.5) status = 'Resolved';
        
        // Select random comment based on type
        const commentPool = isStation ? STATION_COMMENTS : APP_COMMENTS;
        const comment = commentPool[Math.floor(Math.random() * commentPool.length)];

        return {
            id: `gen_rev_${i}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
            type: isStation ? 'Station' : 'App',
            rating: Math.floor(Math.random() * 2) + 3 + (Math.random() > 0.7 ? 1 : 0), // Mostly 3-5 stars
            comment: comment,
            date: new Date(Date.now() - Math.floor(Math.random() * 1000000000 * 2)).toISOString().split('T')[0],
            status: status,
            likes: Math.floor(Math.random() * 50),
            stationId: isStation ? station.id : undefined,
            stationName: isStation ? station.name : undefined,
            appVersion: !isStation ? `v2.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 9)}` : undefined,
            platform: !isStation ? (Math.random() > 0.5 ? 'iOS' : 'Android') : undefined,
            device: !isStation ? (Math.random() > 0.5 ? 'iPhone 14 Pro' : Math.random() > 0.5 ? 'Samsung S23' : 'Pixel 7') : undefined,
            isArchived: Math.random() > 0.9 // 10% chance started archived
        };
    });

    return [...stationReviews, ...generatedReviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// --- Components ---

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
                 type === 'error' ? <AlertCircle size={14} className="text-red-500 dark:text-red-400" /> :
                 <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={14} className="text-emerald-500 dark:text-emerald-400" /></div>}
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: string; subtext?: React.ReactNode; icon: React.ReactNode; color: string }> = ({ label, value, subtext, icon, color }) => (
    <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
        <div className={`absolute right-2 top-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-lg ${color}`}>
            {icon}
        </div>
        <div className="relative z-10 mt-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{label}</p>
            {subtext && <div className="text-slate-500 dark:text-slate-400 text-xs mt-2 flex items-center gap-1">{subtext}</div>}
        </div>
    </div>
);

const RatingStars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star 
                key={star} 
                size={size} 
                className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 dark:fill-slate-700 text-slate-200 dark:text-slate-700'}`} 
            />
        ))}
    </div>
);

export const Reviews: React.FC = () => {
    const containerRef = useRef(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const dateFilterRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Data State
    const [allReviews, setAllReviews] = useState<ExtendedReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // View & Filter State
    const [activeTab, setActiveTab] = useState<ReviewType>('App');
    const [viewMode, setViewMode] = useState<'inbox' | 'archived'>('inbox');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | ReviewStatus>('All');
    const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Date Filter State (Single Date Selection)
    const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD format
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

    // Modal & Action State
    const [selectedReview, setSelectedReview] = useState<ExtendedReview | null>(null);
    const [replyText, setReplyText] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'loading' | 'error' } | null>(null);
    
    // Delete/Archive/Restore Logic State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    
    const [reviewToDelete, setReviewToDelete] = useState<ExtendedReview | null>(null);
    const [reviewToArchive, setReviewToArchive] = useState<ExtendedReview | null>(null);
    const [reviewToRestore, setReviewToRestore] = useState<ExtendedReview | null>(null);
    
    // Detached Dropdown State
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

    // Initial Load
    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            setAllReviews(generateMockData());
            setIsLoading(false);
            
            // GSAP Entrance
            gsap.fromTo(".stat-card", 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.1 }
            );
        }, 500);
    }, []);

    // Close Dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Handle detached dropdown
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                if (!target.closest('[data-dropdown-trigger]')) {
                    setActiveDropdownId(null);
                }
            }
            if (filterRef.current && !filterRef.current.contains(target)) {
                setIsFilterOpen(false);
            }
            if (dateFilterRef.current && !dateFilterRef.current.contains(target)) {
                setIsDateFilterOpen(false);
            }
        };
        // Use capture to ensure we catch clicks even if propagation stopped elsewhere
        document.addEventListener('mousedown', handleClickOutside, true);
        // Also handle scroll to close fixed dropdowns
        window.addEventListener('scroll', () => setActiveDropdownId(null), true);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            window.removeEventListener('scroll', () => setActiveDropdownId(null), true);
        };
    }, []);

    // Filter Logic
    const filteredReviews = useMemo(() => {
        return allReviews.filter(review => {
            if (review.type !== activeTab) return false;
            
            // Archive Logic
            const isArchived = review.isArchived ?? false;
            if (viewMode === 'inbox' && isArchived) return false;
            if (viewMode === 'archived' && !isArchived) return false;

            const matchesSearch = 
                review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (review.stationName && review.stationName.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
            const matchesRating = ratingFilter === 'All' || review.rating === ratingFilter;

            const matchesDate = !selectedDate || review.date === selectedDate;

            return matchesSearch && matchesStatus && matchesRating && matchesDate;
        });
    }, [allReviews, activeTab, viewMode, searchQuery, statusFilter, ratingFilter, selectedDate]);

    // Stats Logic (Calculated based on Active tab only)
    const stats = useMemo(() => {
        const typeReviews = allReviews.filter(r => r.type === activeTab && !r.isArchived);
        const avgRating = typeReviews.length > 0 
            ? (typeReviews.reduce((acc, r) => acc + r.rating, 0) / typeReviews.length).toFixed(1) 
            : '0.0';
        const pendingCount = typeReviews.filter(r => r.status === 'Pending').length;
        const priorityCount = typeReviews.filter(r => r.status === 'Priority').length;
        
        // Calculate NPS approximation (5 stars = promoter, 4 = passive, 1-3 = detractor)
        const promoters = typeReviews.filter(r => r.rating === 5).length;
        const detractors = typeReviews.filter(r => r.rating <= 3).length;
        const nps = typeReviews.length > 0 ? Math.round(((promoters - detractors) / typeReviews.length) * 100) : 0;

        return { avgRating, pendingCount, priorityCount, nps };
    }, [allReviews, activeTab]);

    // Actions
    const handleStatusUpdate = (id: string, newStatus: ReviewStatus) => {
        setAllReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setToast({ message: `Review marked as ${newStatus}`, type: 'success' });
        setActiveDropdownId(null);
        if (selectedReview?.id === id) {
            setSelectedReview(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    const handleDeleteClick = (review: ExtendedReview) => {
        setReviewToDelete(review);
        setIsDeleteModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmDelete = () => {
        if (reviewToDelete) {
            setAllReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
            setToast({ message: 'Review deleted successfully', type: 'success' });
            if (selectedReview?.id === reviewToDelete.id) setSelectedReview(null);
            setIsDeleteModalOpen(false);
            setReviewToDelete(null);
        }
    };

    const handleArchiveClick = (review: ExtendedReview) => {
        setReviewToArchive(review);
        setIsArchiveModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmArchive = () => {
        if (reviewToArchive) {
            setAllReviews(prev => prev.map(r => r.id === reviewToArchive.id ? { ...r, isArchived: true } : r));
            setToast({ message: 'Review archived successfully', type: 'success' });
            if (selectedReview?.id === reviewToArchive.id) setSelectedReview(null);
            setIsArchiveModalOpen(false);
            setReviewToArchive(null);
        }
    };

    const handleRestoreClick = (review: ExtendedReview) => {
        setReviewToRestore(review);
        setIsRestoreModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmRestore = () => {
        if (reviewToRestore) {
            setAllReviews(prev => prev.map(r => r.id === reviewToRestore.id ? { ...r, isArchived: false } : r));
            setToast({ message: 'Review restored to inbox', type: 'success' });
            setIsRestoreModalOpen(false);
            setReviewToRestore(null);
        }
    };

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReview || !replyText.trim()) return;

        setAllReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, reply: replyText, status: 'Published' } : r));
        setToast({ message: 'Reply posted successfully', type: 'success' });
        setReplyText('');
        setSelectedReview(null);
    };

    const handleExport = () => {
        setToast({ message: 'Exporting reviews to CSV...', type: 'loading' });
        setTimeout(() => setToast({ message: 'Download started', type: 'success' }), 1500);
    };

    const toggleDropdown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (activeDropdownId === id) {
            setActiveDropdownId(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 2,
                right: document.documentElement.clientWidth - rect.right
            });
            setActiveDropdownId(id);
        }
    };

    // Helper: Badge Styles
    const getStatusBadge = (status: ReviewStatus) => {
        switch (status) {
            case 'Published': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Pending': return 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20';
            case 'Flagged': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            case 'Hidden': return 'bg-slate-700/50 text-slate-500 border-slate-700/50 grayscale';
            
            // New Tracking Statuses
            case 'Priority': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 shadow-[0_0_8px_rgba(249,115,22,0.2)] animate-pulse-slow';
            case 'In Progress': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
            case 'Resolved': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
            
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    const getStatusIcon = (status: ReviewStatus) => {
        switch (status) {
            case 'Published': return <CheckCircle2 size={12} />;
            case 'Priority': return <AlertTriangle size={12} />;
            case 'In Progress': return <Hammer size={12} />;
            case 'Resolved': return <CheckCheck size={12} />;
            case 'Flagged': return <Flag size={12} />;
            default: return null;
        }
    }

    return (
        <div ref={containerRef} className="space-y-6 pb-10 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Review Moderation</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Monitor user feedback, manage ratings, and respond to community inquiries.
                    </p>
                </div>
                <div className="flex gap-3">
                     <button 
                        onClick={handleExport}
                        className="bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <StatCard 
                        label="Average Rating" 
                        value={stats.avgRating} 
                        subtext={
                            <span className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 font-medium">
                                <Star size={12} fill="currentColor" /> Out of 5.0
                            </span>
                        }
                        icon={<Star size={20} />} 
                        color="text-yellow-500 dark:text-yellow-400" 
                    />
                </div>
                <div className="stat-card">
                    <StatCard 
                        label="Net Promoter Score" 
                        value={stats.nps > 0 ? `+${stats.nps}` : stats.nps.toString()} 
                        subtext={
                            <span className={`flex items-center gap-1 font-medium ${stats.nps > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                <TrendingUp size={12} className={stats.nps > 0 ? '' : 'rotate-180'} />
                                {stats.nps > 30 ? 'Excellent' : stats.nps > 0 ? 'Good' : 'Needs Work'}
                            </span>
                        }
                        icon={<ThumbsUp size={20} />} 
                        color="text-blue-500 dark:text-blue-400" 
                    />
                </div>
                <div className="stat-card">
                    <StatCard 
                        label="Priority Issues" 
                        value={stats.priorityCount.toString()} 
                        subtext={<span className="text-orange-600 dark:text-orange-400 font-bold">Needs Resolution</span>}
                        icon={<AlertTriangle size={20} />} 
                        color="text-orange-500 dark:text-orange-400" 
                    />
                </div>
                <div className="stat-card">
                    <StatCard 
                        label="Pending Approval" 
                        value={stats.pendingCount.toString()} 
                        subtext={<span className="text-slate-500 dark:text-slate-400">Moderation Queue</span>}
                        icon={<Timer size={20} />} 
                        color="text-slate-500 dark:text-slate-400" 
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">
                {/* Tabs & Toolbar - Added z-30 here to ensure it sits above the list */}
                <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white/80 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md relative z-30">
                    {/* Primary Context Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 w-fit">
                        <button
                            onClick={() => { setActiveTab('App'); setViewMode('inbox'); }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'App' 
                                ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                            }`}
                        >
                            <Smartphone size={16} /> App Reviews
                        </button>
                        <button
                            onClick={() => { setActiveTab('Station'); setViewMode('inbox'); }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'Station' 
                                ? 'bg-primary dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                            }`}
                        >
                            <MapPin size={16} /> Station Reviews
                        </button>
                    </div>

                    {/* Filters & Secondary View Toggle */}
                    <div className="flex flex-1 md:flex-none gap-3 items-center flex-wrap">
                        {/* Inbox / Archived Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 p-1 h-full">
                            <button
                                onClick={() => setViewMode('inbox')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    viewMode === 'inbox' 
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                                }`}
                                title="Inbox"
                            >
                                <Inbox size={14} /> Inbox
                            </button>
                            <button
                                onClick={() => setViewMode('archived')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    viewMode === 'archived' 
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/20' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                                }`}
                                title="Archived"
                            >
                                <Archive size={14} /> Archived
                            </button>
                        </div>

                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10 mx-1 hidden md:block"></div>

                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search comments, users..." 
                                className="w-full h-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        {/* Date Filter (Specific Date Picker) */}
                        <div className="relative" ref={dateFilterRef}>
                            <button 
                                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                                className={`h-full px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
                                    isDateFilterOpen || selectedDate 
                                    ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-primary dark:text-blue-400' 
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                            >
                                <Calendar size={16} />
                                <span className="whitespace-nowrap">
                                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'All Dates'}
                                </span>
                                <ChevronDown size={14} className={`opacity-50 transition-transform ${isDateFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDateFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Select Date</h4>
                                    <input 
                                        type="date" 
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setIsDateFilterOpen(false);
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                                    />
                                    {selectedDate && (
                                        <button 
                                            onClick={() => {
                                                setSelectedDate('');
                                                setIsDateFilterOpen(false);
                                            }}
                                            className="w-full mt-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-t border-slate-200 dark:border-white/5"
                                        >
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative" ref={filterRef}>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`h-full px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
                                    isFilterOpen || statusFilter !== 'All' || ratingFilter !== 'All'
                                    ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-primary dark:text-blue-400'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                            >
                                <Filter size={16} /> Filters
                                {(statusFilter !== 'All' || ratingFilter !== 'All') && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Status</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['All', 'Published', 'Pending', 'Priority', 'In Progress', 'Resolved', 'Flagged'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setStatusFilter(s as any)}
                                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                                            statusFilter === s 
                                                            ? 'bg-primary dark:bg-blue-600 text-white border-primary dark:border-blue-500' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Rating</label>
                                            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <button 
                                                    onClick={() => setRatingFilter('All')}
                                                    className={`flex-1 py-1 text-xs rounded font-bold ${ratingFilter === 'All' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                                >
                                                    All
                                                </button>
                                                {[5, 4, 3, 2, 1].map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={() => setRatingFilter(r)}
                                                        className={`w-8 py-1 text-xs rounded font-bold flex items-center justify-center ${
                                                            ratingFilter === r 
                                                            ? 'bg-yellow-500 text-slate-900 shadow-sm' 
                                                            : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
                                                        }`}
                                                    >
                                                        {r} <Star size={8} fill="currentColor" className="ml-0.5" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                                            <button 
                                                onClick={() => {
                                                    setStatusFilter('All');
                                                    setRatingFilter('All');
                                                    setIsFilterOpen(false);
                                                }}
                                                className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                                            >
                                                Reset Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Grid - Removed AnimatePresence and Framer Motion for list items */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-primary dark:text-blue-500" />
                        <p>Loading reviews...</p>
                    </div>
                ) : filteredReviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 relative z-10">
                        {filteredReviews.map((review) => (
                            <div
                                key={review.id}
                                className="glass-card p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all group shadow-sm"
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Review Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={review.userAvatar} 
                                                    alt={review.userName} 
                                                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 object-cover" 
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{review.userName}</h3>
                                                        {review.type === 'App' && review.platform && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                                {review.platform}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-slate-500">• {review.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <RatingStars rating={review.rating} />
                                                        {review.type === 'Station' ? (
                                                            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate max-w-[200px]">
                                                                <MapPin size={10} /> {review.stationName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-500 font-mono">
                                                                {review.appVersion} on {review.device}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {review.isArchived && (
                                                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                                        <Archive size={10} /> Archived
                                                    </span>
                                                )}
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1.5 ${getStatusBadge(review.status)}`}>
                                                    {getStatusIcon(review.status)}
                                                    {review.status}
                                                </span>
                                                
                                                {/* Card Actions Dropdown Trigger */}
                                                <div className="relative">
                                                    <button 
                                                        data-dropdown-trigger
                                                        onClick={(e) => toggleDropdown(e, review.id)}
                                                        className={`p-1.5 rounded-lg transition-colors ${activeDropdownId === review.id ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">{review.comment}</p>
                                        </div>

                                        {review.reply && (
                                            <div className="mt-3 ml-4 pl-3 border-l-2 border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-2 rounded-r-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase">Support Team</span>
                                                    <span className="text-[10px] text-slate-500">Replied</span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{review.reply}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Action Buttons (Visible on desktop) */}
                                    <div className="hidden md:flex flex-col gap-2 justify-center border-l border-slate-200 dark:border-white/5 pl-4 min-w-[120px]">
                                        {!review.isArchived ? (
                                            <>
                                                <button 
                                                    onClick={() => setSelectedReview(review)}
                                                    className="w-full py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-primary dark:text-blue-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Reply size={12} /> Reply
                                                </button>
                                                <button 
                                                    onClick={() => handleArchiveClick(review)}
                                                    className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Archive size={12} /> Archive
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => handleRestoreClick(review)}
                                                className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <RotateCcw size={12} /> Restore
                                            </button>
                                        )}
                                        
                                        {/* Contextual Buttons - Only for Active/Inbox */}
                                        {review.status === 'Pending' && !review.isArchived && (
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                <button 
                                                    onClick={() => handleStatusUpdate(review.id, 'Published')}
                                                    className="py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors flex justify-center"
                                                    title="Approve"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(review.id, 'Hidden')}
                                                    className="py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors flex justify-center"
                                                    title="Reject"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
                        {viewMode === 'archived' ? <Archive size={48} className="opacity-20 mb-4" /> : <MessageSquare size={48} className="opacity-20 mb-4" />}
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No {viewMode === 'archived' ? 'archived ' : ''}reviews found</h3>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                        <button 
                            onClick={() => { 
                                setSearchQuery(''); 
                                setStatusFilter('All'); 
                                setRatingFilter('All');
                                setSelectedDate('');
                            }}
                            className="mt-4 text-primary dark:text-blue-400 text-sm hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Fixed Positioned Dropdown for Card Actions */}
            {activeDropdownId && (() => {
                const review = allReviews.find(r => r.id === activeDropdownId);
                if (!review) return null;
                return (
                    <div 
                        ref={dropdownRef}
                        className="fixed bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 w-56"
                        style={{ 
                            top: `${dropdownPos.top}px`, 
                            right: `${dropdownPos.right}px` 
                        }}
                    >
                        <div className="py-1">
                            <button onClick={() => { setSelectedReview(review); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2">
                                <Eye size={14}/> View Details
                            </button>
                            
                            {!review.isArchived ? (
                                <button onClick={() => handleArchiveClick(review)} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2">
                                    <Archive size={14}/> Archive Review
                                </button>
                            ) : (
                                <button onClick={() => handleRestoreClick(review)} className="w-full text-left px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2">
                                    <RotateCcw size={14}/> Restore to Inbox
                                </button>
                            )}

                            {/* Moderation Section */}
                            <div className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50 mt-1">Moderation</div>
                            {review.status === 'Pending' && (
                                <button onClick={() => handleStatusUpdate(review.id, 'Published')} className="w-full text-left px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2">
                                    <CheckCircle2 size={14}/> Approve & Publish
                                </button>
                            )}
                            {review.status !== 'Flagged' && (
                                <button onClick={() => handleStatusUpdate(review.id, 'Flagged')} className="w-full text-left px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2">
                                    <Flag size={14}/> Flag Content
                                </button>
                            )}

                            {/* Issue Tracking Section */}
                            <div className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50 mt-1">Issue Tracking</div>
                            <button onClick={() => handleStatusUpdate(review.id, 'Priority')} className="w-full text-left px-4 py-2.5 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 flex items-center gap-2">
                                <AlertTriangle size={14}/> Mark as Priority
                            </button>
                            <button onClick={() => handleStatusUpdate(review.id, 'In Progress')} className="w-full text-left px-4 py-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2">
                                <Hammer size={14}/> Mark In Progress
                            </button>
                            <button onClick={() => handleStatusUpdate(review.id, 'Resolved')} className="w-full text-left px-4 py-2.5 text-xs text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 flex items-center gap-2">
                                <CheckCheck size={14}/> Mark Resolved
                            </button>

                            <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-1"></div>
                            <button onClick={() => handleDeleteClick(review)} className="w-full text-left px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                <Trash2 size={14}/> Delete
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* Review Detail & Reply Modal */}
            <Modal
                isOpen={!!selectedReview}
                onClose={() => setSelectedReview(null)}
                title="Review Details"
                className="max-w-2xl"
            >
                {selectedReview && (
                    <div className="space-y-6">
                        {/* User Header */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                            <img src={selectedReview.userAvatar} className="w-14 h-14 rounded-full border-2 border-slate-200 dark:border-white/10" alt="" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedReview.userName}</h3>
                                <p className="text-xs text-slate-500">User ID: {selectedReview.userId}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <RatingStars rating={selectedReview.rating} size={16} />
                                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">({selectedReview.rating}.0)</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border mb-1 ${getStatusBadge(selectedReview.status)}`}>
                                    {getStatusIcon(selectedReview.status)}
                                    {selectedReview.status}
                                </div>
                                <p className="text-xs text-slate-500">{selectedReview.date}</p>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Review Content</h4>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                                    "{selectedReview.comment}"
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Context</p>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                        {selectedReview.type === 'App' ? <Smartphone size={14} className="text-blue-600 dark:text-blue-400"/> : <MapPin size={14} className="text-emerald-600 dark:text-emerald-400"/>}
                                        {selectedReview.type} Review
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Target</p>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium truncate">
                                        {selectedReview.type === 'App' 
                                            ? `${selectedReview.platform} ${selectedReview.appVersion}` 
                                            : selectedReview.stationName}
                                    </p>
                                </div>
                            </div>

                            {/* Issue Tracking Actions (Visible in Modal) */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Triage Issue</h4>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedReview.id, 'Priority')}
                                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${selectedReview.status === 'Priority' ? 'bg-orange-500 text-white border-orange-500' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                    >
                                        <AlertTriangle size={14} /> High Priority
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedReview.id, 'In Progress')}
                                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${selectedReview.status === 'In Progress' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                    >
                                        <Hammer size={14} /> In Progress
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedReview.id, 'Resolved')}
                                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${selectedReview.status === 'Resolved' ? 'bg-teal-500 text-white border-teal-500' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                    >
                                        <CheckCheck size={14} /> Resolved
                                    </button>
                                </div>
                            </div>

                            {/* Reply Section */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                                    <CornerDownRight size={14} /> 
                                    {selectedReview.reply ? 'Your Response' : 'Reply to User'}
                                </h4>
                                {selectedReview.reply ? (
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                                        <p className="text-sm text-blue-800 dark:text-blue-100">{selectedReview.reply}</p>
                                        <button 
                                            onClick={() => setAllReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, reply: undefined } : r))}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 font-medium"
                                        >
                                            Edit Reply
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReply}>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Write a reply to ${selectedReview.userName}...`}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 placeholder-slate-400 dark:placeholder-slate-500"
                                        />
                                        <div className="flex justify-end mt-2 gap-2">
                                            {selectedReview.status === 'Pending' && (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleStatusUpdate(selectedReview.id, 'Published')}
                                                    className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                >
                                                    Approve & Close
                                                </button>
                                            )}
                                            <button 
                                                type="submit"
                                                disabled={!replyText.trim()}
                                                className="px-4 py-2 rounded-lg text-xs font-bold bg-primary dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                            >
                                                Send Reply
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Archive Confirmation Modal */}
            <Modal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                title="Archive Review"
            >
                <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                        <Archive className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wide">Confirm Archive</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                                Are you sure you want to archive this review by <strong className="text-slate-900 dark:text-white">{reviewToArchive?.userName}</strong>?
                                It will be moved to the Archived tab and hidden from the main inbox.
                            </p>
                        </div>
                    </div>
                    
                    {reviewToArchive && (
                        <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 italic">
                            "{reviewToArchive.comment.length > 100 ? reviewToArchive.comment.substring(0, 100) + '...' : reviewToArchive.comment}"
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button 
                            onClick={() => setIsArchiveModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmArchive} 
                            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
                        >
                            <Archive size={16} /> Archive Review
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Restore Confirmation Modal */}
            <Modal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                title="Restore Review"
            >
                <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
                        <RotateCcw className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide">Confirm Restore</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-200 mt-1">
                                Are you sure you want to restore this review by <strong className="text-slate-900 dark:text-white">{reviewToRestore?.userName}</strong>?
                                It will be moved back to the main Inbox.
                            </p>
                        </div>
                    </div>
                    
                    {reviewToRestore && (
                        <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 italic">
                            "{reviewToRestore.comment.length > 100 ? reviewToRestore.comment.substring(0, 100) + '...' : reviewToRestore.comment}"
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button 
                            onClick={() => setIsRestoreModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmRestore} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            <RotateCcw size={16} /> Restore Review
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Review"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">Warning</h4>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                You are about to permanently delete a review by <strong className="text-slate-900 dark:text-white">{reviewToDelete?.userName}</strong>.
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    
                    {reviewToDelete && (
                        <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 italic">
                            "{reviewToDelete.comment.length > 100 ? reviewToDelete.comment.substring(0, 100) + '...' : reviewToDelete.comment}"
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Delete Review
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};