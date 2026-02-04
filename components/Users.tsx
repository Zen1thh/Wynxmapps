
import React, { useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { MOCK_USERS } from '../constants';
import gsap from 'gsap';
import { Search, MoreHorizontal, UserPlus } from 'lucide-react';

export const Users: React.FC = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    }, []);

    return (
        <div ref={containerRef} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    <UserPlus size={16} /> Add User
                </button>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="p-4 border-b border-white/5 bg-white/5 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            className="bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-full placeholder-slate-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-900/50 text-slate-300">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Subscription</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_USERS.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white">{user.role}</td>
                                    <td className="px-6 py-4">
                                        {user.subscriptionPlan ? (
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                user.subscriptionPlan === 'Elite' ? 'bg-amber-500/10 text-amber-400' : 
                                                user.subscriptionPlan === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-slate-500/10 text-slate-400'
                                            }`}>
                                                {user.subscriptionPlan}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                                            {user.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
