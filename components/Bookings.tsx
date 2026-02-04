import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { MOCK_BOOKINGS, MOCK_USERS } from '../constants';
import { Booking } from '../types';
import gsap from 'gsap';
import { 
    Calendar, Filter, Download, Search, MoreHorizontal, 
    TrendingUp, CheckCircle2, XCircle, Clock, CreditCard,
    ChevronDown, FileText, RefreshCw, Eye, Mail, Ban, Check, Loader2, Zap, MapPin, X, CalendarDays, ChevronLeft, ChevronRight, Archive, RotateCcw, AlertTriangle, Crown, ArrowUpDown, Star, Activity
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// Mock data for the chart within this component (Converted to Peso ~56 rate)
const BOOKING_TRENDS = [
    { day: 'Mon', bookings: 24, revenue: 25200 },
    { day: 'Tue', bookings: 35, revenue: 34720 },
    { day: 'Wed', bookings: 28, revenue: 28560 },
    { day: 'Thu', bookings: 42, revenue: 49840 },
    { day: 'Fri', bookings: 55, revenue: 67200 },
    { day: 'Sat', bookings: 68, revenue: 84000 },
    { day: 'Sun', bookings: 50, revenue: 61600 },
];

const ITEMS_PER_PAGE = 10;
const PHP_RATE = 56; // Conversion rate from mock USD to PHP

// Extend Booking type locally to handle archive state
interface ExtendedBooking extends Booking {
    isArchived?: boolean;
}

// Interface for Station Reports
interface StationPerformance {
    id: string;
    rank: number;
    name: string;
    location: string;
    totalBookings: number;
    revenue: number;
    uptime: number;
    rating: number;
    energyDispensed: number; // kWh
}

// Mock Data for Reports
const MOCK_STATION_REPORTS: StationPerformance[] = [
    { id: '1', rank: 1, name: 'Ayala Triangle Gardens', location: 'Makati', totalBookings: 1245, revenue: 348600, uptime: 99.9, rating: 4.9, energyDispensed: 45200 },
    { id: '2', rank: 2, name: 'BGC High Street', location: 'Taguig', totalBookings: 982, revenue: 275400, uptime: 98.5, rating: 4.7, energyDispensed: 38100 },
    { id: '3', rank: 3, name: 'Intramuros Tech Hub', location: 'Manila', totalBookings: 856, revenue: 214000, uptime: 99.2, rating: 4.8, energyDispensed: 31500 },
    { id: '4', rank: 4, name: 'SM Mall of Asia', location: 'Pasay', totalBookings: 720, revenue: 151200, uptime: 96.5, rating: 4.2, energyDispensed: 28900 },
    { id: '5', rank: 5, name: 'SLEX Shell Mamplasan', location: 'Biñan', totalBookings: 645, revenue: 142000, uptime: 94.0, rating: 4.1, energyDispensed: 42000 }, // High energy, low bookings (trucks?)
    { id: '6', rank: 6, name: 'Quezon City Circle', location: 'Quezon City', totalBookings: 512, revenue: 98000, uptime: 88.5, rating: 3.8, energyDispensed: 18500 },
    { id: '7', rank: 7, name: 'Alabang Town Center', location: 'Muntinlupa', totalBookings: 430, revenue: 86500, uptime: 92.1, rating: 4.4, energyDispensed: 15200 },
    { id: '8', rank: 8, name: 'Greenbelt 3', location: 'Makati', totalBookings: 410, revenue: 82000, uptime: 95.5, rating: 4.6, energyDispensed: 14000 },
    { id: '9', rank: 9, name: 'UP Town Center', location: 'Quezon City', totalBookings: 390, revenue: 78000, uptime: 91.2, rating: 4.3, energyDispensed: 13500 },
    { id: '10', rank: 10, name: 'Nuvali Solenad', location: 'Santa Rosa', totalBookings: 350, revenue: 70000, uptime: 98.0, rating: 4.8, energyDispensed: 22000 },
];

const StatCard: React.FC<{
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ReactNode;
    color: string;
}> = ({ label, value, trend, trendUp, icon, color }) => (
    <div className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-800/50 border border-white/5 ${color}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-800/50 border border-white/5 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trendUp ? '+' : ''}{trend}
                    <TrendingUp size={12} className={trendUp ? '' : 'rotate-180'} />
                </div>
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </div>
    </div>
);

// --- Internal Components for Actions ---

// 1. Toast Notification Component
const Toast: React.FC<{ message: string; type: 'success' | 'loading'; onClose?: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        if (type === 'success') {
            const timer = setTimeout(() => onClose && onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [type, onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${
                type === 'loading' 
                ? 'bg-blue-600/10 border-blue-500/20 text-blue-200' 
                : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-200'
            }`}>
                {type === 'loading' ? (
                    <Loader2 size={18} className="animate-spin text-blue-400" />
                ) : (
                    <div className="bg-emerald-500/20 p-1 rounded-full">
                        <Check size={14} className="text-emerald-400" />
                    </div>
                )}
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

export const Bookings: React.FC = () => {
    const containerRef = useRef(null);
    const tableRef = useRef(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const dateRangeRef = useRef<HTMLDivElement>(null);

    // Initialize state with extended booking data (isArchived defaults to false)
    const [allBookings, setAllBookings] = useState<ExtendedBooking[]>(() => 
        MOCK_BOOKINGS.map(b => ({ ...b, isArchived: false }))
    );

    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Date & Time Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    
    // Initialize dateFilter with today's date for Start and End (Default: Today)
    const [dateRangeLabel, setDateRangeLabel] = useState('Today');
    const [dateFilter, setDateFilter] = useState(() => {
        const today = new Date();
        const str = today.toISOString().split('T')[0];
        return { start: str, end: str };
    });
    const [timeFilter, setTimeFilter] = useState({ start: '', end: '' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    
    // Action States
    const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null); // For Modal
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null); // For More Actions
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 }); // Fixed position for detached dropdown
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'loading' } | null>(null);

    // Archive Confirmation State
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [bookingToArchive, setBookingToArchive] = useState<ExtendedBooking | null>(null);

    // Reports Modal State
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [reportSortConfig, setReportSortConfig] = useState<{ key: keyof StationPerformance; direction: 'asc' | 'desc' }>({ key: 'revenue', direction: 'desc' });
    const reportsTableRef = useRef<HTMLTableSectionElement>(null);

    // --- Statistics Calculation Logic ---

    // Helper: Calculate previous period range based on current selection
    const getPreviousDateRange = (startStr: string, endStr: string) => {
        if (!startStr || !endStr) return { start: '', end: '' }; // All time, no comparison

        const start = new Date(startStr);
        const end = new Date(endStr);
        
        // Calculate difference in days
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - diffDays + 1);

        return {
            start: prevStart.toISOString().split('T')[0],
            end: prevEnd.toISOString().split('T')[0]
        };
    };

    const calculateMetrics = (bookings: ExtendedBooking[], startDate: string, endDate: string) => {
        const filtered = bookings.filter(b => {
            if (b.isArchived) return false;
            // Date Filter
            if (startDate && b.date < startDate) return false;
            if (endDate && b.date > endDate) return false;
            return true;
        });

        const totalBookings = filtered.length;
        const completedBookings = filtered.filter(b => b.status === 'Completed');
        const completedCount = completedBookings.length;
        
        // Revenue (Sum of amount for Completed)
        const revenue = completedBookings.reduce((sum, b) => sum + (b.amount * PHP_RATE), 0);
        
        // Avg Ticket Size
        const avgTicket = completedCount > 0 ? revenue / completedCount : 0;
        
        // Completion Rate
        const completionRate = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0;

        return { revenue, totalBookings, avgTicket, completionRate };
    };

    // Current Metrics
    const currentMetrics = useMemo(() => 
        calculateMetrics(allBookings, dateFilter.start, dateFilter.end), 
    [allBookings, dateFilter]);

    // Previous Period Metrics (for trend)
    const previousMetrics = useMemo(() => {
        const { start, end } = getPreviousDateRange(dateFilter.start, dateFilter.end);
        // If no comparison range (e.g. All Time), return null or 0s
        if (!start) return { revenue: 0, totalBookings: 0, avgTicket: 0, completionRate: 0 };
        return calculateMetrics(allBookings, start, end);
    }, [allBookings, dateFilter]);

    // Calculate Trends
    const trends = useMemo(() => {
        const calcTrend = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        return {
            revenue: calcTrend(currentMetrics.revenue, previousMetrics.revenue),
            bookings: calcTrend(currentMetrics.totalBookings, previousMetrics.totalBookings),
            ticket: calcTrend(currentMetrics.avgTicket, previousMetrics.avgTicket),
            completion: currentMetrics.completionRate - previousMetrics.completionRate // Percentage point difference
        };
    }, [currentMetrics, previousMetrics]);

    // Formatters
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
    const formatPercent = (val: number) => `${Math.abs(val).toFixed(1)}%`;

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchQuery, dateFilter, timeFilter]);

    // Close dropdown on scroll or resize to prevent floating issues
    useEffect(() => {
        const handleScroll = () => {
            if (activeDropdownId) setActiveDropdownId(null);
        };
        // Capture phase true to detect scroll in table containers
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [activeDropdownId]);

    // Filter logic
    const filteredBookings = allBookings.filter(booking => {
        // 0. Archive Logic
        if (filterStatus === 'Archived') {
            if (!booking.isArchived) return false;
        } else {
            // For all other tabs, hide archived items
            if (booking.isArchived) return false;
        }

        // 1. Status Filter
        const matchesStatus = 
            filterStatus === 'All' || 
            filterStatus === 'Archived' || // Status check ignored in Archived tab
            booking.status === filterStatus;
        
        // 2. Search Query Filter
        const matchesSearch = 
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.userId.toLowerCase().includes(searchQuery.toLowerCase());

        // 3. Date Range Filter
        let matchesDate = true;
        if (dateFilter.start && booking.date < dateFilter.start) matchesDate = false;
        if (dateFilter.end && booking.date > dateFilter.end) matchesDate = false;

        // 4. Time Range Filter
        let matchesTime = true;
        if (timeFilter.start && booking.time < timeFilter.start) matchesTime = false;
        if (timeFilter.end && booking.time > timeFilter.end) matchesTime = false;

        return matchesStatus && matchesSearch && matchesDate && matchesTime;
    });

    const activeFilterCount = (dateFilter.start ? 1 : 0) + (dateFilter.end ? 1 : 0) + (timeFilter.start ? 1 : 0) + (timeFilter.end ? 1 : 0);

    // Pagination Logic
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reports Sorting Logic
    const sortedReports = useMemo(() => {
        let sortableItems = [...MOCK_STATION_REPORTS];
        if (reportSortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[reportSortConfig.key] < b[reportSortConfig.key]) {
                    return reportSortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[reportSortConfig.key] > b[reportSortConfig.key]) {
                    return reportSortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [reportSortConfig]);

    const requestSort = (key: keyof StationPerformance) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (reportSortConfig.key === key && reportSortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setReportSortConfig({ key, direction });
    };

    // Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".stagger-item", 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
            );
            
            gsap.fromTo(tableRef.current, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Animation for Reports Modal
    useEffect(() => {
        if (isReportsModalOpen && reportsTableRef.current) {
             gsap.fromTo(reportsTableRef.current.children, 
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, delay: 0.2, ease: "power2.out" }
            );
        }
    }, [isReportsModalOpen]);

    // Handle Click Outside for Dropdown & Filter
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Dropdown handle logic moved to detached element
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // We check if the click was on a trigger button to avoid immediate re-opening/closing conflict handled by toggleDropdown
                const target = event.target as HTMLElement;
                if (!target.closest('[data-dropdown-trigger]')) {
                     setActiveDropdownId(null);
                }
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
            if (dateRangeRef.current && !dateRangeRef.current.contains(event.target as Node)) {
                setIsDateRangeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Action Handlers ---

    const handleViewDetails = (booking: ExtendedBooking) => {
        setSelectedBooking(booking);
        setActiveDropdownId(null);
    };

    const handleDownloadInvoice = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setToast({ message: `Generating Invoice #${id}...`, type: 'loading' });
        
        // Simulate API call
        setTimeout(() => {
            setToast({ message: `Invoice #${id} downloaded successfully.`, type: 'success' });
        }, 1500);
        
        setActiveDropdownId(null);
    };

    // Trigger archive confirmation modal
    const handleArchiveBooking = (id: string) => {
        const booking = allBookings.find(b => b.id === id);
        if (booking) {
            setBookingToArchive(booking);
            setIsArchiveModalOpen(true);
            setActiveDropdownId(null);
        }
    };

    // Actual archive logic
    const confirmArchive = () => {
        if (bookingToArchive) {
            setAllBookings(prev => prev.map(b => b.id === bookingToArchive.id ? { ...b, isArchived: true } : b));
            setToast({ message: `Booking #${bookingToArchive.id} archived successfully.`, type: 'success' });
            setIsArchiveModalOpen(false);
            setBookingToArchive(null);
        }
    };

    const handleRestoreBooking = (id: string) => {
        setAllBookings(prev => prev.map(b => b.id === id ? { ...b, isArchived: false } : b));
        setToast({ message: `Booking #${id} restored.`, type: 'success' });
        setActiveDropdownId(null);
    };

    const toggleDropdown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (activeDropdownId === id) {
            setActiveDropdownId(null);
        } else {
            // Calculate position for fixed dropdown
            const rect = e.currentTarget.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 2, // 2px gap (reduced from 6)
                // Use clientWidth instead of innerWidth to properly account for scrollbars in right alignment
                right: document.documentElement.clientWidth - rect.right 
            });
            setActiveDropdownId(id);
        }
    };

    const handleStatusUpdate = (id: string, newStatus: string) => {
        setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
        setToast({ message: `Booking #${id} marked as ${newStatus}`, type: 'success' });
        setActiveDropdownId(null);
    };

    const clearFilters = () => {
        setDateFilter({ start: '', end: '' });
        setTimeFilter({ start: '', end: '' });
        setFilterStatus('All');
        setSearchQuery('');
        setDateRangeLabel('All Time');
        setIsFilterOpen(false);
        setToast({ message: 'All filters cleared', type: 'success' });
    };

    // --- Date Range Helper Logic ---
    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateRangeSelect = (range: 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Month' | 'All Time') => {
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

        setDateFilter({ start, end });
        setDateRangeLabel(range);
        setIsDateRangeOpen(false);
    };

    // --- Export CSV Logic ---
    const handleExportCSV = () => {
        setToast({ message: 'Preparing CSV download...', type: 'loading' });

        setTimeout(() => {
            if (filteredBookings.length === 0) {
                setToast({ message: 'No data to export', type: 'success' }); // Should theoretically be error/warning but using success style for consistency
                return;
            }

            // Define headers
            const headers = ['Booking ID', 'User ID', 'Station Name', 'Date', 'Time', 'Status', 'Amount (PHP)', 'Archived'];
            
            // Map data to CSV rows
            const rows = filteredBookings.map(b => [
                b.id,
                b.userId,
                `"${b.stationName}"`, // Wrap in quotes to handle potential commas
                b.date,
                b.time,
                b.status,
                (b.amount * PHP_RATE).toFixed(2),
                b.isArchived ? 'Yes' : 'No'
            ]);

            // Combine headers and rows
            const csvContent = [
                headers.join(','), 
                ...rows.map(row => row.join(','))
            ].join('\n');

            // Create blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('href', url);
            link.setAttribute('download', `bookings_export_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setToast({ message: 'Export downloaded successfully', type: 'success' });
        }, 1000);
    };

    const handleExportReports = () => {
        setToast({ message: 'Generating Performance Report...', type: 'loading' });
        setTimeout(() => {
            setToast({ message: 'Report downloaded successfully', type: 'success' });
        }, 1500);
    }

    // --- Helpers ---

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Active': return 'bg-blue-600/10 text-blue-400 border-blue-500/20 animate-pulse-slow';
            case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={14} />;
            case 'Active': return <RefreshCw size={14} className="animate-spin-slow" />;
            case 'Pending': return <Clock size={14} />;
            case 'Cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    // Find user helper
    const getUserForBooking = (userId: string) => MOCK_USERS.find(u => u.id === userId);

    return (
        <div ref={containerRef} className="space-y-6 pb-10 relative">
            {/* Toast Container */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Booking Management</h2>
                    <p className="text-slate-400 text-sm">Monitor revenue, transactions, and session history.</p>
                </div>
                <div className="flex gap-3">
                    {/* Date Range Dropdown */}
                    <div className="relative" ref={dateRangeRef}>
                        <button 
                            onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                            className="flex items-center gap-2 bg-slate-800/80 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700 hover:text-white hover:border-slate-500 transition-colors w-40 justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={16} /> 
                                <span>{dateRangeLabel}</span>
                            </div>
                            <ChevronDown size={14} className={`opacity-50 transition-transform ${isDateRangeOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDateRangeOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="py-1">
                                    {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleDateRangeSelect(option as any)}
                                            className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${dateRangeLabel === option ? 'text-blue-400 bg-blue-600/10' : 'text-slate-300'}`}
                                        >
                                            {option}
                                            {dateRangeLabel === option && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="stagger-item">
                    <StatCard 
                        label="Total Revenue" 
                        value={formatCurrency(currentMetrics.revenue)} 
                        trend={formatPercent(trends.revenue)} 
                        trendUp={trends.revenue >= 0} 
                        icon={<CreditCard size={20} className="text-emerald-400" />}
                        color="text-emerald-400"
                    />
                </div>
                <div className="stagger-item">
                    <StatCard 
                        label="Total Bookings" 
                        value={currentMetrics.totalBookings.toString()} 
                        trend={formatPercent(trends.bookings)} 
                        trendUp={trends.bookings >= 0} 
                        icon={<Calendar size={20} className="text-blue-400" />}
                        color="text-blue-400"
                    />
                </div>
                <div className="stagger-item">
                    <StatCard 
                        label="Avg. Ticket Size" 
                        value={formatCurrency(currentMetrics.avgTicket)} 
                        trend={formatPercent(trends.ticket)} 
                        trendUp={trends.ticket >= 0} 
                        icon={<TrendingUp size={20} className="text-amber-400" />}
                        color="text-amber-400"
                    />
                </div>
                <div className="stagger-item">
                    <StatCard 
                        label="Completion Rate" 
                        value={`${currentMetrics.completionRate.toFixed(1)}%`} 
                        trend={formatPercent(trends.completion)} 
                        trendUp={trends.completion >= 0} 
                        icon={<CheckCircle2 size={20} className="text-purple-400" />}
                        color="text-purple-400"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Table Section */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Filters Toolbar - Added z-30 here */}
                    <div className="stagger-item bg-slate-900/50 backdrop-blur-md p-2 rounded-xl border border-white/5 flex flex-col md:flex-row gap-3 relative z-30">
                        <div className="flex bg-slate-950/50 rounded-lg p-1 border border-white/5 overflow-x-auto custom-scrollbar">
                            {['All', 'Active', 'Completed', 'Cancelled', 'Archived'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                        filterStatus === status 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {status === 'Archived' && <Archive size={12} />}
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search by ID, User, or Station..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                            />
                        </div>
                        
                        {/* Filter Button with Popover */}
                        <div className="relative" ref={filterRef}>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`h-full px-3 py-2 rounded-lg border flex items-center gap-2 transition-colors relative ${
                                    activeFilterCount > 0 
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30' 
                                    : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-white'
                                }`}
                                title="Advanced Filters"
                            >
                                <Filter size={16} />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-slate-900"></span>
                                )}
                            </button>

                            {/* Filter Popover */}
                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Filter size={14} className="text-blue-500" /> Filter Bookings
                                        </h4>
                                        <button onClick={() => setIsFilterOpen(false)} className="text-slate-500 hover:text-white">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Date Range */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                                <CalendarDays size={12} /> Date Range
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-slate-500 uppercase">From</span>
                                                    <input 
                                                        type="date" 
                                                        value={dateFilter.start}
                                                        onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-slate-500 uppercase">To</span>
                                                    <input 
                                                        type="date" 
                                                        value={dateFilter.end}
                                                        onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time Range */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                                <Clock size={12} /> Time Range
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                 <div className="space-y-1">
                                                    <span className="text-[10px] text-slate-500 uppercase">Start</span>
                                                    <input 
                                                        type="time" 
                                                        value={timeFilter.start}
                                                        onChange={(e) => setTimeFilter({...timeFilter, start: e.target.value})}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-slate-500 uppercase">End</span>
                                                    <input 
                                                        type="time" 
                                                        value={timeFilter.end}
                                                        onChange={(e) => setTimeFilter({...timeFilter, end: e.target.value})}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-3 mt-2 border-t border-white/10 flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setDateFilter({start: '', end: ''});
                                                    setTimeFilter({start: '', end: ''});
                                                }}
                                                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                Reset
                                            </button>
                                            <button 
                                                onClick={() => setIsFilterOpen(false)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table - Added z-20 here */}
                    <div ref={tableRef} className="glass-card rounded-2xl overflow-visible border border-white/5 min-h-[400px] relative z-20">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="text-xs uppercase bg-slate-900/80 text-slate-300 border-b border-white/5 backdrop-blur-sm sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Booking Info</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Date & Duration</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Total</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 relative">
                                    {currentBookings.length > 0 ? (
                                        currentBookings.map((booking) => {
                                            const mockUser = getUserForBooking(booking.userId);
                                            const avatarUrl = `https://i.pravatar.cc/150?u=${booking.userId}`;
                                            const isDropdownOpen = activeDropdownId === booking.id;
                                            
                                            return (
                                                <tr key={booking.id} className="hover:bg-white/5 transition-colors group relative">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-mono font-medium group-hover:text-blue-400 transition-colors">#{booking.id}</span>
                                                            <span className="text-xs text-slate-500 truncate max-w-[140px]">{booking.stationName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={avatarUrl} 
                                                                alt="User" 
                                                                className="w-8 h-8 rounded-full border border-white/10"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-200 text-xs font-bold">{mockUser ? mockUser.name : 'Guest User'}</span>
                                                                <span className="text-[10px] text-slate-500">{mockUser ? mockUser.email : 'No email'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                                <Calendar size={12} className="text-slate-500" />
                                                                <span>{booking.date}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                                <Clock size={12} />
                                                                <span>{booking.time} • 45m</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(booking.status)}`}>
                                                            {getStatusIcon(booking.status)}
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-white font-bold font-mono">₱{(booking.amount * PHP_RATE).toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center relative">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button 
                                                                onClick={() => handleViewDetails(booking)}
                                                                title="View Details" 
                                                                className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <div className="relative">
                                                                <button 
                                                                    data-dropdown-trigger
                                                                    onClick={(e) => toggleDropdown(e, booking.id)}
                                                                    className={`p-1.5 rounded-lg transition-colors ${isDropdownOpen ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                                                                >
                                                                    <MoreHorizontal size={16} />
                                                                </button>
                                                                
                                                                {/* Detached Dropdown Logic: No longer nested here to avoid overflow/z-index issues */}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Search size={32} className="opacity-20" />
                                                    <p>No bookings found matching your filters.</p>
                                                    <button onClick={clearFilters} className="text-blue-500 hover:underline text-xs">Clear Filters</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Footer */}
                        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/30">
                            <span className="text-xs text-slate-500">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length} results
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-white/5 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                currentPage === page
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-white/5 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Charts Section */}
                <div className="space-y-6">
                    {/* Booking Volume Chart */}
                    <div className="stagger-item glass-card p-5 rounded-2xl border border-white/5">
                        <div className="mb-4">
                            <h3 className="font-bold text-white">Booking Volume</h3>
                            <p className="text-xs text-slate-400">Daily transaction volume (Last 7 Days)</p>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BOOKING_TRENDS}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar 
                                        dataKey="bookings" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={40}
                                        label={{ 
                                            position: 'insideTop', 
                                            fill: '#ffffff', 
                                            fontSize: 11, 
                                            fontWeight: 'bold',
                                            dy: 10
                                        }}
                                    >
                                        {BOOKING_TRENDS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : '#1e293b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Peak: Saturday
                        </div>
                    </div>

                    {/* Top Stations Mini List - Updated with Scrollbar and Dynamic Data */}
                    <div className="stagger-item glass-card p-0 rounded-2xl border border-white/5 overflow-hidden flex flex-col max-h-[350px]">
                        <div className="p-4 border-b border-white/5 bg-slate-900/50 shrink-0">
                            <h3 className="font-bold text-white text-sm">Top Performing Stations</h3>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            <div className="divide-y divide-white/5">
                                {[...MOCK_STATION_REPORTS]
                                    .sort((a, b) => b.revenue - a.revenue)
                                    .map((station, i) => (
                                    <div key={station.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0 ${
                                                i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-700'
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white truncate max-w-[120px]">{station.name}</p>
                                                <p className="text-[10px] text-slate-500">{station.totalBookings} bookings</p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono font-bold text-emerald-400">
                                            ₱{(station.revenue / 1000).toFixed(1)}k
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-2 text-center border-t border-white/5 bg-slate-900/30 shrink-0">
                            <button 
                                onClick={() => setIsReportsModalOpen(true)}
                                className="text-[10px] text-blue-400 hover:text-white transition-colors uppercase font-bold tracking-wider"
                            >
                                View Detailed Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detached Dropdown Menu (Fixed Positioning) */}
            {activeDropdownId && (() => {
                const booking = allBookings.find(b => b.id === activeDropdownId);
                if (!booking) return null;
                const mockUser = getUserForBooking(booking.userId);
                
                return (
                    <div 
                        ref={dropdownRef}
                        className="fixed bg-[#0f172a] border border-white/10 rounded-xl shadow-xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right w-48"
                        style={{ 
                            top: `${dropdownPos.top}px`, 
                            right: `${dropdownPos.right}px` 
                        }}
                    >
                        <div className="py-1">
                             <button 
                                onClick={(e) => handleDownloadInvoice(e, booking.id)}
                                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                            >
                                <Download size={14} /> Download Invoice
                            </button>
                            
                            <button 
                                onClick={() => {
                                    window.location.href = `mailto:${mockUser?.email}`;
                                    setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                            >
                                <Mail size={14} /> Email User
                            </button>

                             {booking.status === 'Pending' && !booking.isArchived && (
                                <button 
                                    onClick={() => handleStatusUpdate(booking.id, 'Active')}
                                    className="w-full text-left px-4 py-2.5 text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                                >
                                    <Check size={14} /> Approve Booking
                                </button>
                            )}
                             {booking.status !== 'Cancelled' && !booking.isArchived && (
                                <button 
                                    onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                                    className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                    <Ban size={14} /> Cancel Booking
                                </button>
                             )}

                            <div className="h-[1px] bg-white/5 my-1"></div>

                            {!booking.isArchived ? (
                                <button 
                                    onClick={() => handleArchiveBooking(booking.id)}
                                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                    <Archive size={14} /> Archive Booking
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleRestoreBooking(booking.id)}
                                    className="w-full text-left px-4 py-2.5 text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                                >
                                    <RotateCcw size={14} /> Restore Booking
                                </button>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Booking Details Modal */}
            <Modal 
                isOpen={!!selectedBooking} 
                onClose={() => setSelectedBooking(null)} 
                title="Booking Details"
            >
                {selectedBooking && (
                    <div className="space-y-6">
                        {/* Header Status */}
                        <div className="flex justify-between items-start bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div>
                                <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-1">Booking ID</h4>
                                <p className="text-xl font-mono text-white font-bold">#{selectedBooking.id}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(selectedBooking.status)}`}>
                                    {getStatusIcon(selectedBooking.status)}
                                    {selectedBooking.status}
                                </span>
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* User Section */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <RefreshCw size={12} /> Customer Info
                                </h4>
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={`https://i.pravatar.cc/150?u=${selectedBooking.userId}`} 
                                        alt="User" 
                                        className="w-12 h-12 rounded-full border border-white/10"
                                    />
                                    <div>
                                        {(() => {
                                            const user = getUserForBooking(selectedBooking.userId);
                                            // Handle subscription plan display
                                            let plan = user?.subscriptionPlan || 'Free';
                                            
                                            // Map legacy mock data 'SolarElite' to 'Elite' for consistency with requested list
                                            if ((plan as string) === 'SolarElite') plan = 'Elite';

                                            const getPlanColor = (p: string) => {
                                                switch (p) {
                                                    case 'Supreme': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                                                    case 'Elite': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                                                    case 'Premium': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                                                    case 'Deluxe': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                                                    case 'Standard': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                                                    case 'Basic': return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
                                                    default: return 'bg-white/5 text-slate-400 border-white/10';
                                                }
                                            };

                                            return (
                                                <>
                                                    <p className="text-sm font-bold text-white">{user?.name || 'Guest'}</p>
                                                    <p className="text-xs text-slate-500 mb-1.5">{user?.email || 'N/A'}</p>
                                                    <div className="flex gap-2">
                                                        <span className="inline-block text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300 border border-white/5">
                                                            {user?.role || 'User'}
                                                        </span>
                                                        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-medium ${getPlanColor(plan)}`}>
                                                            {plan}
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Station Section */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <MapPin size={12} /> Station Info
                                </h4>
                                <p className="text-sm font-bold text-white mb-1">{selectedBooking.stationName}</p>
                                <p className="text-xs text-slate-500 mb-3">ID: {selectedBooking.stationId}</p>
                                <div className="flex gap-2">
                                    <div className="bg-black/20 px-2 py-1 rounded border border-white/5 text-[10px] text-slate-300 flex items-center gap-1">
                                        <Zap size={10} className="text-yellow-400" /> DC Fast
                                    </div>
                                    <div className="bg-black/20 px-2 py-1 rounded border border-white/5 text-[10px] text-slate-300">
                                        Slot #4
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Session Details */}
                        <div className="border-t border-b border-white/5 py-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Session Breakdown</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-1">Date</p>
                                    <p className="text-sm font-medium text-white">{selectedBooking.date}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-1">Start Time</p>
                                    <p className="text-sm font-medium text-white">{selectedBooking.time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-1">Duration</p>
                                    <p className="text-sm font-medium text-white">45 mins</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-1">Energy Delivered</p>
                                    <p className="text-sm font-medium text-white">24.5 kWh</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-1">Rate / kWh</p>
                                    <p className="text-sm font-medium text-white">₱25.20</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-1">Vehicle</p>
                                    <p className="text-sm font-medium text-white">Tesla Model 3</p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Footer */}
                        <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-500/20 p-2 rounded-lg">
                                    <CreditCard size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-200">Total Paid</p>
                                    <p className="text-[10px] text-blue-300/60">Via Credit Card •••• 4242</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-white font-mono">₱{(selectedBooking.amount * PHP_RATE).toFixed(2)}</span>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={(e) => handleDownloadInvoice(e, selectedBooking.id)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/5 flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Download Invoice
                            </button>
                            <button 
                                onClick={() => {
                                    handleStatusUpdate(selectedBooking.id, 'Active');
                                    setSelectedBooking(null);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Manage Booking
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Station Reports Modal */}
            <Modal
                isOpen={isReportsModalOpen}
                onClose={() => setIsReportsModalOpen(false)}
                title="Station Performance Reports"
                className="max-w-4xl"
            >
                <div className="w-full">
                    <div className="flex justify-between items-center mb-4 bg-slate-800/30 p-3 rounded-xl border border-white/5">
                        <div className="flex gap-6 text-sm">
                            <div>
                                <p className="text-slate-400 text-xs mb-0.5">Total Revenue</p>
                                <p className="text-white font-bold font-mono">₱1,250,000</p>
                            </div>
                             <div>
                                <p className="text-slate-400 text-xs mb-0.5">Total Bookings</p>
                                <p className="text-white font-bold font-mono">5,389</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs mb-0.5">Avg. Uptime</p>
                                <p className="text-emerald-400 font-bold font-mono">96.8%</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleExportReports}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Download size={14} /> Export Report
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-xs uppercase bg-slate-900/50 text-slate-300 border-b border-white/5">
                                <tr>
                                    <th className="px-4 py-2 font-bold">Rank</th>
                                    <th className="px-4 py-2 font-bold">Station</th>
                                    <th 
                                        className="px-4 py-2 font-bold text-right cursor-pointer hover:text-white transition-colors"
                                        onClick={() => requestSort('revenue')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Revenue <ArrowUpDown size={10} />
                                        </div>
                                    </th>
                                    <th 
                                        className="px-4 py-2 font-bold text-center cursor-pointer hover:text-white transition-colors"
                                        onClick={() => requestSort('totalBookings')}
                                    >
                                         <div className="flex items-center justify-center gap-1">
                                            Bookings <ArrowUpDown size={10} />
                                        </div>
                                    </th>
                                     <th 
                                        className="px-4 py-2 font-bold text-center cursor-pointer hover:text-white transition-colors"
                                        onClick={() => requestSort('uptime')}
                                    >
                                         <div className="flex items-center justify-center gap-1">
                                            Uptime <ArrowUpDown size={10} />
                                        </div>
                                    </th>
                                    <th className="px-4 py-2 font-bold text-right">Rating</th>
                                </tr>
                            </thead>
                            <tbody ref={reportsTableRef} className="divide-y divide-white/5">
                                {sortedReports.map((station, index) => (
                                    <tr key={station.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-2">
                                            {index < 3 ? (
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                                                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 font-mono ml-2">#{index + 1}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-xs">{station.name}</span>
                                                <span className="text-[10px] text-slate-500">{station.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <span className="text-emerald-400 font-mono font-bold">₱{station.revenue.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className="bg-white/5 text-white px-2 py-0.5 rounded text-xs font-medium">{station.totalBookings}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${station.uptime > 98 ? 'bg-emerald-500' : station.uptime > 95 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                                                        style={{ width: `${station.uptime}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[10px] font-bold ${station.uptime > 98 ? 'text-emerald-400' : station.uptime > 95 ? 'text-blue-400' : 'text-amber-400'}`}>{station.uptime}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1 text-yellow-400 font-bold text-xs">
                                                {station.rating} <Star size={10} fill="currentColor" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            {/* Archive Confirmation Modal */}
            <Modal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                title="Archive Booking"
            >
                <div className="space-y-4">
                     <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">Confirm Archive</h4>
                            <p className="text-sm text-amber-200 mt-1">
                                Are you sure you want to archive booking <strong className="text-white">#{bookingToArchive?.id}</strong>? 
                                It will be moved to the Archived tab and hidden from the main list.
                            </p>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-4">
                        <button 
                            onClick={() => setIsArchiveModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmArchive} 
                            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
                        >
                            <Archive size={16} /> Archive
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
