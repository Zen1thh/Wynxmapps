import React, { useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import gsap from 'gsap';
import { Send, Phone, Video, MoreVertical, Paperclip } from 'lucide-react';

export const Support: React.FC = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4 });
    }, []);

    return (
        <div ref={containerRef} className="h-[calc(100vh-140px)] flex gap-6">
            {/* Chat List */}
            <Card className="w-1/3 flex flex-col p-0 overflow-hidden border-r border-white/5">
                <div className="p-4 border-b border-white/5 bg-slate-900/50">
                    <h3 className="font-bold text-white">Active Chats <span className="ml-2 bg-blue-600 text-[10px] px-1.5 py-0.5 rounded-full">3</span></h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group ${i === 1 ? 'bg-blue-600/5 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}>
                            <div className="flex justify-between mb-1">
                                <h4 className={`text-sm font-bold ${i === 1 ? 'text-blue-400' : 'text-white'}`}>User #{i}024</h4>
                                <span className="text-xs text-slate-500">2m ago</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">I'm having trouble with the station at Market St...</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Chat Window */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden">
                 <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm text-white font-bold shadow-lg">JD</div>
                        <div>
                            <h3 className="font-bold text-white text-sm">John Doe</h3>
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Phone size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Video size={18} /></button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                    </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-[#0b1121] to-[#0f172a]">
                    <div className="flex justify-center">
                        <span className="text-[10px] uppercase tracking-widest text-slate-600 bg-slate-900/50 px-3 py-1 rounded-full">Today</span>
                    </div>
                    
                    <div className="flex justify-start">
                        <div className="flex gap-2 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold mt-1">JD</div>
                            <div>
                                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 shadow-md border border-white/5">
                                    <p className="text-sm text-slate-200">Hello, I cannot seem to book a slot for tomorrow.</p>
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 ml-1">10:42 AM</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="flex gap-2 max-w-[80%] flex-row-reverse">
                             <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold mt-1">Me</div>
                             <div>
                                <div className="bg-blue-600 rounded-2xl rounded-tr-none p-3 shadow-md shadow-blue-900/20">
                                    <p className="text-sm text-white">Hi John, let me check that for you. Which station are you looking at?</p>
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 mr-1 text-right block">10:43 AM</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="flex gap-2 items-end bg-slate-800/50 p-2 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg">
                            <Paperclip size={20} />
                        </button>
                        <textarea 
                            placeholder="Type your message..." 
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white resize-none py-2 max-h-32 placeholder-slate-500"
                            rows={1}
                        />
                        <button className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};