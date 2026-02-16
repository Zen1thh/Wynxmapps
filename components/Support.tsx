import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import gsap from 'gsap';
import { 
    Send, Phone, Video, MoreVertical, Paperclip, Search, 
    Filter, CheckCircle2, Clock, AlertCircle, Smartphone, 
    Zap, MapPin, User, ChevronRight, Archive, MessageSquare,
    CornerUpLeft, Bot, Battery, Signal, Terminal, Crown, Shield,
    Trash2, AlertTriangle, AlertOctagon, RotateCcw, Calendar, ChevronDown, X
} from 'lucide-react';

// --- Types ---

type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
type TicketType = 'Station' | 'App' | 'Account';

interface Message {
    id: string;
    sender: 'user' | 'agent' | 'system';
    text: string;
    timestamp: string;
    attachments?: string[];
}

interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userEmail: string;
    userType: string; // e.g., 'Elite Subscriber'
    subject: string;
    preview: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    createdAt: string;
    date: string; // YYYY-MM-DD for filtering
    messages: Message[];
    isArchived?: boolean;
    // Context Data
    stationId?: string;
    stationName?: string;
    stationLocation?: string;
    deviceInfo?: string; // e.g., "iPhone 14 Pro, iOS 17.2"
    appVersion?: string; // e.g., "v2.4.1"
}

// --- Mock Data ---

const getDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

const MOCK_TICKETS: SupportTicket[] = [
    {
        id: 'TCK-2024-001',
        userId: 'usr_1',
        userName: 'Alex Johnson',
        userAvatar: 'https://i.pravatar.cc/150?u=alex',
        userEmail: 'alex.j@example.com',
        userType: 'Elite Subscriber',
        subject: 'Connector Stuck at Ayala Triangle',
        preview: 'I cannot disconnect the charging cable from my car...',
        status: 'Open',
        priority: 'High',
        type: 'Station',
        createdAt: '10 mins ago',
        date: getDate(0),
        isArchived: false,
        stationId: '1',
        stationName: 'Ayala Triangle Gardens',
        stationLocation: 'Paseo de Roxas, Makati',
        messages: [
            { id: 'm1', sender: 'user', text: 'Help! I finished charging 10 minutes ago but the connector is locked to my car port.', timestamp: '10:15 AM' },
            { id: 'm2', sender: 'user', text: 'I tried tapping my card again but it says "Session Ended".', timestamp: '10:16 AM' },
        ]
    },
    {
        id: 'TCK-2024-002',
        userId: 'usr_2',
        userName: 'Sarah Connor',
        userAvatar: 'https://i.pravatar.cc/150?u=sarah',
        userEmail: 'sarah.c@sky.net',
        userType: 'Basic User',
        subject: 'App Crashing on Payment Screen',
        preview: 'Every time I try to add a new GCash method...',
        status: 'In Progress',
        priority: 'Medium',
        type: 'App',
        createdAt: '2 hours ago',
        date: getDate(0),
        isArchived: false,
        deviceInfo: 'Samsung Galaxy S23 Ultra',
        appVersion: 'v2.4.0 (Build 892)',
        messages: [
            { id: 'm1', sender: 'user', text: 'Hi, the app crashes when I select GCash as a payment method.', timestamp: '08:30 AM' },
            { id: 'm2', sender: 'agent', text: 'Hello Sarah, thanks for reporting. Are you on the latest Android version?', timestamp: '08:45 AM' },
            { id: 'm3', sender: 'user', text: 'Yes, Android 14. One UI 6.0.', timestamp: '08:50 AM' },
        ]
    },
    {
        id: 'TCK-2024-003',
        userId: 'usr_5',
        userName: 'David Kim',
        userAvatar: 'https://i.pravatar.cc/150?u=david',
        userEmail: 'dkim@finance.com',
        userType: 'Premium Subscriber',
        subject: 'Billing Discrepancy',
        preview: 'I was charged for 45kwh but only received 30...',
        status: 'Resolved',
        priority: 'Low',
        type: 'Account',
        createdAt: '1 day ago',
        date: getDate(1),
        isArchived: false,
        messages: [
            { id: 'm1', sender: 'user', text: 'Please check my last invoice. Calculation seems off.', timestamp: 'Yesterday' },
            { id: 'm2', sender: 'system', text: 'Ticket marked as Resolved by Agent.', timestamp: 'Today 09:00 AM' }
        ]
    }
];

// --- Sub-Components ---

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const styles = {
        'Open': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse-slow',
        'In Progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        'Resolved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        'Escalated': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${styles[status]}`}>
            {status}
        </span>
    );
};

const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
    const colors = {
        'Critical': 'text-red-600 dark:text-red-500',
        'High': 'text-orange-600 dark:text-orange-500',
        'Medium': 'text-amber-600 dark:text-yellow-500',
        'Low': 'text-slate-500 dark:text-slate-400'
    };
    return (
        <div className="flex items-center gap-1">
            <AlertCircle size={12} className={colors[priority]} />
            <span className={`text-[10px] font-bold ${colors[priority]}`}>{priority}</span>
        </div>
    );
};

const UserTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    let styles = 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'; // Default
    let icon = null;
    const lower = type.toLowerCase();

    if (lower.includes('supreme')) {
        styles = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]';
        icon = <Crown size={10} />;
    } else if (lower.includes('elite')) {
        styles = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
        icon = <Crown size={10} />;
    } else if (lower.includes('premium')) {
        styles = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
        icon = <Shield size={10} />;
    } else if (lower.includes('deluxe')) {
        styles = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    } else if (lower.includes('standard')) {
        styles = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }

    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
            {icon} {type}
        </span>
    );
};

export const Support: React.FC = () => {
    const containerRef = useRef(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const headerMenuBtnRef = useRef<HTMLButtonElement>(null);
    const headerMenuDropdownRef = useRef<HTMLDivElement>(null);
    const dateFilterRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State
    const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
    const [selectedTicketId, setSelectedTicketId] = useState<string>(MOCK_TICKETS[0].id);
    const [filter, setFilter] = useState<'All' | 'Station' | 'App'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    const [headerMenuPos, setHeaderMenuPos] = useState({ top: 0, right: 0 });
    const [showArchived, setShowArchived] = useState(false);

    // Attachment State
    const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);

    // Date Filter State
    const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

    // Modal States
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const selectedTicket = useMemo(() => tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]);

    // Derived filtered list
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const isArchived = t.isArchived || false;
            if (showArchived && !isArchived) return false;
            if (!showArchived && isArchived) return false;

            const matchesFilter = filter === 'All' || t.type === filter;
            const matchesSearch = t.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  t.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDate = !selectedDate || t.date === selectedDate;

            return matchesFilter && matchesSearch && matchesDate;
        });
    }, [tickets, filter, searchTerm, showArchived, selectedDate]);

    // Animations
    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4 });
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedTicket?.messages]);

    // Handle click outside menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isHeaderMenuOpen &&
                headerMenuDropdownRef.current && 
                !headerMenuDropdownRef.current.contains(event.target as Node) &&
                headerMenuBtnRef.current &&
                !headerMenuBtnRef.current.contains(event.target as Node)
            ) {
                setIsHeaderMenuOpen(false);
            }
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
                setIsDateFilterOpen(false);
            }
        };
        // Use capture true to ensure we catch clicks
        document.addEventListener('mousedown', handleClickOutside, true);
        window.addEventListener('scroll', () => {
            setIsHeaderMenuOpen(false);
            setIsDateFilterOpen(false);
        }, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            window.removeEventListener('scroll', () => {
                setIsHeaderMenuOpen(false);
                setIsDateFilterOpen(false);
            }, true);
        };
    }, [isHeaderMenuOpen]);

    // Handlers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPendingAttachments(prev => [...prev, e.target.files![0]]);
        }
        // Reset input to allow selecting same file if cleared
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setPendingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        // Allow sending if there are attachments even if text is empty
        if ((!messageInput.trim() && pendingAttachments.length === 0) || !selectedTicket) return;

        const newMessage: Message = {
            id: `new_${Date.now()}`,
            sender: 'agent',
            text: messageInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachments: pendingAttachments.map(f => f.name)
        };

        setTickets(prev => prev.map(t => 
            t.id === selectedTicket.id 
            ? { ...t, messages: [...t.messages, newMessage], status: 'In Progress' } 
            : t
        ));
        setMessageInput('');
        setPendingAttachments([]);
    };

    const confirmResolveTicket = () => {
        if (!selectedTicket) return;
        const sysMsg: Message = {
            id: `sys_${Date.now()}`,
            sender: 'system',
            text: 'Ticket marked as Resolved by Agent.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setTickets(prev => prev.map(t => 
            t.id === selectedTicket.id 
            ? { ...t, messages: [...t.messages, sysMsg], status: 'Resolved' } 
            : t
        ));
        setIsResolveModalOpen(false);
    };

    const confirmArchiveTicket = () => {
        if (!selectedTicket) return;
        setTickets(prev => prev.map(t => 
            t.id === selectedTicket.id 
            ? { ...t, isArchived: true } 
            : t
        ));
        setIsArchiveModalOpen(false);
    };

    const confirmRestoreTicket = () => {
        if (!selectedTicket) return;
        setTickets(prev => prev.map(t => 
            t.id === selectedTicket.id 
            ? { ...t, isArchived: false } 
            : t
        ));
        // No modal for restore in this context, or we can reuse archive modal logic but different UI
    };

    const confirmReportUser = () => {
        // Mock reporting logic
        setIsReportModalOpen(false);
    };

    const confirmDeleteTicket = () => {
        if (!selectedTicket) return;
        setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
        // Select nearest available ticket if current is deleted
        const remaining = tickets.filter(t => t.id !== selectedTicket.id);
        if (remaining.length > 0) setSelectedTicketId(remaining[0].id);
        else setSelectedTicketId('');
        
        setIsDeleteModalOpen(false);
    };

    return (
        <div ref={containerRef} className="h-[calc(100vh-140px)] flex gap-4 overflow-hidden relative">
            {/* Left Pane: Ticket List */}
            <Card className="w-full md:w-80 lg:w-96 flex flex-col p-0 overflow-hidden border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-sm shrink-0">
                {/* Header & Filter */}
                <div className="p-4 border-b border-slate-200 dark:border-white/5 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Support Inbox</h3>
                            <span className="bg-primary dark:bg-blue-600 text-xs px-2 py-0.5 rounded-full text-white font-bold shadow-lg shadow-blue-500/20">
                                {tickets.filter(t => t.status !== 'Resolved' && !t.isArchived).length}
                            </span>
                        </div>
                        <button 
                            onClick={() => setShowArchived(!showArchived)}
                            className={`p-2 rounded-lg transition-colors ${showArchived ? 'bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            title={showArchived ? "Show Inbox" : "Show Archived"}
                        >
                            <Archive size={18} />
                        </button>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search tickets..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>
                        
                        {/* Date Filter */}
                        <div className="relative" ref={dateFilterRef}>
                            <button 
                                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                                className={`h-full px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                                    isDateFilterOpen || selectedDate 
                                    ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-primary dark:text-blue-400' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                                title="Filter by Date"
                            >
                                <Calendar size={14} />
                                {selectedDate && <span className="text-[10px] font-bold hidden sm:inline">{new Date(selectedDate).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}</span>}
                            </button>

                            {isDateFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95">
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Filter by Date</h4>
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
                                            className="w-full mt-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border-t border-slate-200 dark:border-white/5"
                                        >
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                        {['All', 'Station', 'App'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${filter === f ? 'bg-white dark:bg-blue-600 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0b1121]">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map(ticket => (
                            <div 
                                key={ticket.id} 
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={`p-4 border-b border-slate-100 dark:border-white/5 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/5 relative group ${selectedTicketId === ticket.id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-2 border-l-primary dark:border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        {ticket.type === 'Station' ? <Zap size={12} className="text-accent" /> : ticket.type === 'App' ? <Smartphone size={12} className="text-purple-500 dark:text-purple-400" /> : <User size={12} className="text-slate-400" />}
                                        <span className="text-[10px] font-mono text-slate-500 uppercase">{ticket.id}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500">{ticket.createdAt}</span>
                                </div>
                                
                                <h4 className={`text-sm font-bold mb-1 truncate ${selectedTicketId === ticket.id ? 'text-primary dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{ticket.subject}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{ticket.preview}</p>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img src={ticket.userAvatar} className="w-5 h-5 rounded-full border border-slate-200 dark:border-white/10" alt="" />
                                        <span className="text-xs text-slate-600 dark:text-slate-300">{ticket.userName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {ticket.isArchived && <Archive size={12} className="text-amber-500" />}
                                        <StatusBadge status={ticket.status} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs">
                            <Archive size={32} className="opacity-20 mb-2" />
                            <p>No tickets found</p>
                            {selectedDate && <p className="text-[10px] mt-1">for date {selectedDate}</p>}
                        </div>
                    )}
                </div>
            </Card>

            {/* Middle Pane: Chat Area */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden relative shadow-xl border border-slate-200 dark:border-white/5">
                {selectedTicket ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={selectedTicket.userAvatar} className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10" alt="" />
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${selectedTicket.userId === 'usr_1' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                        {selectedTicket.userName} 
                                        <UserTypeBadge type={selectedTicket.userType} />
                                    </h2>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <PriorityBadge priority={selectedTicket.priority} />
                                        <span className="text-xs text-slate-500">• {selectedTicket.userEmail}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors" title="Call User"><Phone size={18} /></button>
                                <button className="p-2 text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors" title="Start Video"><Video size={18} /></button>
                                
                                <button 
                                    ref={headerMenuBtnRef}
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setHeaderMenuPos({
                                            top: rect.bottom + 5,
                                            right: document.documentElement.clientWidth - rect.right
                                        });
                                        setIsHeaderMenuOpen(!isHeaderMenuOpen);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${isHeaderMenuOpen ? 'bg-slate-100 dark:bg-white/10 text-primary dark:text-white' : 'text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {isHeaderMenuOpen && createPortal(
                                    <div 
                                        ref={headerMenuDropdownRef}
                                        className="fixed bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right w-48"
                                        style={{ top: headerMenuPos.top, right: headerMenuPos.right }}
                                    >
                                        <div className="py-1">
                                            {selectedTicket.status !== 'Resolved' && (
                                                <button 
                                                    onClick={() => {
                                                        setIsHeaderMenuOpen(false);
                                                        setIsResolveModalOpen(true);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 font-bold"
                                                >
                                                    <CheckCircle2 size={14} /> Resolve Ticket
                                                </button>
                                            )}
                                            
                                            {!selectedTicket.isArchived ? (
                                                <button 
                                                    onClick={() => {
                                                        setIsHeaderMenuOpen(false);
                                                        setIsArchiveModalOpen(true);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                                                >
                                                    <Archive size={14} /> Archive Ticket
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setIsHeaderMenuOpen(false);
                                                        confirmRestoreTicket();
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                                                >
                                                    <RotateCcw size={14} /> Restore Ticket
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => {
                                                    setIsHeaderMenuOpen(false);
                                                    setIsReportModalOpen(true);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                                            >
                                                <Shield size={14} /> Report User
                                            </button>

                                            <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-1"></div>

                                            <button 
                                                onClick={() => {
                                                    setIsHeaderMenuOpen(false);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete Ticket
                                            </button>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-gradient-to-b dark:from-[#0b1121] dark:to-[#0f172a] relative">
                            {/* Watermark/Background decoration */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                <Bot size={200} className="text-slate-900 dark:text-white" />
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-white/5 px-3 py-1 rounded-full text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <Clock size={10} /> Ticket Created: {selectedTicket.createdAt} <span className="opacity-50">|</span> {selectedTicket.date}
                                </div>
                            </div>

                            {selectedTicket.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'} ${msg.sender === 'system' ? 'justify-center' : ''}`}>
                                    {msg.sender === 'system' ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 my-2">
                                            <div className="h-[1px] w-8 bg-slate-300 dark:bg-slate-700"></div>
                                            <span>{msg.text}</span>
                                            <div className="h-[1px] w-8 bg-slate-300 dark:bg-slate-700"></div>
                                        </div>
                                    ) : (
                                        <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1 shadow-lg ${msg.sender === 'agent' ? 'bg-primary dark:bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}>
                                                {msg.sender === 'agent' ? 'Me' : selectedTicket.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`p-3.5 shadow-md text-sm leading-relaxed ${
                                                    msg.sender === 'agent' 
                                                    ? 'bg-primary dark:bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-none'
                                                }`}>
                                                    {msg.text}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/10 space-y-2">
                                                            {msg.attachments.map((att, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 bg-black/10 dark:bg-black/20 p-2 rounded-lg text-xs font-mono">
                                                                    <Paperclip size={12} className="opacity-50" />
                                                                    <span>{att}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] text-slate-500 mt-1 block ${msg.sender === 'agent' ? 'text-right mr-1' : 'ml-1'}`}>
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-md">
                            {/* Pending Attachments Preview */}
                            {pendingAttachments.length > 0 && (
                                <div className="flex gap-2 mb-3 flex-wrap animate-in slide-in-from-bottom-2 fade-in">
                                    {pendingAttachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 px-3 py-1.5 rounded-lg text-xs text-blue-700 dark:text-blue-200 font-medium">
                                            <Paperclip size={12} />
                                            <span className="max-w-[150px] truncate">{file.name}</span>
                                            <button onClick={() => removeAttachment(idx)} className="hover:text-red-500 transition-colors bg-white/50 dark:bg-white/10 rounded-full p-0.5"><X size={10}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Canned Responses / Quick Actions */}
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                                <button 
                                    onClick={() => setMessageInput("Can you please provide a screenshot of the error?")}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors"
                                >
                                    Request Screenshot
                                </button>
                                <button 
                                    onClick={() => setMessageInput("I've reset the station remotely. Please try again in 2 minutes.")}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors"
                                >
                                    Remote Reset
                                </button>
                                <button 
                                    onClick={() => setMessageInput("We are investigating this issue with our engineering team.")}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors"
                                >
                                    Escalate to Eng
                                </button>
                            </div>

                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-white/10 focus-within:border-primary/50 dark:focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-primary/20 dark:focus-within:ring-blue-500/20 transition-all shadow-sm">
                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-2 transition-colors rounded-xl hover:bg-slate-200 dark:hover:bg-white/5 ${pendingAttachments.length > 0 ? 'text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'text-slate-400 dark:text-slate-400 hover:text-primary dark:hover:text-white'}`}
                                    title="Attach File"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <textarea 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type your response..." 
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-900 dark:text-white resize-none py-2.5 max-h-32 placeholder-slate-400 dark:placeholder-slate-500 custom-scrollbar"
                                    rows={1}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!messageInput.trim() && pendingAttachments.length === 0}
                                    className="bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageSquare size={48} className="opacity-20 mb-4" />
                        <p>Select a ticket to start messaging</p>
                    </div>
                )}
            </Card>

            {/* Right Pane: Context Intelligence */}
            {selectedTicket && (
                <Card className="hidden xl:flex w-80 flex-col p-0 overflow-hidden border-l border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-sm shrink-0">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                            <Bot size={16} className="text-primary dark:text-blue-400" /> Context Intelligence
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Dynamic Context based on Ticket Type */}
                        {selectedTicket.type === 'Station' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-white/5">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Reported Station</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedTicket.stationName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                        <MapPin size={12} /> {selectedTicket.stationLocation}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-white/5 text-center">
                                            <p className="text-[10px] text-slate-500 uppercase">Status</p>
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Online</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-white/5 text-center">
                                            <p className="text-[10px] text-slate-500 uppercase">Load</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">85%</p>
                                        </div>
                                    </div>
                                    
                                    <button className="w-full py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-2">
                                        <Terminal size={12} /> View Station Logs
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Recent Events</h4>
                                    <div className="relative pl-4 border-l border-slate-200 dark:border-white/10 space-y-3">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <p className="text-xs text-slate-700 dark:text-white">Connector Error (Port 2)</p>
                                            <p className="text-[10px] text-slate-500">15 mins ago</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                            <p className="text-xs text-slate-700 dark:text-white">Session Started (Port 1)</p>
                                            <p className="text-[10px] text-slate-500">22 mins ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedTicket.type === 'App' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-white/5">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                                            <Smartphone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Device Info</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedTicket.deviceInfo}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">App Version</span>
                                            <span className="text-slate-900 dark:text-white font-mono">{selectedTicket.appVersion}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">OS Version</span>
                                            <span className="text-slate-900 dark:text-white font-mono">Android 14</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Last Login</span>
                                            <span className="text-slate-900 dark:text-white">Today, 08:15 AM</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-white/5 flex items-center gap-2">
                                            <Battery size={14} className="text-emerald-500 dark:text-emerald-400" />
                                            <span className="text-xs text-slate-900 dark:text-white font-bold">82%</span>
                                        </div>
                                        <div className="flex-1 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-white/5 flex items-center gap-2">
                                            <Signal size={14} className="text-blue-500 dark:text-blue-400" />
                                            <span className="text-xs text-slate-900 dark:text-white font-bold">5G</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Crash Logs</h4>
                                    <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-2 font-mono text-[10px] text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 overflow-hidden">
                                        <p>NullPointerException: PaymentGateway</p>
                                        <p className="opacity-50">at com.wynx.app.checkout (Line 402)</p>
                                        <p className="opacity-50">at android.os.Handler (Line 92)</p>
                                    </div>
                                    <button className="text-xs text-primary dark:text-blue-400 hover:underline flex items-center gap-1">
                                        <CornerUpLeft size={10} /> View Full Stack Trace
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Common User Profile */}
                        <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">User Profile</h4>
                            <div className="flex items-center gap-3 mb-4">
                                <img src={selectedTicket.userAvatar} className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10" alt="" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedTicket.userName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <UserTypeBadge type={selectedTicket.userType.replace(' Subscriber', '')} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                    <p className="text-[10px] text-slate-500">Total Spent</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">₱12,450</p>
                                </div>
                                <div className="p-2 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                    <p className="text-[10px] text-slate-500">Charges</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">42</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/80">
                        <button className="w-full py-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2">
                            <Archive size={14} /> View Past Tickets
                        </button>
                    </div>
                </Card>
            )}

            {/* --- Modals --- */}

            {/* Resolve Confirmation Modal */}
            <Modal
                isOpen={isResolveModalOpen}
                onClose={() => setIsResolveModalOpen(false)}
                title="Resolve Ticket"
            >
                <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide">Confirm Resolution</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-200 mt-1">
                                Are you sure you want to resolve ticket <strong className="text-slate-900 dark:text-white">{selectedTicket?.id}</strong>? 
                                This will close the conversation and notify the user.
                            </p>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button onClick={() => setIsResolveModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">Cancel</button>
                        <button onClick={confirmResolveTicket} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Mark Resolved
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Archive Confirmation Modal */}
            <Modal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                title="Archive Ticket"
            >
                <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                        <Archive className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wide">Confirm Archive</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                                Archive ticket <strong className="text-slate-900 dark:text-white">{selectedTicket?.id}</strong>? 
                                It will be moved to the Archived tab and hidden from the main inbox.
                            </p>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button onClick={() => setIsArchiveModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">Cancel</button>
                        <button onClick={confirmArchiveTicket} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2">
                            <Archive size={16} /> Archive Ticket
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Report User Modal */}
            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Report User"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <Shield className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">Report User</h4>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                Reporting <strong className="text-slate-900 dark:text-white">{selectedTicket?.userName}</strong> will flag their account for review by the Trust & Safety team.
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Reason for Report</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500">
                            <option>Abusive Language</option>
                            <option>Spam / Solicitation</option>
                            <option>Fake Account</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">Cancel</button>
                        <button onClick={confirmReportUser} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
                            <Shield size={16} /> Report User
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Ticket Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Ticket"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">Permanent Deletion</h4>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                Are you sure you want to permanently delete ticket <strong className="text-slate-900 dark:text-white">{selectedTicket?.id}</strong>? 
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">Cancel</button>
                        <button onClick={confirmDeleteTicket} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
                            <Trash2 size={16} /> Delete Ticket
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};