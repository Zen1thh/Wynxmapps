import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { MOCK_STATIONS } from '../constants';
import { Station } from '../types';
import { Battery, Zap, Edit, Trash2, Search, Map as MapIcon, LayoutGrid, Layers, Sun, Moon, Satellite, MapPin, Navigation, Crosshair, Check, X, AlertCircle, AlertTriangle, Star, AlertOctagon, Calendar, Wrench } from 'lucide-react';
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
    // Default map style logic could be improved with context, but setting to light if document is light is tricky inside component init
    const [mapStyle, setMapStyle] = useState<MapStyle>('dark'); 
    const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
    
    // Check theme for initial map style
    useEffect(() => {
        if (!document.documentElement.classList.contains('dark')) {
            setMapStyle('light');
        }
    }, []);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Edit/Delete Logic State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
    
    // Pinpoint Mode State
    const [isPinpointMode, setIsPinpointMode] = useState(false);
    const [pinpointCoords, setPinpointCoords] = useState<{lat: number, lng: number} | null>(null);
    
    // Form State
    const [newStation, setNewStation] = useState({
        name: '',
        location: '',
        status: 'Online',
        errorDetail: '',
        firstOperated: '',
        lastMaintenance: '',
        power: '',
        totalSlots: 4,
        solarOutput: 0,
        energyStored: 0,
        maxEnergyStorage: 500,
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
                Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
                markersRef.current = {};

                // Add Markers from current state
                stations.forEach(station => {
                    let markerHtml = '';
                    const baseClasses = "w-8 h-8 rounded-full border flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 backdrop-blur-sm";

                    if (station.status === 'Online') {
                        markerHtml = `<div class="${baseClasses} bg-primary/90 dark:bg-emerald-900/80 text-white dark:text-emerald-400 border-white dark:border-emerald-500 shadow-[0_0_12px_rgba(21,51,133,0.5)] ${isPinpointMode ? 'opacity-40 grayscale' : ''}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </div>`;
                    } else if (station.status === 'Maintenance') {
                        markerHtml = `<div class="${baseClasses} bg-amber-500/90 dark:bg-amber-900/80 text-white dark:text-amber-400 border-white dark:border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] ${isPinpointMode ? 'opacity-40 grayscale' : ''}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        </div>`;
                    } else if (station.status === 'Error') {
                        markerHtml = `<div class="${baseClasses} bg-rose-500/90 dark:bg-rose-900/80 text-white dark:text-rose-400 border-white dark:border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse ${isPinpointMode ? 'opacity-40 grayscale' : ''}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>`;
                    } else {
                        // Offline
                        markerHtml = `<div class="${baseClasses} bg-slate-700/90 dark:bg-red-900/80 text-white dark:text-red-400 border-white dark:border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] ${isPinpointMode ? 'opacity-40 grayscale' : ''}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                        </div>`;
                    }

                    const icon = L.divIcon({
                        className: 'custom-marker',
                        html: markerHtml,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                        popupAnchor: [0, -20]
                    });

                    // SVG Strings for Popup Icons
                    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-f6ac24 dark:text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
                    const zapIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary dark:text-blue-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
                    const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="text-f6ac24 dark:text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
                    const mapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500 dark:text-slate-400"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
                    const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
                    const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
                    const alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500 dark:text-rose-400"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
                    const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500 dark:text-slate-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
                    const wrenchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500 dark:text-slate-400"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

                    // Generate Sessions HTML
                    let sessionsHtml = '';

                    // 1. Active Sessions
                    if (station.sessions && station.sessions.length > 0) {
                        sessionsHtml += station.sessions.map(session => {
                            const plan = session.subscriptionPlan || 'Free';
                            let planClass = 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'; // Free/Basic
                            
                            if (plan === 'Supreme') planClass = 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 shadow-[0_0_6px_rgba(244,63,94,0.2)]';
                            else if (plan === 'Elite') planClass = 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 shadow-[0_0_6px_rgba(245,158,11,0.2)]';
                            else if (plan === 'Premium') planClass = 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
                            else if (plan === 'Deluxe') planClass = 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20';
                            else if (plan === 'Standard') planClass = 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
                            else if (plan === 'Basic') planClass = 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-500/20';

                            return `
                            <div class="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 mb-2 last:mb-0 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                                <div class="relative mt-0.5">
                                    <img src="${session.driverAvatar}" class="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 object-cover shadow-sm" alt="${session.driverName}" />
                                    ${['Supreme', 'Elite'].includes(plan) ? `<div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-[#0f172a] flex items-center justify-center border border-slate-200 dark:border-white/10 text-[8px] shadow-sm">👑</div>` : ''}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">${session.driverName}</span>
                                        <span class="text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${planClass}">${plan}</span>
                                    </div>
                                    
                                    <div class="flex justify-between items-center mb-1.5">
                                         <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
                                            ${session.carModel}
                                         </span>
                                         <span class="text-[10px] ${session.chargeLevel > 80 ? 'text-emerald-500 dark:text-emerald-400' : session.chargeLevel > 30 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500 dark:text-amber-400'} font-bold">${session.chargeLevel}%</span>
                                    </div>

                                    <div class="w-full bg-slate-200 dark:bg-slate-700/50 h-1.5 rounded-full mb-2 overflow-hidden">
                                        <div class="h-full ${session.chargeLevel > 80 ? 'bg-emerald-500' : session.chargeLevel > 30 ? 'bg-blue-500' : 'bg-amber-500'}" style="width: ${session.chargeLevel}%"></div>
                                    </div>
                                    
                                    <div class="flex justify-between text-[9px] text-slate-500 dark:text-slate-400">
                                        <span class="flex items-center gap-1">⚡ ${session.timeElapsed}</span>
                                        <span class="flex items-center gap-1">⏳ ${session.timeToFull}</span>
                                    </div>
                                </div>
                            </div>
                        `}).join('');
                    }

                    // 2. Available Slots (Empty User Placeholders)
                    for (let i = 0; i < station.availableSlots; i++) {
                        sessionsHtml += `
                            <div class="flex items-center gap-3 p-2 rounded-lg border border-dashed border-slate-200 dark:border-white/10 mb-2 last:mb-0 bg-slate-50/[0.5] dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                                <div class="w-9 h-9 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500">
                                    ${userIcon}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-xs font-medium text-slate-500 dark:text-slate-400">Available Slot</div>
                                    <div class="text-[10px] text-slate-400 dark:text-slate-500">Ready for connection</div>
                                </div>
                                 <div class="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/10 uppercase font-bold tracking-wider">Empty</div>
                            </div>
                        `;
                    }

                    // 3. Unavailable/Maintenance Slots
                    const occupiedCount = station.sessions ? station.sessions.length : 0;
                    const unavailableCount = Math.max(0, station.totalSlots - occupiedCount - station.availableSlots);

                    for (let i = 0; i < unavailableCount; i++) {
                        sessionsHtml += `
                            <div class="flex items-center gap-3 p-2 rounded-lg border border-dashed border-slate-200 dark:border-white/5 mb-2 last:mb-0 bg-slate-100 dark:bg-black/20 opacity-50 cursor-not-allowed">
                                <div class="w-9 h-9 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-500">
                                    ${lockIcon}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-xs font-medium text-slate-500 dark:text-slate-400">Slot Unavailable</div>
                                    <div class="text-[10px] text-slate-500 dark:text-slate-500">${station.status === 'Maintenance' ? 'Maintenance Mode' : 'System Offline'}</div>
                                </div>
                            </div>
                        `;
                    }

                    // Calculate battery percentage
                    const storagePct = station.maxEnergyStorage > 0 ? Math.min(100, Math.round((station.energyStored / station.maxEnergyStorage) * 100)) : 0;
                    const storageColor = storagePct > 50 ? 'bg-emerald-500' : storagePct > 20 ? 'bg-amber-500' : 'bg-red-500';
                    const storageTextColor = storagePct > 50 ? 'text-emerald-600 dark:text-emerald-400' : storagePct > 20 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

                    // Update popup content
                    const popupContent = `
                        <div class="min-w-[340px] max-h-[360px] overflow-y-auto overflow-x-hidden font-sans pr-2 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
                            ${station.status === 'Error' ? `
                            <div class="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-start gap-2.5">
                                <div class="mt-0.5">${alertIcon}</div>
                                <div>
                                    <div class="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">System Error</div>
                                    <div class="text-[11px] text-rose-600 dark:text-rose-200 mt-0.5 leading-snug">${station.errorDetail || 'Unknown system error detected.'}</div>
                                </div>
                            </div>
                            ` : ''}

                            <div class="flex justify-between items-start mb-3 border-b border-slate-200 dark:border-white/10 pb-3">
                                <div>
                                    <h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">${station.name}</h3>
                                    <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                       ${mapPinIcon} <span class="truncate max-w-[220px]">${station.location}</span>
                                    </div>
                                    <div class="flex flex-col gap-0.5 mt-1">
                                        ${station.firstOperated ? `
                                        <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                           ${calendarIcon} <span>Started: ${station.firstOperated}</span>
                                        </div>` : ''}
                                        ${station.lastMaintenance ? `
                                        <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                           ${wrenchIcon} <span>Maint: ${station.lastMaintenance}</span>
                                        </div>` : ''}
                                    </div>
                                </div>
                                 <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    station.status === 'Online' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 
                                    station.status === 'Maintenance' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' : 
                                    station.status === 'Error' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' :
                                    'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                }">${station.status}</span>
                            </div>
                            
                            <div class="mb-4">
                                <div class="col-span-2 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                                    <div class="flex justify-between items-center mb-1.5">
                                        <div class="flex items-center gap-1.5">
                                            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">Storage Status</span>
                                            ${storagePct < 20 ? `<span class="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>` : ''}
                                        </div>
                                        <span class="text-xs font-bold ${storageTextColor}">${storagePct}%</span>
                                    </div>
                                    <div class="w-full h-2.5 bg-slate-200 dark:bg-slate-700/40 rounded-full overflow-hidden mb-1.5 shadow-inner">
                                        <div class="h-full ${storageColor} transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.3)] relative" style="width: ${storagePct}%">
                                            <div class="absolute inset-0 bg-white/20"></div>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center text-[10px]">
                                        <span class="text-slate-700 dark:text-white font-medium flex items-center gap-1">Available: ${station.energyStored} kWh</span>
                                        <span class="text-slate-500 dark:text-slate-400">Cap: ${station.maxEnergyStorage} kWh</span>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-2 mb-4">
                                <div class="bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                    <div class="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Solar Gen</div>
                                    <div class="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                                       ${sunIcon} ${station.solarOutput}
                                    </div>
                                </div>
                                 <div class="bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                    <div class="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Max Power</div>
                                    <div class="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                                       ${zapIcon} ${station.power}
                                    </div>
                                </div>
                                 <div class="bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                    <div class="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Rating</div>
                                    <div class="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                                       ${starIcon} ${station.rating}
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-between items-center text-xs mb-2 pt-1 border-t border-slate-200 dark:border-white/5 pt-3">
                                <span class="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Live Sessions</span>
                                <span class="text-slate-700 dark:text-white font-bold bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-white/5">
                                   ${station.totalSlots - station.availableSlots}/${station.totalSlots} Slots Active
                                </span>
                            </div>

                            <div class="pb-1">
                                ${sessionsHtml}
                            </div>
                        </div>
                    `;
                    
                    const popup = L.popup({
                        maxWidth: 360,
                        minWidth: 340,
                        closeButton: false, 
                        autoPan: true,
                        autoPanPadding: [50, 50], // Increased padding
                        offset: [0, -20]
                    }).setContent(popupContent);

                    const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon })
                        .addTo(map)
                        .bindPopup(popup);

                    // Add smart center on click to show popup fully
                    marker.on('click', () => {
                        const map = mapInstanceRef.current;
                        if (map) {
                            const targetZoom = Math.max(map.getZoom(), 15);
                            const latLng = L.latLng(station.coordinates.lat, station.coordinates.lng);
                            const point = map.project(latLng, targetZoom);
                            const targetPoint = point.subtract([0, 160]); 
                            const targetCenter = map.unproject(targetPoint, targetZoom);
                            
                            map.flyTo(targetCenter, targetZoom, {
                                duration: 0.8,
                                easeLinearity: 0.25
                            });
                        }
                    });
                    
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
            const map = mapInstanceRef.current;
            const targetZoom = 16;
            
            // Calculate a new center point that places the marker in the lower half of the screen
            const latLng = L.latLng(station.coordinates.lat, station.coordinates.lng);
            
            // Project the marker's lat/lng to pixel coordinates at the target zoom level
            const point = map.project(latLng, targetZoom);
            
            // Subtract pixels from the Y coordinate to shift the view center "North"
            const targetPoint = point.subtract([0, 180]); 
            
            // Unproject back to LatLng for the flyTo method
            const targetCenter = map.unproject(targetPoint, targetZoom);

            map.flyTo(targetCenter, targetZoom, {
                duration: 1.2,
                easeLinearity: 0.25
            });

            const marker = markersRef.current[station.id];
            if (marker) {
                setTimeout(() => marker.openPopup(), 300);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            openModal();
        }
    };

    const resetForm = () => {
        setNewStation({
            name: '',
            location: '',
            status: 'Online',
            errorDetail: '',
            firstOperated: '',
            lastMaintenance: '',
            power: '',
            totalSlots: 4,
            solarOutput: 0,
            energyStored: 0,
            maxEnergyStorage: 500,
            lat: 14.5995,
            lng: 120.9842
        });
        setEditingId(null);
    };

    const openModal = (station?: Station) => {
        if (station) {
            setEditingId(station.id);
            setNewStation({
                name: station.name,
                location: station.location,
                status: station.status,
                errorDetail: station.errorDetail || '',
                firstOperated: station.firstOperated || '',
                lastMaintenance: station.lastMaintenance || '',
                power: station.power,
                totalSlots: station.totalSlots,
                solarOutput: station.solarOutput,
                energyStored: station.energyStored,
                maxEnergyStorage: station.maxEnergyStorage,
                lat: station.coordinates.lat,
                lng: station.coordinates.lng
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleDeleteClick = (station: Station) => {
        setStationToDelete(station);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (stationToDelete) {
            setStations(prev => prev.filter(s => s.id !== stationToDelete.id));
            setIsDeleteModalOpen(false);
            setStationToDelete(null);
        }
    };

    const handleSaveStation = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            // Update existing station
            setStations(prev => prev.map(s => {
                if (s.id === editingId) {
                    return {
                        ...s,
                        name: newStation.name,
                        location: newStation.location,
                        status: newStation.status as any,
                        errorDetail: newStation.status === 'Error' ? newStation.errorDetail : undefined,
                        firstOperated: newStation.firstOperated,
                        lastMaintenance: newStation.lastMaintenance,
                        power: newStation.power,
                        totalSlots: Number(newStation.totalSlots),
                        availableSlots: Math.min(s.availableSlots, Number(newStation.totalSlots)), // Adjust available if total reduced
                        solarOutput: Number(newStation.solarOutput),
                        energyStored: Number(newStation.energyStored),
                        maxEnergyStorage: Number(newStation.maxEnergyStorage),
                        coordinates: {
                            lat: Number(newStation.lat),
                            lng: Number(newStation.lng)
                        }
                    };
                }
                return s;
            }));
        } else {
            // Add new station
            const station: Station = {
                id: (Math.random() * 10000).toString(), // Simple ID generation
                name: newStation.name,
                location: newStation.location,
                status: newStation.status as any,
                errorDetail: newStation.status === 'Error' ? newStation.errorDetail : undefined,
                firstOperated: newStation.firstOperated,
                lastMaintenance: newStation.lastMaintenance,
                chargerType: 'DC Fast', // Default
                power: newStation.power || '50kW',
                rating: 5.0, // Default
                totalSlots: Number(newStation.totalSlots),
                availableSlots: Number(newStation.totalSlots),
                solarOutput: Number(newStation.solarOutput),
                energyStored: Number(newStation.energyStored),
                maxEnergyStorage: Number(newStation.maxEnergyStorage),
                coordinates: {
                    lat: Number(newStation.lat),
                    lng: Number(newStation.lng)
                }
            };
            setStations([...stations, station]);
        }
        
        setIsModalOpen(false);
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div ref={titleRef} className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Charging Stations</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and monitor all solar charging locations in Manila</p>
                </div>
                <div className="flex gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'map' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            title="Map View"
                        >
                            <MapIcon size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
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
                            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap"
                    >
                        + Add Station
                    </button>
                </div>
            </div>

            <div ref={containerRef} className="min-h-[600px]">
                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {stations.map((station) => (
                            <Card key={station.id} className="relative overflow-hidden group hover:border-primary/30 dark:hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col">
                                {/* Header Section */}
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="flex items-start gap-4">
                                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0 ${
                                            station.status === 'Online' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/20' : 
                                            station.status === 'Maintenance' ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-500/20' :
                                            station.status === 'Error' ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/20 animate-pulse' :
                                            'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20'
                                        }`}>
                                            {station.status === 'Error' ? <AlertOctagon size={24} fill="currentColor" className="text-white" /> : <Zap size={24} fill="currentColor" />}
                                        </div>
                                        <div className="min-w-0">
                                             <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors leading-tight truncate">{station.name}</h3>
                                             <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                <MapPin size={12} className="shrink-0" />
                                                <span className="truncate">{station.location}</span>
                                             </div>
                                             <div className="flex flex-col gap-1 mt-1">
                                                {station.firstOperated && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Calendar size={12} className="shrink-0" />
                                                        <span>Since {station.firstOperated}</span>
                                                    </div>
                                                )}
                                                {station.lastMaintenance && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Wrench size={12} className="shrink-0" />
                                                        <span>Maint: {station.lastMaintenance}</span>
                                                    </div>
                                                )}
                                             </div>
                                        </div>
                                    </div>
                                    
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shrink-0 ${
                                        station.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' :
                                        station.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20' :
                                        station.status === 'Error' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 animate-pulse' :
                                        'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
                                    }`}>
                                        {station.status}
                                    </span>
                                </div>
                                
                                {/* Error Alert in List View */}
                                {station.status === 'Error' && (
                                    <div className="mx-0 mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 relative z-10">
                                        <AlertOctagon className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="text-rose-500 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">System Error</h4>
                                            <p className="text-rose-600 dark:text-rose-200 text-xs mt-0.5 leading-snug">{station.errorDetail || 'Unknown system failure. Immediate attention required.'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    {/* Availability Card */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                                         <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Availability</span>
                                            <span className={`text-xs font-bold ${station.availableSlots > 0 ? 'text-primary dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>
                                                {Math.round((station.availableSlots / station.totalSlots) * 100)}%
                                            </span>
                                         </div>
                                         <div className="flex items-center gap-2 mb-2">
                                             <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                                 <div className={`h-full rounded-full ${station.availableSlots > 0 ? 'bg-primary dark:bg-blue-500' : 'bg-red-500'}`} style={{ width: `${(station.availableSlots / station.totalSlots) * 100}%`}}></div>
                                             </div>
                                         </div>
                                         <div className="flex justify-between text-xs font-medium">
                                             <span className="text-slate-900 dark:text-white flex items-center gap-1">
                                                {station.availableSlots} <span className="text-slate-500 text-[10px] uppercase font-normal">Free</span>
                                             </span>
                                             <span className="text-slate-400 flex items-center gap-1">
                                                {station.totalSlots} <span className="text-slate-600 text-[10px] uppercase font-normal">Total</span>
                                             </span>
                                         </div>
                                    </div>

                                    {/* Energy Card */}
                                     <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                                         <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Storage</span>
                                            <Battery size={12} className={station.energyStored > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-600'} />
                                         </div>
                                         <div className="flex items-baseline gap-1 mb-1">
                                             <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{station.energyStored}</span>
                                             <span className="text-xs text-slate-500">kWh</span>
                                         </div>
                                         <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(station.energyStored / station.maxEnergyStorage) * 100}%`}}></div>
                                         </div>
                                    </div>
                                </div>

                                {/* Tech Specs */}
                                <div className="flex items-center gap-3 py-3 border-t border-slate-100 dark:border-white/5 mb-4">
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                                            <Zap size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Power</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{station.power}</p>
                                        </div>
                                    </div>
                                    <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/5"></div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                                            <Sun size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Solar</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{station.solarOutput} <span className="text-[9px] font-normal text-slate-500">kWh</span></p>
                                        </div>
                                    </div>
                                     <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/5"></div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                                            <LayoutGrid size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Type</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{station.chargerType}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between mt-auto pt-1">
                                    <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg border border-yellow-500/20">
                                        <Star size={12} className="text-yellow-500 dark:text-yellow-400" fill="currentColor" />
                                        <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{station.rating}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => openModal(station)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-primary dark:hover:bg-blue-600 hover:text-white dark:hover:text-white text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-white/5 hover:border-primary dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-600/20 group/edit"
                                        >
                                            <Edit size={14} className="group-hover/edit:scale-110 transition-transform" /> Edit Station
                                        </button>
                                         <button 
                                            onClick={() => handleDeleteClick(station)}
                                            className="p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Decorational Background Gradient */}
                                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/10 dark:group-hover:bg-blue-600/20 transition-colors"></div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-[600px] rounded-2xl overflow-hidden glass-panel border border-slate-200 dark:border-white/10 flex flex-col md:flex-row relative">
                        {/* Map Area */}
                        <div className="relative flex-1 h-full order-2 md:order-1 group">
                            <div ref={mapRef} className="w-full h-full z-0 bg-slate-100 dark:bg-[#0f172a]"></div>
                            
                            {/* Map Controls - Floating Top Right */}
                            <div className="absolute top-4 right-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-1 flex border border-slate-200 dark:border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                    onClick={() => setMapStyle('dark')}
                                    className={`p-2 rounded-lg transition-all ${mapStyle === 'dark' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                    title="Dark Mode"
                                >
                                    <Moon size={16} />
                                </button>
                                <button 
                                    onClick={() => setMapStyle('light')}
                                    className={`p-2 rounded-lg transition-all ${mapStyle === 'light' ? 'bg-slate-100 text-slate-900 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                    title="Light Mode"
                                >
                                    <Sun size={16} />
                                </button>
                                <button 
                                    onClick={() => setMapStyle('satellite')}
                                    className={`p-2 rounded-lg transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                    title="Satellite View"
                                >
                                    <Satellite size={16} />
                                </button>
                                <div className="w-[1px] bg-slate-200 dark:bg-white/10 mx-1 my-1"></div>
                                <button 
                                    onClick={activatePinpointMode}
                                    className={`p-2 rounded-lg transition-all ${isPinpointMode ? 'bg-primary dark:bg-blue-600 text-white shadow-md' : 'text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/20'}`}
                                    title="Pinpoint Station Location"
                                >
                                    <MapPin size={16} />
                                </button>
                            </div>

                            {/* Pinpoint Mode Banner */}
                            {isPinpointMode && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white p-1.5 pr-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex items-center gap-3 animate-bounce-in">
                                    <div className="flex items-center gap-2 px-2">
                                        <Crosshair size={16} className="text-primary dark:text-blue-400" />
                                        <span className="text-sm font-medium">Pinpoint Location</span>
                                    </div>
                                    
                                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10"></div>
                                    
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={handlePinpointConfirm}
                                            className="flex items-center gap-1.5 pl-3 pr-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                            CONFIRM
                                        </button>
                                        <button 
                                            onClick={() => setIsPinpointMode(false)}
                                            className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl transition-all active:scale-95"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Map Overlay Stats - Floating Bottom Left (Hidden in pinpoint mode) */}
                            {!isPinpointMode && (
                                <div className="absolute bottom-4 left-4 z-[400] flex gap-2">
                                    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white hidden sm:inline">Online ({stations.filter(s => s.status === 'Online').length})</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white sm:hidden">{stations.filter(s => s.status === 'Online').length}</span>
                                    </div>
                                    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white hidden sm:inline">Maint ({stations.filter(s => s.status === 'Maintenance').length})</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white sm:hidden">{stations.filter(s => s.status === 'Maintenance').length}</span>
                                    </div>
                                    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white hidden sm:inline">Offline ({stations.filter(s => s.status === 'Offline').length})</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white sm:hidden">{stations.filter(s => s.status === 'Offline').length}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar List - Right Side */}
                        <div className="w-full md:w-80 h-48 md:h-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col order-1 md:order-2 z-10 shrink-0">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <MapPin size={16} className="text-primary dark:text-blue-500" /> Locations
                                </h3>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{stations.length} Stations</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {stations.map(station => {
                                    const storagePct = station.maxEnergyStorage > 0 ? Math.min(100, Math.round((station.energyStored / station.maxEnergyStorage) * 100)) : 0;
                                    const storageColor = storagePct > 50 ? 'bg-emerald-500' : storagePct > 20 ? 'bg-amber-500' : 'bg-red-500';
                                    const storageTextColor = storagePct > 50 ? 'text-emerald-500 dark:text-emerald-400' : storagePct > 20 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400';

                                    return (
                                        <div 
                                            key={station.id}
                                            onClick={() => handleStationSelect(station)}
                                            className={`p-3 rounded-xl bg-slate-50 dark:bg-white/5 border transition-all cursor-pointer group relative overflow-hidden ${isPinpointMode ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-100 dark:hover:bg-white/10 hover:border-primary/30 dark:hover:border-blue-500/30'} ${station.status === 'Error' ? 'border-rose-500/30' : 'border-slate-200 dark:border-white/5'}`}
                                        >
                                            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate pr-2">{station.name}</h4>
                                                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                                        station.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 
                                                        station.status === 'Maintenance' ? 'bg-amber-500' : 
                                                        station.status === 'Error' ? 'bg-rose-500 animate-pulse shadow-[0_0_5px_rgba(244,63,94,0.5)]' :
                                                        'bg-red-500'
                                                    }`}></span>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                    <MapPin size={10} className="shrink-0" />
                                                    <p className="truncate">{station.location}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mb-3">
                                                     <div className="bg-white/50 dark:bg-black/20 rounded px-2 py-1.5 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Slots</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${station.availableSlots > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                            <span className="text-[10px] font-bold text-slate-900 dark:text-white">{station.availableSlots}/{station.totalSlots}</span>
                                                        </div>
                                                     </div>
                                                     <div className="bg-white/50 dark:bg-black/20 rounded px-2 py-1.5 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                                                         <span className="text-[10px] text-slate-500 dark:text-slate-400">Power</span>
                                                         <div className="flex items-center gap-1">
                                                            <Zap size={10} className="text-yellow-500 dark:text-yellow-400" />
                                                            <span className="text-[10px] font-bold text-slate-900 dark:text-white">{station.power}</span>
                                                         </div>
                                                     </div>
                                                </div>

                                                {station.status === 'Error' && (
                                                    <div className="bg-rose-50 dark:bg-rose-500/10 rounded-lg p-2 border border-rose-200 dark:border-rose-500/20 mb-3">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <AlertOctagon size={10} className="text-rose-500 dark:text-rose-400" />
                                                            <span className="text-[9px] font-bold text-rose-600 dark:text-rose-300 uppercase tracking-wide">Error Detected</span>
                                                        </div>
                                                        <p className="text-[9px] text-rose-600 dark:text-rose-200 line-clamp-2">{station.errorDetail || 'System error'}</p>
                                                    </div>
                                                )}

                                                <div className="bg-white/50 dark:bg-white/5 rounded-lg p-2.5 border border-slate-200 dark:border-white/5">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Battery size={10} className="text-slate-400" />
                                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Storage</span>
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${storageTextColor}`}>{storagePct}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/30 rounded-full overflow-hidden mb-1.5">
                                                         <div className={`h-full ${storageColor} rounded-full transition-all duration-500`} style={{width: `${storagePct}%`}}></div>
                                                    </div>
                                                     <div className="flex justify-between items-center text-[9px]">
                                                        <span className="text-slate-900 dark:text-white font-medium">{station.energyStored} <span className="text-slate-500">kWh</span></span>
                                                        <span className="text-slate-500">Cap: {station.maxEnergyStorage}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3 right-3 pointer-events-none">
                                                     <Navigation size={12} className="text-primary dark:text-blue-400" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Station Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Station" : "Add New Station"}>
                <form onSubmit={handleSaveStation} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
                         <div className="bg-blue-100 dark:bg-blue-500/20 p-1.5 rounded-full mt-0.5">
                            <MapPin size={14} className="text-primary dark:text-blue-400" />
                         </div>
                         <div>
                             <p className="text-xs text-blue-700 dark:text-blue-300 font-medium uppercase tracking-wide mb-1">Coordinates</p>
                             <p className="text-sm text-slate-900 dark:text-white font-mono">{newStation.lat}, {newStation.lng}</p>
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Station Name</label>
                        <input 
                            required 
                            name="name" 
                            value={newStation.name} 
                            onChange={handleInputChange} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500" 
                            placeholder="e.g. Central Park Hub" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Location Address</label>
                        <input 
                            required 
                            name="location" 
                            value={newStation.location} 
                            onChange={handleInputChange} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500" 
                            placeholder="e.g. 123 Main St, Manila" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Latitude</label>
                            <input 
                                type="number" 
                                step="any"
                                required 
                                name="lat" 
                                value={newStation.lat} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Longitude</label>
                            <input 
                                type="number" 
                                step="any"
                                required 
                                name="lng" 
                                value={newStation.lng} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
                            <select 
                                name="status" 
                                value={newStation.status} 
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                            >
                                <option value="Online">Online</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Offline">Offline</option>
                                <option value="Error">Error</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Power Output</label>
                            <input 
                                name="power" 
                                value={newStation.power} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500" 
                                placeholder="e.g. 150kW" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">First Operation Date</label>
                            <input 
                                type="date"
                                name="firstOperated" 
                                value={newStation.firstOperated} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Last Maintenance Date</label>
                            <input 
                                type="date"
                                name="lastMaintenance" 
                                value={newStation.lastMaintenance} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Error Detail Input - Conditional */}
                    {newStation.status === 'Error' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                             <label className="block text-sm font-medium text-rose-500 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                                <AlertOctagon size={14} /> Error Description
                             </label>
                            <textarea
                                required
                                name="errorDetail"
                                value={newStation.errorDetail}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-rose-500/30 focus:border-rose-500 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 min-h-[80px]"
                                placeholder="Describe the error code or technical issue..."
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Slots</label>
                            <input 
                                type="number"
                                min="1"
                                name="totalSlots" 
                                value={newStation.totalSlots} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Solar Output (kWh)</label>
                            <input 
                                type="number"
                                min="0"
                                name="solarOutput" 
                                value={newStation.solarOutput} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                    </div>
                     
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Energy Stored (kWh)</label>
                            <input 
                                type="number"
                                min="0"
                                name="energyStored" 
                                value={newStation.energyStored} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Max Capacity (kWh)</label>
                            <input 
                                type="number"
                                min="0"
                                name="maxEnergyStorage" 
                                value={newStation.maxEnergyStorage} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                        >
                            {editingId ? "Save Changes" : "Add Station"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Station">
                <div className="space-y-4">
                    {stationToDelete?.status === 'Online' && (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">Critical Warning</h4>
                                <p className="text-sm text-red-600 dark:text-red-200 mt-1">
                                    This station is currently <strong>Online</strong>. Deleting it may disrupt active user sessions and bookings.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <p className="text-slate-600 dark:text-slate-300">
                        Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{stationToDelete?.name}</strong>? 
                        This action cannot be undone.
                    </p>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)} 
                            className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Delete Station
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};