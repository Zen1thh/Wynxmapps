import React, { useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { REVENUE_DATA, STATION_USAGE_DATA, MOCK_STATIONS, MOCK_USERS, SUBSCRIPTION_PLANS } from '../constants';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend
} from 'recharts';
import { Zap, Users, BatteryCharging, DollarSign, ArrowUpRight, Sun, MapPin, Wrench, AlertOctagon, Download, Crown } from 'lucide-react';
import gsap from 'gsap';

const StatCard: React.FC<{
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    colorClass: string;
    delay: number;
}> = ({ title, value, change, icon, colorClass, delay }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: delay, ease: "power2.out" }
        );
    }, [delay]);

    return (
        <div ref={cardRef} className="glass-card rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group">
            <div className="z-10">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                    <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold flex items-center">
                        {change} <ArrowUpRight size={10} className="ml-0.5" />
                    </span>
                </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${colorClass}`}>
                {icon}
            </div>
        </div>
    );
};

export const Dashboard: React.FC = () => {
    const headerRef = useRef(null);
    const chartsRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(headerRef.current, 
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
        );
        gsap.fromTo(chartsRef.current, 
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.6, delay: 0.4, ease: "back.out(1.2)" }
        );
    }, []);

    return (
        <div className="space-y-6">
            <div ref={headerRef} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wynxsmapp Admin Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back, Admin. Here is the latest solar charging data.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value="₱53,000" 
                    change="+55%" 
                    icon={<DollarSign size={20} />} 
                    colorClass="bg-blue-600"
                    delay={0.1}
                />
                <StatCard 
                    title="Active Users" 
                    value="2,300" 
                    change="+5%" 
                    icon={<Users size={20} />} 
                    colorClass="bg-indigo-500"
                    delay={0.2}
                />
                <StatCard 
                    title="Energy Delivered" 
                    value="3,052 kWh" 
                    change="+14%" 
                    icon={<Zap size={20} />} 
                    colorClass="bg-cyan-500"
                    delay={0.3}
                />
                <StatCard 
                    title="Station Health" 
                    value="98.5%" 
                    change="+2%" 
                    icon={<BatteryCharging size={20} />} 
                    colorClass="bg-emerald-500"
                    delay={0.4}
                />
            </div>

            {/* Charts Row */}
            <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 h-[400px]" title="Revenue & Energy Overview" subtitle="Comparing energy output vs revenue over time">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" className="dark:stroke-white/5" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 12}} 
                                tickFormatter={(value) => value >= 1000 ? `₱${(value / 1000).toFixed(0)}k` : `₱${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a' }} 
                                itemStyle={{ color: '#0f172a' }}
                                wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white"
                                formatter={(value: number, name: string) => [
                                    name === 'Revenue' ? `₱${value.toLocaleString()}` : `${value.toLocaleString()}`, 
                                    name
                                ]}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" name="Revenue" />
                            <Area type="monotone" dataKey="value2" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue2)" name="Energy (kWh)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <div className="space-y-6">
                    <Card className="h-[240px]" title="Station Usage" subtitle="Daily average utilization">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={STATION_USAGE_DATA}>
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} 
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card className="h-[136px] bg-gradient-to-r from-blue-600 to-indigo-700 !border-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sun size={100} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Solar Contribution</p>
                                <h3 className="text-2xl font-bold text-white mt-1">45% of Total</h3>
                            </div>
                            <div className="w-full bg-blue-900/40 rounded-full h-2 mt-2">
                                <div className="bg-white h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                            <p className="text-xs text-blue-100 mt-2">1,240 kWh generated by solar panels today.</p>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                <Card title="Total Active Stations" subtitle="Overview of all station statuses">
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex flex-col items-center justify-center text-center">
                            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-2">
                                <Zap size={20} />
                            </div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {MOCK_STATIONS.filter(s => s.status === 'Online').length}
                            </span>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Active</span>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20 flex flex-col items-center justify-center text-center">
                            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mb-2">
                                <Wrench size={20} />
                            </div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {MOCK_STATIONS.filter(s => s.status === 'Maintenance').length}
                            </span>
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Maintenance</span>
                        </div>

                        <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl border border-rose-100 dark:border-rose-500/20 flex flex-col items-center justify-center text-center">
                            <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 mb-2">
                                <AlertOctagon size={20} />
                            </div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {MOCK_STATIONS.filter(s => s.status === 'Offline' || s.status === 'Error').length}
                            </span>
                            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wide">Inactive</span>
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Total Stations</span>
                            <span className="font-bold text-slate-900 dark:text-white">{MOCK_STATIONS.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden flex">
                            <div 
                                className="bg-emerald-500 h-full" 
                                style={{ width: `${(MOCK_STATIONS.filter(s => s.status === 'Online').length / MOCK_STATIONS.length) * 100}%` }}
                            ></div>
                            <div 
                                className="bg-amber-500 h-full" 
                                style={{ width: `${(MOCK_STATIONS.filter(s => s.status === 'Maintenance').length / MOCK_STATIONS.length) * 100}%` }}
                            ></div>
                            <div 
                                className="bg-rose-500 h-full" 
                                style={{ width: `${(MOCK_STATIONS.filter(s => s.status === 'Offline' || s.status === 'Error').length / MOCK_STATIONS.length) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Maint.
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div> Inactive
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Total Downloads & Subscriptions" subtitle="User growth and plan adoption">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center">
                            <div className="p-3 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 mb-3">
                                <Download size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12,450</h3>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">App Downloads</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-500/20 text-center">
                            <div className="p-3 bg-purple-500 text-white rounded-full shadow-lg shadow-purple-500/30 mb-3">
                                <Crown size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {SUBSCRIPTION_PLANS.reduce((acc, plan) => acc + plan.activeUsers, 0).toLocaleString()}
                            </h3>
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wide">Total Subscribers</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Recent Subscribers</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {MOCK_USERS.slice(0, 5).map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700" />
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                                            user.subscriptionPlan === 'Free' ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                                            user.subscriptionPlan === 'Basic' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                            user.subscriptionPlan === 'Standard' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' :
                                            user.subscriptionPlan === 'Premium' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                            'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                            {user.subscriptionPlan}
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-1">{user.joinDate}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};