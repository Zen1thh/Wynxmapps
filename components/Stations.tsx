import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { MOCK_STATIONS } from '../constants';
import { Station } from '../types';
import { Battery, Zap, Edit, Trash2, Search, Map as MapIcon, LayoutGrid, Layers, Sun, Moon, Satellite, MapPin, Navigation, Crosshair, Check, X, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import L from 'leaflet';

type MapStyle = 'dark' | 'light' | 'satellite';

const MAP_STYLES = {
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        textColor: 'text-white'
    },
    light: {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        textColor: 'text-slate-900'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        textColor: 'text-white'
    }
};

export const Stations: React.FC = () => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
    const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
    const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Pinpoint Mode State
    const [isPinpointMode, setIsPinpointMode] = useState(false);
    const [pinpointCoords, setPinpointCoords] = useState<{lat: number, lng: number} | null>(null);
    
    // Form State
    const [newStation, setNewStation] = useState({
        name: '',
        location: '',
        status: 'Online',
        power: '',
        totalSlots: 4,
        solarOutput: 0,
        lat: 14.5995,
        lng: 120.9842
    });

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<{[key: string]: L.Marker}>({});
    const pinpointMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        gsap.fromTo(titleRef.current, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5 });
    }, []);

    useEffect(() => {
        // Animate container entrance when view mode changes
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, 
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }

        // Initialize Map if in map mode
        if (viewMode === 'map' && mapRef.current) {
             // Delay map init slightly to let container render
             setTimeout(() => {
                if (!mapRef.current) return;
                
                // If map already exists, just invalidate size
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                } else {
                    // Initialize map centered on Manila
                    const map = L.map(mapRef.current).setView([14.5995, 120.9842], 12);
                    mapInstanceRef.current = map;
                    addTileLayer(map, mapStyle);
                }

                const map = mapInstanceRef.current;

                // Clear existing markers (standard station markers)
                Object.values(markersRef.current).forEach(marker => marker.remove());
                markersRef.current = {};

                // Add Markers from current state
                stations.forEach(station => {
                    const statusColor = station.status === 'Online' ? 'bg-emerald-500' : 
                                      station.status === 'Maintenance' ? 'bg-amber-500' : 'bg-red-500';
                    const glowColor = station.status === 'Online' ? 'shadow-emerald-500/50' : 
                                    station.status === 'Maintenance' ? 'shadow-amber-500/50' : 'shadow-red-500/50';

                    const icon = L.divIcon({
                        className: 'custom-marker',
                        html: `<div class="${statusColor} w-4 h-4 rounded-full border-2 border-white shadow-lg ${glowColor} transform hover:scale-125 transition-transform duration-200 ${isPinpointMode ? 'opacity-40 grayscale' : ''}"></div>`,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                        popupAnchor: [0, -10]
                    });

                    const popupContent = `
                        <div class="p-2 min-w-[150px]">
                            <h3 class="font-bold text-sm mb-1">${station.name}</h3>
                            <div class="text-xs text-slate-300 mb-2">${station.location}</div>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                station.status === 'Online' ? 'bg-emerald-500/20 text-emerald-400' : 
                                station.status === 'Maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                            }">${station.status}</span>
                            <div class="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                <span class="font-semibold text-white">${station.availableSlots}/${station.totalSlots}</span> Slots Available
                            </div>
                        </div>
                    `;
                    
                    const tooltip = L.tooltip({
                        permanent: false,
                        direction: 'top',
                        className: 'custom-tooltip',
                        offset: [0, -12],
                        opacity: 1
                    }).setContent(popupContent);

                    const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon })
                        .addTo(map)
                        .bindPopup(popupContent)
                        .bindTooltip(tooltip);
                    
                    markersRef.current[station.id] = marker;
                });
             }, 100);
        }

        return () => {
            if (viewMode !== 'map' && mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                tileLayerRef.current = null;
                markersRef.current = {};
            }
        };
    }, [viewMode, stations, isPinpointMode]);

    // Pinpoint Mode Effect
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (isPinpointMode) {
            // Create draggable marker at center
            const center = map.getCenter();
            
            const createPinIcon = () => L.divIcon({
                className: 'pinpoint-marker',
                html: `<div class="relative transition-colors duration-300">
                        <div class="absolute -top-[32px] -left-[16px] w-8 h-8 text-blue-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
                        </div>
                        <div class="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                       </div>`,
                iconSize: [0, 0], // Handled by HTML
                iconAnchor: [0, 0]
            });

            setPinpointCoords({ lat: center.lat, lng: center.lng });

            const marker = L.marker(center, { 
                icon: createPinIcon(), 
                draggable: true,
                zIndexOffset: 1000 // Always on top
            }).addTo(map);

            marker.on('dragend', (e) => {
                const latLng = e.target.getLatLng();
                setPinpointCoords({ lat: latLng.lat, lng: latLng.lng });
            });

            pinpointMarkerRef.current = marker;

            // Close existing popups
            map.closePopup();

        } else {
            // Cleanup
            if (pinpointMarkerRef.current) {
                pinpointMarkerRef.current.remove();
                pinpointMarkerRef.current = null;
            }
            setPinpointCoords(null);
        }

        return () => {
            if (pinpointMarkerRef.current) {
                pinpointMarkerRef.current.remove();
                pinpointMarkerRef.current = null;
            }
        };
    }, [isPinpointMode]);

    // Separate effect for Map Style changes
    useEffect(() => {
        if (mapInstanceRef.current) {
            addTileLayer(mapInstanceRef.current, mapStyle);
        }
    }, [mapStyle]);

    const addTileLayer = (map: L.Map, style: MapStyle) => {
        if (tileLayerRef.current) {
            tileLayerRef.current.remove();
        }
        
        const config = MAP_STYLES[style];
        const layer = L.tileLayer(config.url, {
            attribution: config.attribution,
            subdomains: 'abcd',
            maxZoom: 19
        });
        
        layer.addTo(map);
        tileLayerRef.current = layer;
    };

    const handleStationSelect = (station: Station) => {
        if (isPinpointMode) return; // Disable selection in pinpoint mode

        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([station.coordinates.lat, station.coordinates.lng], 16, {
                duration: 1.2,
                easeLinearity: 0.25
            });
            const marker = markersRef.current[station.id];
            if (marker) {
                setTimeout(() => marker.openPopup(), 400);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewStation(prev => ({ ...prev, [name]: value }));
    };

    const activatePinpointMode = () => {
        setIsPinpointMode(true);
        setViewMode('map');
    };

    const handlePinpointConfirm = () => {
        if (pinpointCoords) {
            setNewStation(prev => ({
                ...prev,
                lat: Number(pinpointCoords.lat.toFixed(6)),
                lng: Number(pinpointCoords.lng.toFixed(6))
            }));
            setIsPinpointMode(false);
            setIsModalOpen(true);
        }
    };

    const handleAddStation = (e: React.FormEvent) => {
        e.preventDefault();
        const station: Station = {
            id: (stations.length + 1).toString(),
            name: newStation.name,
            location: newStation.location,
            status: newStation.status as any,
            chargerType: 'DC Fast', // Default for now
            power: newStation.power || '50kW',
            rating: 5.0, // Default rating for new station
            totalSlots: Number(newStation.totalSlots),
            availableSlots: Number(newStation.totalSlots), // All slots available initially
            solarOutput: Number(newStation.solarOutput),
            coordinates: {
                lat: Number(newStation.lat),
                lng: Number(newStation.lng)
            }
        };
        
        setStations([...stations, station]);
        setIsModalOpen(false);
        
        // Reset form
        setNewStation({
            name: '',
            location: '',
            status: 'Online',
            power: '',
            totalSlots: 4,
            solarOutput: 0,
            lat: 14.5995,
            lng: 120.9842
        });
    };

    return (
        <div className="space-y-6">
            <div ref={titleRef} className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Charging Stations</h2>
                    <p className="text-slate-400 text-sm">Manage and monitor all solar charging locations in Manila</p>
                </div>
                <div className="flex gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            title="Map View"
                        >
                            <MapIcon size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            title="List View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search stations..." 
                            className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 placeholder-slate-500"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap"
                    >
                        + Add Station
                    </button>
                </div>
            </div>

            <div ref={containerRef} className="min-h-[600px]">
                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {stations.map((station) => (
                            <Card key={station.id} className="relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                        station.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        station.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {station.status}
                                    </span>
                                </div>
                                
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                        <Zap size={24} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{station.name}</h3>
                                        <p className="text-sm text-slate-400">{station.location}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                            <Battery size={14} /> Power
                                        </div>
                                        <p className="text-white font-semibold">{station.power}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                            <Zap size={14} /> Solar Output
                                        </div>
                                        <p className="text-white font-semibold">{station.solarOutput} kWh</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <div className="text-sm">
                                        <span className="text-slate-400">Rating: </span>
                                        <span className="text-yellow-400 font-bold">{station.rating} ★</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-[600px] rounded-2xl overflow-hidden glass-panel border border-white/10 flex flex-col md:flex-row relative">
                        {/* Map Area */}
                        <div className="relative flex-1 h-full order-2 md:order-1 group">
                            <div ref={mapRef} className="w-full h-full z-0" style={{ background: '#0f172a' }}></div>
                            
                            {/* Map Controls - Floating Top Right */}
                            <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md rounded-xl p-1 flex border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                    onClick={() => setMapStyle('dark')}
                                    className={`p-2 rounded-lg transition-all ${mapStyle === 'dark' ? 'bg-slate-700 text-blue-400 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    title="Dark Mode"
                                >
                                    <Moon size={16} />
                                </button>
                                <button 
                                    onClick={() => setMapStyle('light')}
                                    className={`p-2 rounded-lg transition-all ${mapStyle === 'light' ? 'bg-slate-200 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    title="Light Mode"
                                >
                                    <Sun size={16} />
                                </button>
                                <button 
                                    onClick={() => setMapStyle('satellite')}
                                    className={`p-2 rounded-lg transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    title="Satellite View"
                                >
                                    <Satellite size={16} />
                                </button>
                                <div className="w-[1px] bg-white/10 mx-1 my-1"></div>
                                <button 
                                    onClick={activatePinpointMode}
                                    className={`p-2 rounded-lg transition-all ${isPinpointMode ? 'bg-blue-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20'}`}
                                    title="Pinpoint Station Location"
                                >
                                    <MapPin size={16} />
                                </button>
                            </div>

                            {/* Pinpoint Mode Banner */}
                            {isPinpointMode && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md text-white p-1.5 pr-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-bounce-in">
                                    <div className="flex items-center gap-2 px-2">
                                        <Crosshair size={16} className="text-blue-400" />
                                        <span className="text-sm font-medium">Pinpoint Location</span>
                                    </div>
                                    
                                    <div className="h-6 w-[1px] bg-white/10"></div>
                                    
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={handlePinpointConfirm}
                                            className="flex items-center gap-1.5 pl-3 pr-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                            CONFIRM
                                        </button>
                                        <button 
                                            onClick={() => setIsPinpointMode(false)}
                                            className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white p-1.5 rounded-xl transition-all active:scale-95"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Map Overlay Stats - Floating Bottom Left (Hidden in pinpoint mode) */}
                            {!isPinpointMode && (
                                <div className="absolute bottom-4 left-4 z-[400] flex gap-2">
                                    <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-xs font-bold text-white hidden sm:inline">Online ({stations.filter(s => s.status === 'Online').length})</span>
                                        <span className="text-xs font-bold text-white sm:hidden">{stations.filter(s => s.status === 'Online').length}</span>
                                    </div>
                                    <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                        <span className="text-xs font-bold text-white hidden sm:inline">Maint ({stations.filter(s => s.status === 'Maintenance').length})</span>
                                        <span className="text-xs font-bold text-white sm:hidden">{stations.filter(s => s.status === 'Maintenance').length}</span>
                                    </div>
                                    <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                        <span className="text-xs font-bold text-white hidden sm:inline">Offline ({stations.filter(s => s.status === 'Offline').length})</span>
                                        <span className="text-xs font-bold text-white sm:hidden">{stations.filter(s => s.status === 'Offline').length}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar List - Right Side */}
                        <div className="w-full md:w-80 h-48 md:h-full border-t md:border-t-0 md:border-l border-white/10 bg-slate-900/95 backdrop-blur-xl flex flex-col order-1 md:order-2 z-10 shrink-0">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-500" /> Locations
                                </h3>
                                <span className="text-xs text-slate-400">{stations.length} Stations</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {stations.map(station => (
                                    <div 
                                        key={station.id}
                                        onClick={() => handleStationSelect(station)}
                                        className={`p-3 rounded-xl bg-white/5 border border-white/5 transition-all cursor-pointer group relative overflow-hidden ${isPinpointMode ? 'opacity-50 pointer-events-none' : 'hover:bg-white/10 hover:border-blue-500/30'}`}
                                    >
                                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate pr-2">{station.name}</h4>
                                                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                                    station.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 
                                                    station.status === 'Maintenance' ? 'bg-amber-500' : 'bg-red-500'
                                                }`}></span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate mb-2">{station.location}</p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1 text-slate-300 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                                                    <Zap size={10} className="text-yellow-400" /> {station.power}
                                                </span>
                                                <button className="text-blue-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    <Navigation size={10} /> Locate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Station Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Station">
                <form onSubmit={handleAddStation} className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
                         <div className="bg-blue-500/20 p-1.5 rounded-full mt-0.5">
                            <MapPin size={14} className="text-blue-400" />
                         </div>
                         <div>
                             <p className="text-xs text-blue-300 font-medium uppercase tracking-wide mb-1">Coordinates Selected</p>
                             <p className="text-sm text-white font-mono">{newStation.lat}, {newStation.lng}</p>
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Station Name</label>
                        <input 
                            required 
                            name="name" 
                            value={newStation.name} 
                            onChange={handleInputChange} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-500" 
                            placeholder="e.g. Central Park Hub" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Location Address</label>
                        <input 
                            required 
                            name="location" 
                            value={newStation.location} 
                            onChange={handleInputChange} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-500" 
                            placeholder="e.g. 123 Main St, Manila" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Latitude</label>
                            <input 
                                type="number" 
                                step="any"
                                required 
                                name="lat" 
                                value={newStation.lat} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Longitude</label>
                            <input 
                                type="number" 
                                step="any"
                                required 
                                name="lng" 
                                value={newStation.lng} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                            <select 
                                name="status" 
                                value={newStation.status} 
                                onChange={handleInputChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                            >
                                <option value="Online">Online</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Offline">Offline</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Power Output</label>
                            <input 
                                name="power" 
                                value={newStation.power} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-500" 
                                placeholder="e.g. 150kW" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Total Slots</label>
                            <input 
                                type="number"
                                min="1"
                                name="totalSlots" 
                                value={newStation.totalSlots} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Solar Output (kWh)</label>
                            <input 
                                type="number"
                                min="0"
                                name="solarOutput" 
                                value={newStation.solarOutput} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Add Station
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};