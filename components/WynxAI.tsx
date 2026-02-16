import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/Card';
import gsap from 'gsap';
import { 
    Bot, Cpu, Activity, Zap, MessageSquare, 
    Send, Settings, Sparkles, BarChart3, Database,
    RefreshCw, Terminal, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid, YAxis } from 'recharts';

const AI_USAGE_DATA = [
    { time: '00:00', tokens: 1200 },
    { time: '04:00', tokens: 800 },
    { time: '08:00', tokens: 4500 },
    { time: '12:00', tokens: 8900 },
    { time: '16:00', tokens: 7200 },
    { time: '20:00', tokens: 5100 },
    { time: '23:59', tokens: 2300 },
];

export const WynxAI: React.FC = () => {
    const containerRef = useRef(null);
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
        { role: 'ai', text: 'Hello Administrator. Wynx Core v2.4 is online. How can I assist you with system optimization today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".stagger-in", 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: `I've analyzed your request regarding "${newMsg.text}". Based on current station metrics, I recommend re-routing traffic from the Makati hub to the BGC station to balance the load.` 
            }]);
        }, 1500);
    };

    return (
        <div ref={containerRef} className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Bot className="text-primary dark:text-blue-500" size={32} /> Wynx AI Intelligence
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Monitor AI performance, manage models, and interact with the core system.</p>
                </div>
                <div className="flex gap-3">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Online
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Config */}
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="stagger-in glass-card p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b1121] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Cpu size={18} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Latency</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">42ms</h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-bold">
                                <Activity size={12} /> Optimal
                            </p>
                        </div>
                        <div className="stagger-in glass-card p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b1121] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Zap size={18} className="text-accent" />
                                </div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Requests/m</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">1,240</h3>
                            <p className="text-xs text-primary dark:text-blue-400 flex items-center gap-1 mt-1 font-bold">
                                +12% vs avg
                            </p>
                        </div>
                    </div>

                    {/* Usage Chart */}
                    <Card className="stagger-in h-[280px]" title="Token Usage" subtitle="Real-time consumption">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={AI_USAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#153385" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#153385" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" className="dark:stroke-white/5" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                                    itemStyle={{ color: '#153385' }}
                                    wrapperClassName="dark:!bg-[#0b1121] dark:!border-white/10 dark:!text-white"
                                />
                                <Area type="monotone" dataKey="tokens" stroke="#153385" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Configuration */}
                    <Card className="stagger-in" title="Model Configuration">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Active Model</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none transition-all">
                                    <option>Wynx-Core-Pro v2.4 (Recommended)</option>
                                    <option>Wynx-Lite v1.0</option>
                                    <option>GPT-4o (External)</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Temperature</label>
                                    <span className="text-xs font-mono text-primary dark:text-blue-400 font-bold">0.7</span>
                                </div>
                                <input type="range" min="0" max="100" defaultValue="70" className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-blue-500" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <Database size={16} className="text-slate-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">Knowledge Base</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Synced</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Interactive Console */}
                <div className="lg:col-span-2 h-[600px] flex flex-col stagger-in bg-white dark:bg-[#0b1121] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden relative">
                    {/* Console Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 dark:bg-blue-500/10 rounded-lg">
                                <Terminal size={16} className="text-primary dark:text-blue-400" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">Admin Console</span>
                        </div>
                        <button className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg">
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-[#0f172a] custom-scrollbar relative">
                        {/* Background Logo Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                            <Bot size={200} className="text-slate-900 dark:text-white" />
                        </div>

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-primary dark:bg-blue-600 text-white rounded-tr-sm' 
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-white/5'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start relative z-10">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm p-4 border border-slate-200 dark:border-white/5 flex gap-1 shadow-sm">
                                    <span className="w-2 h-2 bg-primary dark:bg-blue-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-primary dark:bg-blue-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-primary dark:bg-blue-500 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50">
                        <form onSubmit={handleSend} className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Wynx to optimize routes, analyze logs, or generate reports..." 
                                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 hidden sm:block">CMD + K</span>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={!input.trim()}
                                className="p-3 bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 rounded-xl text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                <Sparkles size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};