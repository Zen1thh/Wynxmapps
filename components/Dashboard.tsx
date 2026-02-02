import React, { useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { REVENUE_DATA, STATION_USAGE_DATA, MOCK_STATIONS } from '../constants';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar
} from 'recharts';
import { Zap, Users, BatteryCharging, DollarSign, ArrowUpRight, Sun, MapPin } from 'lucide-react';
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
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform scale-150 ${colorClass}`}>
                {icon}
            </div>
            <div className="z-10">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    <span className="text-emerald-400 text-xs font-bold flex items-center">
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
                    <h1 className="text-2xl font-bold text-white">Wynxsmapp Admin Dashboard</h1>
                    <p className="text-slate-400 text-sm">Welcome back, Admin. Here is the latest solar charging data.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value="$53,000" 
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
                        <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                                itemStyle={{ color: '#fff' }}
                            />
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
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
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
                <Card title="Nearby Active Stations" subtitle="Stations with highest availability">
                    <div className="space-y-4 mt-2">
                        {MOCK_STATIONS.slice(0, 3).map((station) => (
                            <div key={station.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        station.status === 'Online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{station.name}</h4>
                                        <p className="text-xs text-slate-400">{station.location} • {station.power}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-white">{station.availableSlots}/{station.totalSlots}</span>
                                    <p className="text-xs text-slate-500">Slots Open</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Recent Activity" subtitle="Real-time system events">
                    <div className="space-y-6 mt-4 relative pl-4 border-l border-slate-700 ml-2">
                         <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900"></div>
                            <p className="text-sm text-slate-300">New station <span className="text-white font-medium">EcoPark Plaza</span> approved by Admin.</p>
                            <span className="text-xs text-slate-500 block mt-1">20 minutes ago</span>
                         </div>
                         <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-slate-900"></div>
                            <p className="text-sm text-slate-300">User <span className="text-white font-medium">Alex Johnson</span> subscribed to SolarElite plan.</p>
                            <span className="text-xs text-slate-500 block mt-1">2 hours ago</span>
                         </div>
                         <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900"></div>
                            <p className="text-sm text-slate-300">Station <span className="text-white font-medium">GreenLife Mall</span> reported offline.</p>
                            <span className="text-xs text-slate-500 block mt-1">5 hours ago</span>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};