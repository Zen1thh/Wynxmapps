

export interface StationSession {
    driverName: string;
    driverAvatar: string;
    carModel: string;
    chargeLevel: number; // percentage
    timeElapsed: string;
    timeToFull: string;
    subscriptionPlan?: 'Free' | 'Basic' | 'Standard' | 'Deluxe' | 'Premium' | 'Elite' | 'Supreme';
}

export interface Station {
    id: string;
    name: string;
    location: string;
    status: 'Online' | 'Offline' | 'Maintenance' | 'Error';
    errorDetail?: string; // Specific error message/code
    firstOperated?: string; // Date string YYYY-MM-DD
    lastMaintenance?: string; // Date string YYYY-MM-DD
    chargerType: string;
    power: string;
    rating: number;
    totalSlots: number;
    availableSlots: number;
    solarOutput: number; // in kWh
    energyStored: number; // in kWh
    maxEnergyStorage: number; // in kWh (Capacity)
    coordinates: {
        lat: number;
        lng: number;
    };
    sessions?: StationSession[];
}

export interface Booking {
    id: string;
    userId: string;
    stationId: string;
    stationName: string;
    date: string;
    time: string;
    status: 'Completed' | 'Pending' | 'Cancelled' | 'Active';
    amount: number;
    // Extended properties for detailed view logic
    vehicle?: string;
    duration?: string;
    energyConsumed?: number; // kWh
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Super Admin' | 'Admin' | 'Subscriber' | 'User';
    status: 'Active' | 'Inactive' | 'Suspended';
    subscriptionPlan?: 'Free' | 'Basic' | 'Standard' | 'Deluxe' | 'Premium' | 'Elite' | 'Supreme';
    avatar?: string;
    lastLogin: string;
    joinDate: string;
    phoneNumber?: string;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    stationId: string;
    stationName: string;
    rating: number;
    comment: string;
    date: string;
    status: 'Published' | 'Flagged' | 'Hidden';
}

export interface ChartData {
    name: string;
    value: number;
    value2?: number;
}

export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    STATIONS = 'STATIONS',
    BOOKINGS = 'BOOKINGS',
    USERS = 'USERS',
    SUBSCRIPTIONS = 'SUBSCRIPTIONS',
    WYNX_AI = 'WYNX_AI',
    MAP_ROUTES = 'MAP_ROUTES',
    SUPPORT = 'SUPPORT',
    REVIEWS = 'REVIEWS',
    SETTINGS = 'SETTINGS'
}