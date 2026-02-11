import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/Card';
import gsap from 'gsap';
import { 
    Bot, Cpu, Activity, Zap, MessageSquare, 
    Send, Settings, Sparkles, BarChart3, Database,
    RefreshCw, Terminal, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

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
        <div ref={containerRef} className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Bot className="text-blue-500" size={32} /> Wynx AI Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2">Monitor AI performance, manage models, and interact with the core system.</p>
                </div>
                <div className="flex gap-3">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
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
                        <div className="stagger-in glass-card p-4 rounded-xl border border-white/5 bg-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <Cpu size={20} className="text-purple-400" />
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Latency</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">42ms</h3>
                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1"><Activity size={12} /> Optimal</p>
                        </div>
                        <div className="stagger-in glass-card p-4 rounded-xl border border-white/5 bg-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <Zap size={20} className="text-yellow-400" />
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Requests/m</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">1,240</h3>
                            <p className="text-xs text-blue-400 flex items-center gap-1 mt-1">+12% vs avg</p>
                        </div>
                    </div>

                    {/* Usage Chart */}
                    <Card className="stagger-in h-[250px]" title="Token Usage" subtitle="Real-time consumption">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={AI_USAGE_DATA}>
                                <defs>
                                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTokens)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Configuration */}
                    <Card className="stagger-in" title="Model Configuration">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Active Model</label>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option>Wynx-Core-Pro v2.4 (Recommended)</option>
                                    <option>Wynx-Lite v1.0</option>
                                    <option>GPT-4o (External)</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Temperature</label>
                                    <span className="text-xs font-mono text-purple-400">0.7</span>
                                </div>
                                <input type="range" min="0" max="100" defaultValue="70" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Database size={16} className="text-slate-400" />
                                    <span className="text-sm text-slate-200">Knowledge Base</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Synced</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Interactive Console */}
                <div className="lg:col-span-2 h-[600px] flex flex-col stagger-in glass-card border border-white/5 p-0 overflow-hidden rounded-2xl">
                    <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <Terminal size={18} className="text-purple-400" />
                            <span className="font-bold text-white text-sm">Admin Console</span>
                        </div>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                                    : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 border border-white/5 flex gap-1">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-slate-900/50">
                        <form onSubmit={handleSend} className="relative">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Wynx to optimize routes, analyze logs, or generate reports..." 
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-purple-500 transition-all placeholder-slate-500"
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors shadow-lg shadow-purple-600/20"
                            >
                                <Sparkles size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};