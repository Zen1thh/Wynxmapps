import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import gsap from 'gsap';
import { Card } from './ui/Card';
import { MOCK_STATIONS } from '../constants';
import { 
    Navigation, Map as MapIcon, RotateCcw, ArrowRight, Clock, Zap, Target, Route
} from 'lucide-react';

export const MapRoutes: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [routeResult, setRouteResult] = useState<{distance: string, duration: string, stations: number} | null>(null);
    const containerRef = useRef(null);

    // Initial Animation
    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current).setView([14.5995, 120.9842], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(map);

        // Add station markers
        MOCK_STATIONS.forEach(station => {
             const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="bg-blue-500 w-3 h-3 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>`,
                iconSize: [12, 12],
            });
            L.marker([station.coordinates.lat, station.coordinates.lng], { icon }).addTo(map)
             .bindPopup(`<b style="color:black">${station.name}</b><br><span style="color:#333">${station.power}</span>`);
        });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    const handleCalculateRoute = () => {
        if (!mapInstanceRef.current) return;
        setIsCalculating(true);
        setRouteResult(null);

        // Simulate calculation
        setTimeout(() => {
            const map = mapInstanceRef.current!;
            
            // Mock Route: Manila to Makati
            const latlngs = [
                [14.5995, 120.9842],
                [14.5800, 120.9900],
                [14.5600, 121.0000],
                [14.5547, 121.0244]
            ];

            const polyline = L.polyline(latlngs as any, {color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.8}).addTo(map);
            
            // Animate dash offset for "flow" effect
            let offset = 0;
            const animateLine = () => {
                offset -= 1;
                polyline.setStyle({ dashOffset: offset.toString() });
                requestAnimationFrame(animateLine);
            };
            animateLine();

            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

            setRouteResult({
                distance: '12.5 km',
                duration: '45 mins',
                stations: 2
            });
            setIsCalculating(false);
        }, 1500);
    };

    return (
        <div ref={containerRef} className="h-[calc(100vh-140px)] flex gap-6">
            {/* Sidebar Controls */}
            <Card className="w-96 flex flex-col p-6 space-y-6 shrink-0 border-r border-white/5 h-full">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Route size={20} className="text-blue-500" /> Route Planner
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Optimize charging corridors.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Start Point</label>
                        <div className="relative">
                            <input 
                                value={startPoint}
                                onChange={(e) => setStartPoint(e.target.value)}
                                type="text" 
                                placeholder="Enter location..." 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-9 text-white text-sm focus:border-blue-500 outline-none" 
                            />
                            <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <ArrowRight size={16} className="text-slate-600 rotate-90" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Destination</label>
                        <div className="relative">
                            <input 
                                value={endPoint}
                                onChange={(e) => setEndPoint(e.target.value)}
                                type="text" 
                                placeholder="Enter location..." 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-9 text-white text-sm focus:border-blue-500 outline-none" 
                            />
                            <MapIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleCalculateRoute}
                        disabled={isCalculating}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isCalculating ? 'Calculating...' : <><Navigation size={16} /> Optimize Route</>}
                    </button>
                </div>

                {routeResult && (
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2">Optimal Route Found</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                                <Clock size={16} className="mx-auto text-slate-400 mb-1" />
                                <p className="text-sm font-bold text-white">{routeResult.duration}</p>
                                <p className="text-[10px] text-slate-500">Est. Time</p>
                            </div>
                            <div className="text-center border-l border-white/5">
                                <Navigation size={16} className="mx-auto text-slate-400 mb-1" />
                                <p className="text-sm font-bold text-white">{routeResult.distance}</p>
                                <p className="text-[10px] text-slate-500">Distance</p>
                            </div>
                            <div className="text-center border-l border-white/5">
                                <Zap size={16} className="mx-auto text-yellow-400 mb-1" />
                                <p className="text-sm font-bold text-white">{routeResult.stations}</p>
                                <p className="text-[10px] text-slate-500">Stations</p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Map Area */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative glass-panel">
                 <div ref={mapRef} className="w-full h-full z-0" style={{ background: '#0f172a' }}></div>
                 
                 <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-white/10 z-[400]">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 px-2">Map Layers</p>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-600 text-blue-600" />
                            <span className="text-xs text-white">Traffic Heatmap</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-600 text-blue-600" />
                            <span className="text-xs text-white">Station Status</span>
                        </label>
                    </div>
                 </div>
            </div>
        </div>
    );
};