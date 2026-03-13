

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
    role: 'Super Admin' | 'Admin' | 'Finance Admin' | 'Customer Support' | 'Subscriber' | 'User';
    status: 'Active' | 'Inactive' | 'Suspended';
    isOnline?: boolean;
    subscriptionPlan?: 'Free' | 'Basic' | 'Standard' | 'Deluxe' | 'Premium' | 'Elite' | 'Supreme';
    avatar?: string;
    lastLogin: string;
    joinDate: string;
    phoneNumber?: string;
}

export interface Vehicle {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerAvatar?: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    vin: string;
    batteryLevel: number; // %
    batteryCapacity: number; // kWh
    range: number; // estimated km
    status: 'Active' | 'Charging' | 'Maintenance' | 'Offline';
    lastSync: string;
    imageUrl?: string;
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
    VEHICLES = 'VEHICLES',
    SUBSCRIPTIONS = 'SUBSCRIPTIONS',
    WYNX_AI = 'WYNX_AI',
    ASSET_TRACKER = 'ASSET_TRACKER',
    SUPPORT = 'SUPPORT',
    REVIEWS = 'REVIEWS',
    LOGS = 'LOGS',
    SETTINGS = 'SETTINGS'
}

export type PlanTier = 'Free' | 'Basic' | 'Standard' | 'Deluxe' | 'Premium' | 'Elite' | 'Supreme' | string;
export type PlanStatus = 'Active' | 'Disabled' | 'Archived';

export interface SubscriptionPlan {
    id: string;
    name: PlanTier;
    price: number;      // Monthly price
    yearlyPrice: number; // Yearly price
    yearlySavingsText?: string; // Custom text for savings badge
    kwhAllowance: number;
    period: string;
    activeUsers: number;
    features: string[];
    color: string;
    accentColor: string;
    icon: any; // React.ReactNode
    isPopular?: boolean;
    tag?: string; // Custom tag text (e.g. "Most Popular", "Best Value")
    status: PlanStatus; 
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'Active' | 'Idle' | 'Offline' | 'On Break';
    currentLocation: {
        lat: number;
        lng: number;
        address: string;
    };
    vehicle?: {
        model: string;
        licensePlate: string;
        batteryLevel: number;
        speed: number; // km/h
        heading: number; // degrees
    };
    lastUpdate: string;
    shiftStart: string;
    shiftEnd: string;
    routeProgress?: number; // percentage
}