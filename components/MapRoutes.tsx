import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import gsap from 'gsap';
import { Card } from './ui/Card';
import { MOCK_STATIONS } from '../constants';
import { 
    Navigation, Map as MapIcon, RotateCcw, ArrowRight, Clock, Zap, Target, Route, 
    Plus, Save, Trash2, MapPin, MousePointerClick, CheckCircle2, XCircle, Layout, Layers,
    Sun, Moon, Satellite
} from 'lucide-react';

// --- Types for Route Manager ---
interface Waypoint {
    lat: number;
    lng: number;
    address?: string;
}

interface AdminRoute {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Draft' | 'Maintenance';
    waypoints: Waypoint[];
    totalDistance: string; // pre-calculated string for mock
    estimatedTime: string;
    stationsEnRoute: number;
}

type MapStyle = 'dark' | 'light' | 'satellite';

const MAP_STYLES = {
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    },
    light: {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri'
    }
};

// --- Mock Data ---
const MOCK_ADMIN_ROUTES: AdminRoute[] = [
    {
        id: 'rt_001',
        name: 'Metro Manila Loop',
        description: 'Primary charging corridor connecting Makati, Taguig, and QC.',
        status: 'Active',
        waypoints: [
            { lat: 14.5547, lng: 121.0244 }, // Makati
            { lat: 14.5509, lng: 121.0503 }, // BGC
            { lat: 14.6516, lng: 121.0493 }  // QC
        ],
        totalDistance: '18.5 km',
        estimatedTime: '1h 10m',
        stationsEnRoute: 3
    },
    {
        id: 'rt_002',
        name: 'South Express Corridor',
        description: 'Fast charging route for SLEX travelers.',
        status: 'Maintenance',
        waypoints: [
            { lat: 14.5353, lng: 120.9826 }, // MOA
            { lat: 14.3051, lng: 121.0964 }  // Biñan
        ],
        totalDistance: '28.2 km',
        estimatedTime: '45m',
        stationsEnRoute: 2
    }
];

export const MapRoutes: React.FC = () => {
    // Refs
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const containerRef = useRef(null);
    
    // Layer Refs
    const markersGroupRef = useRef<L.LayerGroup | null>(null); // For active route editing/planning
    const routeLineRef = useRef<L.Polyline | null>(null);
    const stationsLayerRef = useRef<L.LayerGroup | null>(null); // For station markers
    const trafficLayerRef = useRef<L.LayerGroup | null>(null); // For traffic heatmap
    
    // State: General
    const [mode, setMode] = useState<'planner' | 'manager'>('planner');
    const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
    
    // State: Layer Toggles
    const [showTraffic, setShowTraffic] = useState(false);
    const [showStations, setShowStations] = useState(true);
    
    // State: Planner (User Simulation)
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [routeResult, setRouteResult] = useState<{distance: string, duration: string, stations: number} | null>(null);

    // State: Manager (Admin)
    const [adminRoutes, setAdminRoutes] = useState<AdminRoute[]>(MOCK_ADMIN_ROUTES);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    
    // New Route Form State
    const [newRouteName, setNewRouteName] = useState('');
    const [newRouteDesc, setNewRouteDesc] = useState('');
    const [newRouteWaypoints, setNewRouteWaypoints] = useState<Waypoint[]>([]);

    // Check theme for initial map style
    useEffect(() => {
        if (!document.documentElement.classList.contains('dark')) {
            setMapStyle('light');
        }
    }, []);

    // Initial Animation
    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    }, []);

    // Helper to add tile layer
    const addTileLayer = (map: L.Map, style: MapStyle) => {
        if (tileLayerRef.current) {
            tileLayerRef.current.remove();
        }
        
        const config = MAP_STYLES[style];
        const layer = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: 19
        });
        
        layer.addTo(map);
        tileLayerRef.current = layer;
    };

    // Initialize Map
    useEffect(() => {
        const initTimer = setTimeout(() => {
            if (!mapRef.current || mapInstanceRef.current) return;

            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([14.5995, 120.9842], 12); // Manila Center
            
            // Initial Tile Layer
            addTileLayer(map, mapStyle);

            // Initialize Layer Groups
            const markersGroup = L.layerGroup().addTo(map); // Always active for editor
            markersGroupRef.current = markersGroup;

            const stationsLayer = L.layerGroup();
            stationsLayerRef.current = stationsLayer;
            if (showStations) stationsLayer.addTo(map);

            const trafficLayer = L.layerGroup();
            trafficLayerRef.current = trafficLayer;
            // Traffic not added by default unless showTraffic is true

            // Populate Stations Layer
            MOCK_STATIONS.forEach(station => {
                 const icon = L.divIcon({
                    className: 'station-marker',
                    html: `<div class="bg-primary/90 dark:bg-blue-900/80 text-white dark:text-blue-400 w-6 h-6 rounded-full border-2 border-white dark:border-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(21,51,133,0.5)] transform hover:scale-110 transition-transform cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                           </div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                
                L.marker([station.coordinates.lat, station.coordinates.lng], { icon })
                 .addTo(stationsLayer) // Add to specific layer group
                 .bindPopup(`
                    <div class="min-w-[160px] text-slate-900 dark:text-white font-sans">
                        <h3 class="font-bold text-sm mb-1 text-primary dark:text-white">${station.name}</h3>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                station.status === 'Online' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                                station.status === 'Maintenance' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                                'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                            }">${station.status}</span>
                            <span class="text-xs text-slate-500 dark:text-slate-300 font-mono">${station.power}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 pt-2">
                            <span>Available:</span>
                            <span class="font-bold text-slate-900 dark:text-white">${station.availableSlots}/${station.totalSlots} Slots</span>
                        </div>
                    </div>
                 `);
            });

            // Populate Traffic Layer (Simulated Industry Heatmap)
            // 1. High Congestion Zones (Red)
            const congestionZones = [
                { lat: 14.5547, lng: 121.0244, r: 800 }, // Makati CBD
                { lat: 14.6095, lng: 120.9892, r: 600 }, // Quiapo/Manila
                { lat: 14.5847, lng: 121.0564, r: 700 }, // Ortigas
            ];
            
            congestionZones.forEach(zone => {
                L.circle([zone.lat, zone.lng], {
                    color: 'transparent',
                    fillColor: '#ef4444', // Red
                    fillOpacity: 0.3,
                    radius: zone.r
                }).addTo(trafficLayer);
                
                // Inner core
                L.circle([zone.lat, zone.lng], {
                    color: 'transparent',
                    fillColor: '#b91c1c', // Dark Red
                    fillOpacity: 0.4,
                    radius: zone.r / 2
                }).addTo(trafficLayer);
            });

            // 2. Simulated Traffic Flow Lines
            const trafficFlows = [
                { from: [14.5353, 120.9826], to: [14.5547, 121.0244], color: '#f59e0b' }, // MOA to Makati
                { from: [14.5547, 121.0244], to: [14.5509, 121.0503], color: '#ef4444' }, // Makati to BGC
                { from: [14.5509, 121.0503], to: [14.6516, 121.0493], color: '#10b981' }, // BGC to QC
            ];

            trafficFlows.forEach(flow => {
                L.polyline([flow.from as [number, number], flow.to as [number, number]], {
                    color: flow.color,
                    weight: 6,
                    opacity: 0.6,
                    lineCap: 'round'
                }).addTo(trafficLayer);
            });

            // Click Handler for Route Creation
            map.on('click', (e: L.LeafletMouseEvent) => {
                const event = new CustomEvent('map-click', { detail: e.latlng });
                window.dispatchEvent(event);
            });

            mapInstanceRef.current = map;

            setTimeout(() => {
                map.invalidateSize();
            }, 300);

        }, 100);

        return () => {
            clearTimeout(initTimer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                // Reset refs to avoid access to destroyed map layers
                markersGroupRef.current = null;
                routeLineRef.current = null;
                stationsLayerRef.current = null;
                trafficLayerRef.current = null;
                tileLayerRef.current = null;
            }
        };
    }, []); 

    // Update Tile Layer when mapStyle changes
    useEffect(() => {
        if (mapInstanceRef.current) {
            addTileLayer(mapInstanceRef.current, mapStyle);
        }
    }, [mapStyle]);

    // Handle Stations Visibility
    useEffect(() => {
        const map = mapInstanceRef.current;
        const layer = stationsLayerRef.current;
        if (!map || !layer) return;

        if (showStations) {
            if (!map.hasLayer(layer)) map.addLayer(layer);
        } else {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        }
    }, [showStations]);

    // Handle Traffic Visibility
    useEffect(() => {
        const map = mapInstanceRef.current;
        const layer = trafficLayerRef.current;
        if (!map || !layer) return;

        if (showTraffic) {
            if (!map.hasLayer(layer)) map.addLayer(layer);
        } else {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        }
    }, [showTraffic]);

    // Handle Map Clicks for Waypoint Addition
    useEffect(() => {
        const handleMapClick = (e: any) => {
            if (mode === 'manager' && isCreating) {
                const latlng = e.detail;
                setNewRouteWaypoints(prev => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
            }
        };

        window.addEventListener('map-click', handleMapClick);
        return () => window.removeEventListener('map-click', handleMapClick);
    }, [mode, isCreating]);

    // Render Routes on Map (Manager Mode & Creating Mode)
    useEffect(() => {
        const map = mapInstanceRef.current;
        const layerGroup = markersGroupRef.current;
        
        // Safety check: ensure map instance exists and hasn't been destroyed
        if (!map || !layerGroup || !map.getContainer()) return;

        // Clear dynamic layers
        layerGroup.clearLayers();
        if (routeLineRef.current) {
            routeLineRef.current.remove();
            routeLineRef.current = null;
        }

        // Logic for "Manager" Mode
        if (mode === 'manager') {
            let pointsToDraw: Waypoint[] = [];
            let color = '#3b82f6'; // Blue default

            if (isCreating) {
                pointsToDraw = newRouteWaypoints;
                color = '#10b981'; // Emerald for creating
            } else if (selectedRouteId) {
                const route = adminRoutes.find(r => r.id === selectedRouteId);
                if (route) pointsToDraw = route.waypoints;
            }

            if (pointsToDraw.length > 0) {
                // Draw Markers
                pointsToDraw.forEach((pt, index) => {
                    const isStart = index === 0;
                    const isEnd = index === pointsToDraw.length - 1;
                    
                    const markerHtml = isStart 
                        ? `<div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`
                        : isEnd 
                            ? `<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>`
                            : `<div class="w-3 h-3 bg-white rounded-full border border-slate-500 shadow-sm"></div>`;

                    const icon = L.divIcon({
                        className: 'waypoint-marker',
                        html: markerHtml,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    });

                    L.marker([pt.lat, pt.lng], { icon }).addTo(layerGroup);
                });

                // Draw Polyline
                const latlngs = pointsToDraw.map(pt => [pt.lat, pt.lng] as [number, number]);
                routeLineRef.current = L.polyline(latlngs, {
                    color: color,
                    weight: 4,
                    opacity: 0.8,
                    dashArray: isCreating ? '5, 10' : undefined // Dashed line for draft
                }).addTo(map);

                // Fit bounds if creating or newly selected
                if (pointsToDraw.length > 1) {
                    // Use requestAnimationFrame to prevent layout thrashing and potential undefined errors during rapid updates
                    requestAnimationFrame(() => {
                        if (routeLineRef.current && map) {
                            try {
                                map.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });
                            } catch (e) {
                                // Ignore bounds errors during fast updates
                            }
                        }
                    });
                }
            }
        } 
        // Logic for "Planner" Mode (Legacy Simulation)
        else if (mode === 'planner' && routeResult) {
             // Mock Route: Manila to Makati (Hardcoded for demo)
             const latlngs = [
                [14.5995, 120.9842],
                [14.5800, 120.9900],
                [14.5600, 121.0000],
                [14.5547, 121.0244]
            ];
            routeLineRef.current = L.polyline(latlngs as any, {color: '#153385', weight: 5, opacity: 0.8}).addTo(map);
            requestAnimationFrame(() => {
                if (routeLineRef.current && map) {
                    map.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });
                }
            });
        }

    }, [mode, isCreating, newRouteWaypoints, selectedRouteId, routeResult, adminRoutes]);


    // --- Handlers ---

    const handleStartCreate = () => {
        setIsCreating(true);
        setSelectedRouteId(null);
        setNewRouteWaypoints([]);
        setNewRouteName('');
        setNewRouteDesc('');
        // Clear previous planner results
        setRouteResult(null);
    };

    const handleSaveNewRoute = () => {
        if (!newRouteName || newRouteWaypoints.length < 2) return;

        // Calculate rough distance (mock calculation)
        let totalDist = 0;
        for(let i=0; i<newRouteWaypoints.length-1; i++) {
            const from = L.latLng(newRouteWaypoints[i].lat, newRouteWaypoints[i].lng);
            const to = L.latLng(newRouteWaypoints[i+1].lat, newRouteWaypoints[i+1].lng);
            totalDist += from.distanceTo(to);
        }
        
        const newRoute: AdminRoute = {
            id: `rt_${Date.now()}`,
            name: newRouteName,
            description: newRouteDesc || 'Custom admin route',
            status: 'Active',
            waypoints: newRouteWaypoints,
            totalDistance: `${(totalDist / 1000).toFixed(1)} km`,
            estimatedTime: `${Math.round((totalDist / 1000) * 3)} mins`, // Rough calc
            stationsEnRoute: Math.floor(Math.random() * 4) + 1
        };

        setAdminRoutes(prev => [...prev, newRoute]);
        setIsCreating(false);
        setSelectedRouteId(newRoute.id);
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
        setNewRouteWaypoints([]);
    };

    const deleteRoute = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setAdminRoutes(prev => prev.filter(r => r.id !== id));
        if (selectedRouteId === id) setSelectedRouteId(null);
    };

    const handleCalculatePlanner = () => {
        if (!mapInstanceRef.current) return;
        setIsCalculating(true);
        setRouteResult(null);

        // Simulate calculation
        setTimeout(() => {
            setRouteResult({
                distance: '12.5 km',
                duration: '45 mins',
                stations: 2
            });
            setIsCalculating(false);
        }, 1200);
    };

    const undoLastWaypoint = () => {
        setNewRouteWaypoints(prev => prev.slice(0, -1));
    };

    return (
        <div ref={containerRef} className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
            
            {/* Sidebar Controls - Solid Background */}
            <Card className="w-full md:w-96 flex flex-col p-0 overflow-hidden shrink-0 h-full border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b1121] shadow-lg">
                
                {/* Mode Toggles */}
                <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b1121]">
                    <div className="flex bg-slate-200 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-300 dark:border-white/5">
                        <button
                            onClick={() => { setMode('planner'); setIsCreating(false); setSelectedRouteId(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'planner' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <Navigation size={14} /> Planner
                        </button>
                        <button
                            onClick={() => { setMode('manager'); setRouteResult(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'manager' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <Layers size={14} /> Manager
                        </button>
                    </div>
                </div>

                {/* Content Area Based on Mode */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-[#0b1121]">
                    
                    {/* --- PLANNER MODE --- */}
                    {mode === 'planner' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-primary dark:text-white">Route Planner</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Simulate user journey & optimizations.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Start Point</label>
                                    <div className="relative">
                                        <input 
                                            value={startPoint}
                                            onChange={(e) => setStartPoint(e.target.value)}
                                            type="text" 
                                            placeholder="Enter start location..." 
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 pl-9 text-slate-900 dark:text-white text-sm focus:border-primary dark:focus:border-blue-500 outline-none transition-colors placeholder-slate-400" 
                                        />
                                        <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary dark:text-blue-500" />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-white/5">
                                        <ArrowRight size={14} className="text-slate-400 dark:text-slate-500 rotate-90" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Destination</label>
                                    <div className="relative">
                                        <input 
                                            value={endPoint}
                                            onChange={(e) => setEndPoint(e.target.value)}
                                            type="text" 
                                            placeholder="Enter destination..." 
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 pl-9 text-slate-900 dark:text-white text-sm focus:border-primary dark:focus:border-blue-500 outline-none transition-colors placeholder-slate-400" 
                                        />
                                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCalculatePlanner}
                                    disabled={isCalculating}
                                    className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 dark:from-blue-600 dark:to-indigo-600 hover:from-blue-800 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                                >
                                    {isCalculating ? <span className="animate-spin"><RotateCcw size={16}/></span> : <><Navigation size={16} /> Optimize Route</>}
                                </button>
                            </div>

                            {routeResult && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 space-y-4 animate-in fade-in zoom-in-95">
                                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2">
                                        <h3 className="font-bold text-primary dark:text-white text-sm">Best Route Found</h3>
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">98% Match</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center">
                                            <Clock size={16} className="mx-auto text-primary dark:text-blue-400 mb-1" />
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{routeResult.duration}</p>
                                            <p className="text-[10px] text-slate-500">Est. Time</p>
                                        </div>
                                        <div className="text-center border-l border-slate-200 dark:border-white/5">
                                            <Route size={16} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{routeResult.distance}</p>
                                            <p className="text-[10px] text-slate-500">Distance</p>
                                        </div>
                                        <div className="text-center border-l border-slate-200 dark:border-white/5">
                                            <Zap size={16} className="mx-auto text-accent dark:text-yellow-400 mb-1" />
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{routeResult.stations}</p>
                                            <p className="text-[10px] text-slate-500">Stations</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- MANAGER MODE --- */}
                    {mode === 'manager' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {!isCreating ? (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-primary dark:text-white">Route Manager</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Create predefined routes for users.</p>
                                        </div>
                                        <button 
                                            onClick={handleStartCreate}
                                            className="p-2 bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 rounded-lg text-white shadow-lg transition-colors"
                                            title="Add New Route"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    {/* Existing Routes List */}
                                    <div className="space-y-3">
                                        {adminRoutes.map(route => (
                                            <div 
                                                key={route.id}
                                                onClick={() => setSelectedRouteId(route.id)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/5 group relative ${selectedRouteId === route.id ? 'bg-blue-50 dark:bg-blue-600/10 border-primary/50 dark:border-blue-500/50 ring-1 ring-primary/20 dark:ring-blue-500/20' : 'bg-white dark:bg-slate-950/30 border-slate-200 dark:border-white/5'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`text-sm font-bold ${selectedRouteId === route.id ? 'text-primary dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{route.name}</h4>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                                                        route.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    }`}>{route.status}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{route.description}</p>
                                                
                                                <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                                                    <span className="flex items-center gap-1"><MapIcon size={12}/> {route.totalDistance}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12}/> {route.estimatedTime}</span>
                                                </div>

                                                <button 
                                                    onClick={(e) => deleteRoute(route.id, e)}
                                                    className="absolute bottom-3 right-3 p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                // CREATE NEW ROUTE FORM
                                <div className="space-y-4 animate-in fade-in zoom-in-95">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-primary dark:text-white flex items-center gap-2">
                                            <Plus size={16} className="text-emerald-500 dark:text-emerald-400" /> New Route
                                        </h3>
                                        <button onClick={handleCancelCreate} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline">Cancel</button>
                                    </div>

                                    <div className="space-y-3">
                                        <input 
                                            value={newRouteName}
                                            onChange={(e) => setNewRouteName(e.target.value)}
                                            type="text" 
                                            placeholder="Route Name (e.g. Scenic Coastal)" 
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm focus:border-emerald-500 outline-none"
                                        />
                                        <textarea 
                                            value={newRouteDesc}
                                            onChange={(e) => setNewRouteDesc(e.target.value)}
                                            placeholder="Short description..." 
                                            rows={2}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm focus:border-emerald-500 outline-none resize-none"
                                        />
                                    </div>

                                    <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase mb-2">
                                            <MousePointerClick size={14} /> Plotting Mode
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                            Click on the map to drop waypoints.
                                        </p>
                                        <div className="flex items-center justify-between mt-3 bg-white dark:bg-black/20 p-2 rounded border border-slate-200 dark:border-white/5">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Waypoints: <b className="text-slate-900 dark:text-white">{newRouteWaypoints.length}</b></span>
                                            {newRouteWaypoints.length > 0 && (
                                                <button onClick={undoLastWaypoint} className="text-[10px] text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1">
                                                    <RotateCcw size={10} /> Undo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={handleSaveNewRoute}
                                            disabled={!newRouteName || newRouteWaypoints.length < 2}
                                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            <Save size={16} /> Save Route
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Map Visualization Area */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative glass-panel shadow-2xl flex flex-col bg-white dark:bg-[#0f172a]">
                 <div ref={mapRef} className="flex-1 z-0 relative w-full h-full">
                    {/* Map container populated by Leaflet */}
                 </div>
                 
                 {/* Floating Legend / Instructions */}
                 <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2 pointer-events-none">
                    {mode === 'manager' && isCreating && (
                        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-emerald-500/30 shadow-2xl animate-in slide-in-from-top-4">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Edit Mode Active
                            </p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300">Click map to add points.</p>
                        </div>
                    )}
                 </div>

                 {/* Controls Layer - Solid Backgrounds */}
                 <div className="absolute top-4 right-4 z-[500] bg-white dark:bg-[#0b1121] p-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl">
                    {/* Map Style Controls */}
                    <div className="flex gap-1 mb-3 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                        <button 
                            onClick={() => setMapStyle('dark')}
                            className={`flex-1 p-1.5 rounded-md flex items-center justify-center transition-all ${mapStyle === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'}`}
                            title="Dark Mode"
                        >
                            <Moon size={14} />
                        </button>
                        <button 
                            onClick={() => setMapStyle('light')}
                            className={`flex-1 p-1.5 rounded-md flex items-center justify-center transition-all ${mapStyle === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'}`}
                            title="Light Mode"
                        >
                            <Sun size={14} />
                        </button>
                        <button 
                            onClick={() => setMapStyle('satellite')}
                            className={`flex-1 p-1.5 rounded-md flex items-center justify-center transition-all ${mapStyle === 'satellite' ? 'bg-primary dark:bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'}`}
                            title="Satellite View"
                        >
                            <Satellite size={14} />
                        </button>
                    </div>

                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 px-2 tracking-wide">Map Layers</p>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={showTraffic}
                                    onChange={(e) => setShowTraffic(e.target.checked)}
                                    className="peer sr-only" 
                                />
                                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-primary dark:peer-checked:bg-blue-600 transition-colors"></div>
                                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                            </div>
                            <span className="text-xs text-slate-700 dark:text-white">Traffic Heatmap</span>
                        </label>
                        <label className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={showStations}
                                    onChange={(e) => setShowStations(e.target.checked)}
                                    className="peer sr-only" 
                                />
                                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-primary dark:peer-checked:bg-blue-600 transition-colors"></div>
                                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                            </div>
                            <span className="text-xs text-slate-700 dark:text-white">Stations</span>
                        </label>
                    </div>
                 </div>
                 
                 {/* Bottom Info Bar - Solid Background */}
                 {(routeResult || (mode === 'manager' && selectedRouteId)) && (
                    <div className="h-12 bg-white dark:bg-[#0b1121] border-t border-slate-200 dark:border-white/5 flex items-center px-6 justify-between animate-in slide-in-from-bottom-2 relative z-[500] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <CheckCircle2 size={14} className="text-primary dark:text-blue-500" />
                            <span>Route visualized on map</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Wynx Navigation System v2.4
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};