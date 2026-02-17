
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { MOCK_VEHICLES, MOCK_USERS } from '../constants';
import { Vehicle } from '../types';
import gsap from 'gsap';
import { 
    Car, Plus, Search, Battery, BatteryCharging, 
    MoreHorizontal, Edit2, Trash2, Zap, AlertTriangle, 
    CheckCircle2, WifiOff, Clock, ShieldCheck
} from 'lucide-react';

const Toast: React.FC<{ message: string; type: 'success' | 'loading'; onClose?: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        if (type === 'success') {
            const timer = setTimeout(() => onClose && onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [type, onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${
                type === 'loading' 
                ? 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/20 text-primary dark:text-blue-200' 
                : 'bg-emerald-50/90 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-200'
            }`}>
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    subText?: string;
}> = ({ label, value, icon, color, subText }) => (
    <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 dark:opacity-10 blur-xl ${color}`}></div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-white shadow-lg`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                {subText && <p className="text-xs text-slate-500 mt-1">{subText}</p>}
            </div>
        </div>
    </div>
);

export const Vehicles: React.FC = () => {
    const containerRef = useRef(null);
    const tableRef = useRef(null);
    
    // Data State
    const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Selection State
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

    // Toast
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'loading' } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        ownerId: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        licensePlate: '',
        vin: '',
        batteryCapacity: 60,
        status: 'Active'
    });

    // Stats Logic - Updated to remove telemetry dependency
    const stats = useMemo(() => ({
        total: vehicles.length,
        active: vehicles.filter(v => v.status === 'Active').length,
        maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
        offline: vehicles.filter(v => v.status === 'Offline').length
    }), [vehicles]);

    // Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".stagger-card", 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
            gsap.fromTo(tableRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Dropdown handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter Logic
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            const matchesSearch = 
                vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
                vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = filterStatus === 'All' || vehicle.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [vehicles, searchQuery, filterStatus]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const owner = MOCK_USERS.find(u => u.id === formData.ownerId);
        
        const newVehicle: Vehicle = {
            id: `vh_${Date.now()}`,
            ownerId: formData.ownerId,
            ownerName: owner?.name || 'Unknown',
            ownerAvatar: owner?.avatar,
            make: formData.make,
            model: formData.model,
            year: Number(formData.year),
            color: formData.color,
            licensePlate: formData.licensePlate,
            vin: formData.vin,
            batteryLevel: 0, // Not used
            batteryCapacity: Number(formData.batteryCapacity),
            range: 0, // Not used
            status: formData.status as any,
            lastSync: new Date().toISOString()
        };

        setVehicles(prev => [newVehicle, ...prev]);
        setIsAddModalOpen(false);
        setToast({ message: 'Vehicle registered successfully', type: 'success' });
        
        // Reset form
        setFormData({
            ownerId: '',
            make: '',
            model: '',
            year: new Date().getFullYear(),
            color: '',
            licensePlate: '',
            vin: '',
            batteryCapacity: 60,
            status: 'Active'
        });
    };

    const handleDeleteClick = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setIsDeleteModalOpen(true);
        setActiveDropdownId(null);
    };

    const confirmDelete = () => {
        if (vehicleToDelete) {
            setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
            setIsDeleteModalOpen(false);
            setVehicleToDelete(null);
            setToast({ message: 'Vehicle removed from fleet', type: 'success' });
        }
    };

    const handleEditClick = (vehicle: Vehicle) => {
        setVehicleToEdit(vehicle);
        setFormData({
            ownerId: vehicle.ownerId,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            licensePlate: vehicle.licensePlate,
            vin: vehicle.vin,
            batteryCapacity: vehicle.batteryCapacity,
            status: vehicle.status
        });
        setIsEditModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicleToEdit) return;

        setVehicles(prev => prev.map(v => 
            v.id === vehicleToEdit.id 
                ? { ...v, ...formData, year: Number(formData.year), batteryCapacity: Number(formData.batteryCapacity) } 
                : v
        ));
        
        setIsEditModalOpen(false);
        setVehicleToEdit(null);
        setToast({ message: 'Vehicle details updated', type: 'success' });
    };

    return (
        <div ref={containerRef} className="space-y-6 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Fleet Registry</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Manage registered electric vehicles and owner credentials.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-2 active:scale-95"
                >
                    <Plus size={18} /> Register Vehicle
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stagger-card">
                    <StatCard 
                        label="Total Registered" 
                        value={stats.total.toLocaleString()} 
                        icon={<Car size={20} />} 
                        color="bg-primary dark:bg-blue-500" 
                    />
                </div>
                <div className="stagger-card">
                    <StatCard 
                        label="Active Status" 
                        value={stats.active.toLocaleString()} 
                        subText={`${Math.round((stats.active/stats.total)*100 || 0)}% of fleet`}
                        icon={<CheckCircle2 size={20} />} 
                        color="bg-emerald-500" 
                    />
                </div>
                <div className="stagger-card">
                    <StatCard 
                        label="In Maintenance" 
                        value={stats.maintenance.toString()} 
                        icon={<AlertTriangle size={20} />} 
                        color="bg-amber-500" 
                    />
                </div>
                <div className="stagger-card">
                    <StatCard 
                        label="Offline / Inactive" 
                        value={stats.offline.toString()} 
                        icon={<WifiOff size={20} />} 
                        color="bg-slate-500" 
                    />
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 p-4 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 backdrop-blur-md">
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-950/50 p-1 rounded-lg border border-slate-200 dark:border-white/5">
                    {['All', 'Active', 'Offline', 'Maintenance'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                filterStatus === status 
                                ? 'bg-primary dark:bg-blue-600 text-white shadow-lg' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search model, plate, or owner..." 
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                </div>
            </div>

            {/* Main Table */}
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-white/5" ref={tableRef}>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs uppercase bg-slate-50/90 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 backdrop-blur-sm border-b border-slate-200 dark:border-white/5 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Vehicle Details</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Owner</th>
                                <th className="px-6 py-4 font-bold tracking-wider">System Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Spec Capacity</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Registered Date</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                                                    {vehicle.make} {vehicle.model}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs mt-1">
                                                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-mono border border-slate-300 dark:border-slate-700">
                                                        {vehicle.licensePlate}
                                                    </span>
                                                    <span className="text-slate-400">• {vehicle.year} • {vehicle.color}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-0.5 font-mono">VIN: {vehicle.vin}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={vehicle.ownerAvatar || `https://i.pravatar.cc/150?u=${vehicle.ownerId}`} 
                                                    alt="Owner" 
                                                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-slate-700 dark:text-slate-200 text-xs font-bold">{vehicle.ownerName}</span>
                                                    <span className="text-[10px] text-slate-500">ID: {vehicle.ownerId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                vehicle.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                                vehicle.status === 'Charging' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                vehicle.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                                                'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                                            }`}>
                                                {vehicle.status === 'Active' && <CheckCircle2 size={12} />}
                                                {vehicle.status === 'Charging' && <Zap size={12} />}
                                                {vehicle.status === 'Maintenance' && <AlertTriangle size={12} />}
                                                {vehicle.status === 'Offline' && <WifiOff size={12} />}
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400">
                                                    <Battery size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {vehicle.batteryCapacity} kWh
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
                                                <Clock size={12} /> 
                                                {new Date(vehicle.lastSync).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button 
                                                    data-dropdown-trigger
                                                    onClick={() => setActiveDropdownId(activeDropdownId === vehicle.id ? null : vehicle.id)}
                                                    className={`p-2 rounded-lg transition-colors ${activeDropdownId === vehicle.id ? 'bg-slate-100 dark:bg-white/10 text-primary dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-primary dark:hover:text-white'}`}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {activeDropdownId === vehicle.id && (
                                                    <div 
                                                        data-dropdown-menu
                                                        className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        <div className="py-1">
                                                            <button 
                                                                onClick={() => handleEditClick(vehicle)}
                                                                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                                                            >
                                                                <Edit2 size={14} /> Edit Details
                                                            </button>
                                                            <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-1"></div>
                                                            <button 
                                                                onClick={() => handleDeleteClick(vehicle)}
                                                                className="w-full text-left px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Deregister
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Car size={32} className="opacity-20" />
                                            <p>No vehicles found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Vehicle Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Vehicle">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
                         <div className="bg-blue-100 dark:bg-blue-500/20 p-1.5 rounded-full mt-0.5">
                            <ShieldCheck size={14} className="text-primary dark:text-blue-400" />
                         </div>
                         <div>
                             <p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wide mb-1">Credential Registry</p>
                             <p className="text-xs text-slate-600 dark:text-slate-300">Enter vehicle specifications as they appear on registration documents.</p>
                         </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Owner</label>
                        <select 
                            name="ownerId" 
                            value={formData.ownerId}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none"
                        >
                            <option value="">Select User</option>
                            {MOCK_USERS.map(user => (
                                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Make</label>
                            <input required type="text" name="make" value={formData.make} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" placeholder="e.g. Tesla" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Model</label>
                            <input required type="text" name="model" value={formData.model} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" placeholder="e.g. Model 3" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Year</label>
                            <input required type="number" name="year" value={formData.year} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Color</label>
                            <input required type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" placeholder="e.g. White" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">License Plate</label>
                            <input required type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none font-mono uppercase" placeholder="ABC 123" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">VIN</label>
                            <input required type="text" name="vin" value={formData.vin} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none font-mono uppercase" placeholder="17-char VIN" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Battery Capacity (kWh)</label>
                        <input required type="number" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" />
                        <p className="text-[10px] text-slate-500">Static capacity specification for reference.</p>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-white/5 mt-2">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-bold transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all">Register</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Vehicle Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Vehicle Details">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {/* Simplified Edit Form - similar to Add but prefilled */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Make</label>
                            <input required type="text" name="make" value={formData.make} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Model</label>
                            <input required type="text" name="model" value={formData.model} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                <option value="Active">Active</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Offline">Offline</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Battery Capacity (kWh)</label>
                            <input required type="number" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-white/5 mt-2">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-bold transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Deregister Vehicle">
                <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">Warning</h4>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                Are you sure you want to deregister <strong className="text-slate-900 dark:text-white">{vehicleToDelete?.make} {vehicleToDelete?.model}</strong>? 
                                This will remove it from the system and disconnect it from the user account.
                            </p>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5 mt-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">Cancel</button>
                        <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
                            <Trash2 size={16} /> Deregister
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
