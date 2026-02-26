import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './ui/Card';
import { 
    Search, Filter, Download, Activity, AlertCircle, CheckCircle2, 
    Info, Calendar, User, Shield, AlertTriangle, FileText, 
    ChevronLeft, ChevronRight, RefreshCw, X, Clock, Terminal
} from 'lucide-react';

// --- Types ---

type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'CRITICAL';
type UserRole = 'Super Admin' | 'Admin' | 'Finance Admin' | 'Customer Support' | 'Subscriber';

interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    module: string;
    action: string;
    message: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    ipAddress: string;
    userAgent?: string;
}

// --- Mock Data Generation ---

const ROLES: UserRole[] = ['Super Admin', 'Admin', 'Finance Admin', 'Customer Support', 'Subscriber'];
const MODULES = ['Auth', 'Billing', 'Stations', 'Users', 'Vehicles', 'Support', 'System', 'AI'];
const ACTIONS = ['Login', 'Logout', 'Create', 'Update', 'Delete', 'Payment', 'Sync', 'Alert', 'Export'];

const MOCK_USERS_BY_ROLE: Record<UserRole, { name: string, id: string }[]> = {
    'Super Admin': [{ name: 'Mark Johnson', id: 'USR-001' }],
    'Admin': [{ name: 'Sarah Connor', id: 'USR-002' }, { name: 'John Wick', id: 'USR-003' }],
    'Finance Admin': [{ name: 'Mike Ross', id: 'USR-004' }],
    'Customer Support': [{ name: 'Emily Blunt', id: 'USR-005' }, { name: 'Ryan Reynolds', id: 'USR-006' }],
    'Subscriber': [
        { name: 'Alice Wonderland', id: 'SUB-101' }, 
        { name: 'Bob Builder', id: 'SUB-102' },
        { name: 'Charlie Brown', id: 'SUB-103' },
        { name: 'Diana Prince', id: 'SUB-104' }
    ]
};

const generateMockLogs = (count: number): LogEntry[] => {
    const logs: LogEntry[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const role = ROLES[Math.floor(Math.random() * ROLES.length)];
        const users = MOCK_USERS_BY_ROLE[role];
        const user = users[Math.floor(Math.random() * users.length)];
        const module = MODULES[Math.floor(Math.random() * MODULES.length)];
        
        // Determine level based on randomness but weighted
        const rand = Math.random();
        let level: LogLevel = 'INFO';
        if (rand > 0.95) level = 'CRITICAL';
        else if (rand > 0.9) level = 'ERROR';
        else if (rand > 0.8) level = 'WARNING';
        else if (rand > 0.6) level = 'SUCCESS';

        // Generate message based on module and level
        let message = '';
        let action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

        if (module === 'Auth') {
            if (level === 'ERROR') { message = 'Failed login attempt detected'; action = 'Login'; }
            else if (level === 'SUCCESS') { message = 'User logged in successfully'; action = 'Login'; }
            else { message = 'Session refreshed'; action = 'Session'; }
        } else if (module === 'Billing') {
            if (level === 'CRITICAL') { message = 'Payment gateway connection lost'; action = 'System'; }
            else if (level === 'SUCCESS') { message = 'Subscription payment processed'; action = 'Payment'; }
            else { message = 'Invoice generated'; action = 'Create'; }
        } else if (module === 'Stations') {
            if (level === 'WARNING') { message = 'High temperature alert at Station ST-004'; action = 'Alert'; }
            else if (level === 'ERROR') { message = 'Station offline: ST-002'; action = 'Alert'; }
            else { message = 'Station status updated'; action = 'Update'; }
        } else {
            message = `${action} operation performed on ${module}`;
        }

        const date = new Date(now.getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)); // Last 7 days

        logs.push({
            id: `LOG-${10000 + i}`,
            timestamp: date.toISOString(),
            level,
            module,
            action,
            message,
            userId: user.id,
            userName: user.name,
            userRole: role,
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        });
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const MOCK_LOGS = generateMockLogs(250);

// --- Components ---

const LogLevelBadge: React.FC<{ level: LogLevel }> = ({ level }) => {
    const styles = {
        'INFO': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        'WARNING': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        'ERROR': 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
        'CRITICAL': 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 animate-pulse',
        'SUCCESS': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
    };

    const icons = {
        'INFO': <Info size={12} />,
        'WARNING': <AlertTriangle size={12} />,
        'ERROR': <AlertCircle size={12} />,
        'CRITICAL': <Activity size={12} />,
        'SUCCESS': <CheckCircle2 size={12} />
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[level]}`}>
            {icons[level]}
            {level}
        </span>
    );
};

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const styles = {
        'Super Admin': 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
        'Admin': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
        'Finance Admin': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
        'Customer Support': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
        'Subscriber': 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${styles[role]}`}>
            {role}
        </span>
    );
};

export const Logs: React.FC = () => {
    // State
    const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('ALL');
    const [filterRole, setFilterRole] = useState<string>('ALL');
    const [filterModule, setFilterModule] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [isExporting, setIsExporting] = useState(false);
    const filterRef = React.useRef<HTMLDivElement>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Derived State
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = 
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress.includes(searchTerm);
            
            const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
            const matchesRole = filterRole === 'ALL' || log.userRole === filterRole;
            const matchesModule = filterModule === 'ALL' || log.module === filterModule;

            return matchesSearch && matchesLevel && matchesRole && matchesModule;
        });
    }, [logs, searchTerm, filterLevel, filterRole, filterModule]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Stats
    const stats = useMemo(() => {
        return {
            total: logs.length,
            errors: logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length,
            warnings: logs.filter(l => l.level === 'WARNING').length,
            today: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length
        };
    }, [logs]);

    // Handlers
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            const headers = ['ID', 'Timestamp', 'Level', 'Module', 'Action', 'Message', 'User', 'Role', 'IP'];
            const rows = filteredLogs.map(log => [
                log.id,
                log.timestamp,
                log.level,
                log.module,
                log.action,
                `"${log.message}"`,
                log.userName,
                log.userRole,
                log.ipAddress
            ]);
            
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `system_logs_${new Date().toISOString()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsExporting(false);
        }, 1000);
    };

    const handleRefresh = () => {
        // Simulate refresh
        const newLog: LogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'INFO',
            module: 'System',
            action: 'Refresh',
            message: 'Manual log refresh triggered',
            userId: 'USR-001',
            userName: 'Mark Johnson',
            userRole: 'Super Admin',
            ipAddress: '127.0.0.1'
        };
        setLogs(prev => [newLog, ...prev]);
    };

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterLevel, filterRole, filterModule]);

    // Close Dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        System Audit Logs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Comprehensive audit trail of all system activities, user actions, and security events.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg"
                        title="Refresh Logs"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Total Events</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Errors & Critical</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.errors.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Warnings</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.warnings.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Events Today</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.today.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="p-0 overflow-hidden border border-slate-200 dark:border-white/5 shadow-xl">
                {/* Filters Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search logs by message, user, or IP..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0b1121] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-sm"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Filter Dropdown */}
                        <div className="relative" ref={filterRef}>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
                                    isFilterOpen || filterLevel !== 'ALL' || filterRole !== 'ALL' || filterModule !== 'ALL'
                                    ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-primary dark:text-blue-400'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                            >
                                <Filter size={16} /> Filters
                                {(filterLevel !== 'ALL' || filterRole !== 'ALL' || filterModule !== 'ALL') && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                        {/* Level Filter */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Log Level</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'SUCCESS'].map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setFilterLevel(level)}
                                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                                            filterLevel === level 
                                                            ? 'bg-primary dark:bg-blue-600 text-white border-primary dark:border-blue-500' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {level === 'ALL' ? 'All Levels' : level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Role Filter */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">User Role</label>
                                            <select 
                                                value={filterRole}
                                                onChange={(e) => setFilterRole(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                            >
                                                <option value="ALL">All Roles</option>
                                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                            </select>
                                        </div>

                                        {/* Module Filter */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Module</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setFilterModule('ALL')}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors col-span-2 ${
                                                        filterModule === 'ALL' 
                                                        ? 'bg-primary dark:bg-blue-600 text-white border-primary dark:border-blue-500' 
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    All Modules
                                                </button>
                                                {MODULES.map(mod => (
                                                    <button
                                                        key={mod}
                                                        onClick={() => setFilterModule(mod)}
                                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors truncate ${
                                                            filterModule === mod 
                                                            ? 'bg-primary dark:bg-blue-600 text-white border-primary dark:border-blue-500' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                        title={mod}
                                                    >
                                                        {mod}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                                            <button 
                                                onClick={() => {
                                                    setFilterLevel('ALL');
                                                    setFilterRole('ALL');
                                                    setFilterModule('ALL');
                                                    setSearchTerm('');
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

                {/* Table */}
                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                <th className="p-4 w-[180px]">Timestamp</th>
                                <th className="p-4 w-[100px]">Level</th>
                                <th className="p-4 w-[120px]">Module</th>
                                <th className="p-4">Message</th>
                                <th className="p-4 w-[200px]">User</th>
                                <th className="p-4 w-[140px] text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {currentLogs.length > 0 ? (
                                currentLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 font-mono">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <LogLevelBadge level={log.level} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{log.module}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                {log.message}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-mono mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">
                                                ID: {log.id}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-white/10">
                                                    {log.userName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{log.userName}</span>
                                                    <RoleBadge role={log.userRole} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/5">
                                                {log.ipAddress}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-100 dark:bg-white/5">
                                                <Search size={24} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">No logs found</p>
                                            <p className="text-sm opacity-70">Try adjusting your search or filters</p>
                                            <button 
                                                onClick={() => {
                                                    setFilterLevel('ALL');
                                                    setFilterRole('ALL');
                                                    setFilterModule('ALL');
                                                    setSearchTerm('');
                                                }}
                                                className="mt-2 text-primary dark:text-blue-400 hover:underline text-sm"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredLogs.length}</span> entries
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple pagination logic for display
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                }
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            currentPage === pageNum
                                            ? 'bg-primary dark:bg-blue-600 text-white shadow-md'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
