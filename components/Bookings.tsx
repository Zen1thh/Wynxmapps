import React, { useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { MOCK_BOOKINGS } from '../constants';
import gsap from 'gsap';
import { Calendar, Filter, Download } from 'lucide-react';

export const Bookings: React.FC = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    }, []);

    return (
        <div ref={containerRef} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Booking Management</h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm border border-slate-700 hover:text-white transition-colors">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-500 transition-colors">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>
            
            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-900/50 text-slate-300 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Station</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_BOOKINGS.map((booking, index) => (
                                <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white group-hover:text-blue-400 transition-colors">
                                        {booking.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white">{booking.stationName}</span>
                                            <span className="text-xs">ID: {booking.stationId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {booking.date} <span className="text-slate-600">|</span> {booking.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            booking.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            booking.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white font-mono">${booking.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-500 hover:text-white transition-colors text-xs font-medium">View Details</button>
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