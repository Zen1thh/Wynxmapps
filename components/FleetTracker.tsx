import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import gsap from 'gsap';
import { Card } from './ui/Card';
import { 
    Search, Filter, MapPin, Navigation, Clock, Battery, 
    Car, User, Phone, CheckCircle2, AlertCircle, MinusCircle,
    Sun, Moon, Satellite, Crosshair, ChevronRight, Activity
} from 'lucide-react';

// --- Types ---
type MapStyle = 'dark' | 'light' | 'satellite';
type EmployeeStatus = 'Active' | 'Idle' | 'Offline';

interface EmployeeLocation {
    id: string;
    name: string;
    role: string;
    status: EmployeeStatus;
    vehicle: string;
    batteryLevel: number;
    coordinates: { lat: number; lng: number };
    lastUpdated: string;
    avatar: string;
    phone: string;
    destination?: string;
}

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

const MOCK_EMPLOYEES: EmployeeLocation[] = [
    {
        id: 'emp_001',
        name: 'Juan Dela Cruz',
        role: 'Field Technician',
        status: 'Active',
        vehicle: 'Wynx Van 01 (EV)',
        batteryLevel: 78,
        coordinates: { lat: 14.5547, lng: 121.0244 }, // Makati
        lastUpdated: 'Just now',
        avatar: 'https://i.pravatar.cc/150?u=emp_001',
        phone: '+63 917 123 4567',
        destination: 'BGC Station 2'
    },
    {
        id: 'emp_002',
        name: 'Maria Santos',
        role: 'Maintenance Crew',
        status: 'Idle',
        vehicle: 'Wynx Truck 03 (EV)',
        batteryLevel: 45,
        coordinates: { lat: 14.6516, lng: 121.0493 }, // QC
        lastUpdated: '5 mins ago',
        avatar: 'https://i.pravatar.cc/150?u=emp_002',
        phone: '+63 918 234 5678'
    },
    {
        id: 'emp_003',
        name: 'Pedro Penduko',
        role: 'Installation Specialist',
        status: 'Offline',
        vehicle: 'Wynx Van 02 (EV)',
        batteryLevel: 12,
        coordinates: { lat: 14.5353, lng: 120.9826 }, // MOA
        lastUpdated: '2 hours ago',
        avatar: 'https://i.pravatar.cc/150?u=emp_003',
        phone: '+63 919 345 6789'
    },
    {
        id: 'emp_004',
        name: 'Ana Reyes',
        role: 'Field Technician',
        status: 'Active',
        vehicle: 'Wynx Car 05 (EV)',
        batteryLevel: 92,
        coordinates: { lat: 14.5847, lng: 121.0564 }, // Ortigas
        lastUpdated: '1 min ago',
        avatar: 'https://i.pravatar.cc/150?u=emp_004',
        phone: '+63 920 456 7890',
        destination: 'Pasig Hub'
    },
    {
        id: 'emp_005',
        name: 'Carlos Mendoza',
        role: 'Emergency Response',
        status: 'Active',
        vehicle: 'Wynx SUV 01 (EV)',
        batteryLevel: 64,
        coordinates: { lat: 14.5300, lng: 121.0200 }, // Pasay
        lastUpdated: 'Just now',
        avatar: 'https://i.pravatar.cc/150?u=emp_005',
        phone: '+63 921 567 8901',
        destination: 'NAIA Terminal 3'
    }
];

export const FleetTracker: React.FC = () => {
    // Refs
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const containerRef = useRef(null);
    
    // State
    const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'All'>('All');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    // Filtered Employees
    const filteredEmployees = useMemo(() => {
        return MOCK_EMPLOYEES.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  emp.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

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

            // Initialize Layer Group for markers
            const markersLayer = L.layerGroup().addTo(map);
            markersLayerRef.current = markersLayer;

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
                markersLayerRef.current = null;
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

    // Render Markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        const layerGroup = markersLayerRef.current;
        
        if (!map || !layerGroup) return;

        layerGroup.clearLayers();

        filteredEmployees.forEach(emp => {
            const isSelected = emp.id === selectedEmployeeId;
            
            let statusColor = 'bg-slate-500';
            let pulseHtml = '';
            
            if (emp.status === 'Active') {
                statusColor = 'bg-emerald-500';
                pulseHtml = `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>`;
            } else if (emp.status === 'Idle') {
                statusColor = 'bg-amber-500';
            } else {
                statusColor = 'bg-slate-500';
            }

            const markerHtml = `
                <div class="relative flex items-center justify-center w-10 h-10 transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}">
                    ${pulseHtml}
                    <div class="relative w-10 h-10 rounded-full border-2 ${isSelected ? 'border-primary dark:border-blue-500' : 'border-white dark:border-slate-800'} shadow-lg overflow-hidden bg-white dark:bg-slate-800">
                        <img src="${emp.avatar}" alt="${emp.name}" class="w-full h-full object-cover ${emp.status === 'Offline' ? 'grayscale opacity-70' : ''}" />
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${statusColor} z-20"></div>
                </div>
            `;

            const icon = L.divIcon({
                className: 'employee-marker',
                html: markerHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker([emp.coordinates.lat, emp.coordinates.lng], { icon }).addTo(layerGroup);
            
            marker.on('click', () => {
                setSelectedEmployeeId(emp.id);
                map.flyTo([emp.coordinates.lat, emp.coordinates.lng], 15, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            });
        });

    }, [filteredEmployees, selectedEmployeeId]);

    // Handlers
    const handleEmployeeClick = (emp: EmployeeLocation) => {
        setSelectedEmployeeId(emp.id);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([emp.coordinates.lat, emp.coordinates.lng], 15, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    };

    const handleResetView = () => {
        setSelectedEmployeeId(null);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([14.5995, 120.9842], 12, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    };

    const getStatusIcon = (status: EmployeeStatus) => {
        switch (status) {
            case 'Active': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'Idle': return <AlertCircle size={14} className="text-amber-500" />;
            case 'Offline': return <MinusCircle size={14} className="text-slate-500" />;
        }
    };

    const getStatusBadge = (status: EmployeeStatus) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Idle': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'Offline': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div ref={containerRef} className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 overflow-hidden">
            
            {/* Sidebar Controls - Solid Background */}
            <div className="w-full md:w-96 flex flex-col p-0 overflow-hidden shrink-0 h-full border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b1121] shadow-lg rounded-2xl">
                
                {/* Header & Search */}
                <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b1121] space-y-4 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
                            <Activity size={20} /> Fleet Tracking
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Monitor employee vehicles in real-time.</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search employees, roles..." 
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 pl-9 text-slate-900 dark:text-white text-sm focus:border-primary dark:focus:border-blue-500 outline-none transition-colors placeholder-slate-400" 
                        />
                    </div>

                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {['All', 'Active', 'Idle', 'Offline'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                                    statusFilter === status 
                                    ? 'bg-primary dark:bg-blue-600 text-white border-primary dark:border-blue-500 shadow-md' 
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Employee List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-[#0b1121] min-h-0">
                    {filteredEmployees.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            <User size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No employees found.</p>
                        </div>
                    ) : (
                        filteredEmployees.map(emp => (
                            <div 
                                key={emp.id}
                                onClick={() => handleEmployeeClick(emp)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${
                                    selectedEmployeeId === emp.id 
                                    ? 'bg-blue-50 dark:bg-blue-600/10 border-primary/50 dark:border-blue-500/50 ring-1 ring-primary/20 dark:ring-blue-500/20' 
                                    : 'bg-white dark:bg-slate-950/30 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <img src={emp.avatar} alt={emp.name} className={`w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 ${emp.status === 'Offline' ? 'grayscale opacity-70' : ''}`} />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${emp.status === 'Active' ? 'bg-emerald-500' : emp.status === 'Idle' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className={`text-sm font-bold truncate ${selectedEmployeeId === emp.id ? 'text-primary dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                {emp.name}
                                            </h4>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold flex items-center gap-1 ${getStatusBadge(emp.status)}`}>
                                                {emp.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{emp.role}</p>
                                        
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-md">
                                                <Car size={12} className="text-slate-400" />
                                                <span className="truncate">{emp.vehicle}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-md">
                                                <Battery size={12} className={emp.batteryLevel > 20 ? 'text-emerald-500' : 'text-red-500'} />
                                                <span>{emp.batteryLevel}%</span>
                                            </div>
                                        </div>
                                        
                                        {emp.destination && emp.status === 'Active' && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary dark:text-blue-400 font-medium">
                                                <Navigation size={10} />
                                                <span className="truncate">Heading to: {emp.destination}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${selectedEmployeeId === emp.id ? 'text-primary dark:text-blue-500 translate-x-1' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Map Visualization Area */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative glass-panel shadow-2xl flex flex-col bg-white dark:bg-[#0f172a]">
                 <div ref={mapRef} className="flex-1 z-0 relative w-full h-full">
                    {/* Map container populated by Leaflet */}
                 </div>
                 
                 {/* Controls Layer - Solid Backgrounds */}
                 <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
                     <div className="bg-white dark:bg-[#0b1121] p-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col gap-1">
                        <button 
                            onClick={handleResetView}
                            className="p-2 rounded-lg flex items-center justify-center transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Reset View"
                        >
                            <Crosshair size={16} />
                        </button>
                     </div>

                     <div className="bg-white dark:bg-[#0b1121] p-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col gap-1">
                        <button 
                            onClick={() => setMapStyle('dark')}
                            className={`p-2 rounded-lg flex items-center justify-center transition-all ${mapStyle === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Dark Mode"
                        >
                            <Moon size={16} />
                        </button>
                        <button 
                            onClick={() => setMapStyle('light')}
                            className={`p-2 rounded-lg flex items-center justify-center transition-all ${mapStyle === 'light' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Light Mode"
                        >
                            <Sun size={16} />
                        </button>
                        <button 
                            onClick={() => setMapStyle('satellite')}
                            className={`p-2 rounded-lg flex items-center justify-center transition-all ${mapStyle === 'satellite' ? 'bg-primary dark:bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Satellite View"
                        >
                            <Satellite size={16} />
                        </button>
                    </div>
                 </div>
                 
                 {/* Bottom Info Bar - Selected Employee Details */}
                 {selectedEmployeeId && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4">
                        {(() => {
                            const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
                            if (!emp) return null;
                            return (
                                <div className="flex items-center gap-4">
                                    <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{emp.name}</h3>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock size={10} /> Updated {emp.lastUpdated}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{emp.role}</p>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                <Phone size={12} className="text-slate-400" /> {emp.phone}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                <MapPin size={12} className="text-slate-400" /> {emp.coordinates.lat.toFixed(4)}, {emp.coordinates.lng.toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                 )}
            </div>
        </div>
    );
};
