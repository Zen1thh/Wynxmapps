
import { Station, Booking, User, ChartData, Review } from './types';

// Helper for dynamic dates
const getDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const MOCK_STATIONS: Station[] = [
    { 
        id: '1', 
        name: 'Ayala Triangle Gardens', 
        location: 'Paseo de Roxas, Makati, Metro Manila', 
        status: 'Online', 
        chargerType: 'DC Fast', 
        power: '150kW', 
        rating: 4.8, 
        totalSlots: 8, 
        availableSlots: 3, 
        solarOutput: 450,
        energyStored: 320,
        maxEnergyStorage: 500,
        coordinates: { lat: 14.5547, lng: 121.0244 },
        sessions: [
            { driverName: 'Marco P.', driverAvatar: 'https://i.pravatar.cc/150?img=11', carModel: 'Tesla Model 3', chargeLevel: 78, timeElapsed: '45m', timeToFull: '20m', subscriptionPlan: 'Elite' },
            { driverName: 'Sarah L.', driverAvatar: 'https://i.pravatar.cc/150?img=5', carModel: 'Hyundai Ioniq 5', chargeLevel: 45, timeElapsed: '15m', timeToFull: '55m', subscriptionPlan: 'Premium' },
            { driverName: 'Miguel R.', driverAvatar: 'https://i.pravatar.cc/150?img=3', carModel: 'Nissan Leaf', chargeLevel: 92, timeElapsed: '1h 10m', timeToFull: '5m', subscriptionPlan: 'Standard' },
            { driverName: 'Anna K.', driverAvatar: 'https://i.pravatar.cc/150?img=9', carModel: 'Kia EV6', chargeLevel: 25, timeElapsed: '10m', timeToFull: '1h 05m', subscriptionPlan: 'Basic' },
            { driverName: 'John D.', driverAvatar: 'https://i.pravatar.cc/150?img=13', carModel: 'BYD Atto 3', chargeLevel: 60, timeElapsed: '30m', timeToFull: '40m', subscriptionPlan: 'Free' }
        ]
    },
    { 
        id: '2', 
        name: 'BGC High Street', 
        location: 'Taguig, Metro Manila', 
        status: 'Online', 
        chargerType: 'Level 2', 
        power: '22kW', 
        rating: 4.5, 
        totalSlots: 12, 
        availableSlots: 8, 
        solarOutput: 320,
        energyStored: 210,
        maxEnergyStorage: 600,
        coordinates: { lat: 14.5509, lng: 121.0503 },
        sessions: [
            { driverName: 'Jessica T.', driverAvatar: 'https://i.pravatar.cc/150?img=24', carModel: 'Porsche Taycan', chargeLevel: 88, timeElapsed: '2h 15m', timeToFull: '25m', subscriptionPlan: 'Supreme' },
            { driverName: 'Robert Y.', driverAvatar: 'https://i.pravatar.cc/150?img=68', carModel: 'Audi e-tron', chargeLevel: 34, timeElapsed: '1h 00m', timeToFull: '4h 20m', subscriptionPlan: 'Deluxe' },
            { driverName: 'Lisa M.', driverAvatar: 'https://i.pravatar.cc/150?img=44', carModel: 'BMW iX', chargeLevel: 55, timeElapsed: '2h 30m', timeToFull: '3h 10m', subscriptionPlan: 'Premium' },
            { driverName: 'Kevin B.', driverAvatar: 'https://i.pravatar.cc/150?img=53', carModel: 'Jaguar I-PACE', chargeLevel: 70, timeElapsed: '3h 10m', timeToFull: '1h 50m', subscriptionPlan: 'Standard' }
        ]
    },
    { 
        id: '3', 
        name: 'SLEX Shell Mamplasan', 
        location: 'South Luzon Expressway, Biñan', 
        status: 'Maintenance', 
        chargerType: 'DC Fast', 
        power: '350kW', 
        rating: 4.2, 
        totalSlots: 4, 
        availableSlots: 0, 
        solarOutput: 150,
        energyStored: 85,
        maxEnergyStorage: 400,
        coordinates: { lat: 14.3051, lng: 121.0964 },
        sessions: [] // No active sessions during maintenance
    },
    { 
        id: '4', 
        name: 'SM Mall of Asia', 
        location: 'Seaside Blvd, Pasay, Metro Manila', 
        status: 'Offline', 
        chargerType: 'Level 2', 
        power: '11kW', 
        rating: 3.9, 
        totalSlots: 20, 
        availableSlots: 20, 
        solarOutput: 0,
        energyStored: 0,
        maxEnergyStorage: 800,
        coordinates: { lat: 14.5353, lng: 120.9826 },
        sessions: []
    },
    { 
        id: '5', 
        name: 'Intramuros Tech Hub', 
        location: 'General Luna St, Manila', 
        status: 'Online', 
        chargerType: 'DC Fast', 
        power: '150kW', 
        rating: 4.9, 
        totalSlots: 6, 
        availableSlots: 1, 
        solarOutput: 510,
        energyStored: 480,
        maxEnergyStorage: 500,
        coordinates: { lat: 14.5905, lng: 120.9765 },
        sessions: [
            { driverName: 'Carlos S.', driverAvatar: 'https://i.pravatar.cc/150?img=60', carModel: 'Volvo XC40', chargeLevel: 82, timeElapsed: '50m', timeToFull: '15m', subscriptionPlan: 'Elite' },
            { driverName: 'Maria G.', driverAvatar: 'https://i.pravatar.cc/150?img=41', carModel: 'Mercedes EQC', chargeLevel: 15, timeElapsed: '05m', timeToFull: '1h 25m', subscriptionPlan: 'Basic' },
            { driverName: 'James W.', driverAvatar: 'https://i.pravatar.cc/150?img=33', carModel: 'Tesla Model Y', chargeLevel: 65, timeElapsed: '35m', timeToFull: '30m', subscriptionPlan: 'Deluxe' },
            { driverName: 'Patricia H.', driverAvatar: 'https://i.pravatar.cc/150?img=20', carModel: 'Hyundai Kona', chargeLevel: 95, timeElapsed: '1h 15m', timeToFull: '5m', subscriptionPlan: 'Supreme' },
            { driverName: 'David L.', driverAvatar: 'https://i.pravatar.cc/150?img=12', carModel: 'MG ZS EV', chargeLevel: 40, timeElapsed: '25m', timeToFull: '55m', subscriptionPlan: 'Free' }
        ]
    },
];

export const MOCK_BOOKINGS: Booking[] = [
    { id: 'BK-001', userId: 'usr_1', stationName: 'Ayala Triangle Gardens', stationId: '1', date: getDate(0), time: '14:00', status: 'Active', amount: 25.50 },
    { id: 'BK-002', userId: 'usr_2', stationName: 'BGC High Street', stationId: '2', date: getDate(0), time: '10:30', status: 'Completed', amount: 12.00 },
    { id: 'BK-003', userId: 'usr_3', stationName: 'Intramuros Tech Hub', stationId: '5', date: getDate(0), time: '18:00', status: 'Completed', amount: 30.00 },
    { id: 'BK-004', userId: 'usr_4', stationName: 'Ayala Triangle Gardens', stationId: '1', date: getDate(0), time: '09:00', status: 'Pending', amount: 28.00 },
    { id: 'BK-005', userId: 'usr_5', stationName: 'SLEX Shell Mamplasan', stationId: '3', date: getDate(0), time: '12:00', status: 'Cancelled', amount: 0.00 },
    { id: 'BK-006', userId: 'usr_1', stationName: 'SM Mall of Asia', stationId: '4', date: getDate(1), time: '16:00', status: 'Completed', amount: 18.50 },
    { id: 'BK-007', userId: 'usr_3', stationName: 'BGC High Street', stationId: '2', date: getDate(1), time: '11:15', status: 'Pending', amount: 15.00 },
    { id: 'BK-008', userId: 'usr_2', stationName: 'Ayala Triangle Gardens', stationId: '1', date: getDate(1), time: '08:00', status: 'Completed', amount: 22.00 },
    { id: 'BK-009', userId: 'usr_4', stationName: 'Intramuros Tech Hub', stationId: '5', date: getDate(2), time: '13:30', status: 'Active', amount: 35.00 },
    { id: 'BK-010', userId: 'usr_5', stationName: 'SLEX Shell Mamplasan', stationId: '3', date: getDate(2), time: '20:00', status: 'Cancelled', amount: 0.00 },
    { id: 'BK-011', userId: 'usr_1', stationName: 'BGC High Street', stationId: '2', date: getDate(3), time: '14:45', status: 'Completed', amount: 14.50 },
    { id: 'BK-012', userId: 'usr_2', stationName: 'Ayala Triangle Gardens', stationId: '1', date: getDate(3), time: '10:00', status: 'Pending', amount: 26.50 },
    { id: 'BK-013', userId: 'usr_3', stationName: 'SM Mall of Asia', stationId: '4', date: getDate(4), time: '17:30', status: 'Completed', amount: 19.00 },
    { id: 'BK-014', userId: 'usr_4', stationName: 'Intramuros Tech Hub', stationId: '5', date: getDate(5), time: '12:15', status: 'Active', amount: 32.00 },
    { id: 'BK-015', userId: 'usr_5', stationName: 'SLEX Shell Mamplasan', stationId: '3', date: getDate(6), time: '09:45', status: 'Cancelled', amount: 0.00 },
    { id: 'BK-016', userId: 'usr_1', stationName: 'Ayala Triangle Gardens', stationId: '1', date: getDate(7), time: '15:00', status: 'Completed', amount: 24.00 },
    { id: 'BK-017', userId: 'usr_2', stationName: 'BGC High Street', stationId: '2', date: getDate(8), time: '11:00', status: 'Pending', amount: 16.00 },
    { id: 'BK-018', userId: 'usr_3', stationName: 'Intramuros Tech Hub', stationId: '5', date: getDate(10), time: '18:30', status: 'Completed', amount: 29.50 },
    { id: 'BK-019', userId: 'usr_4', stationName: 'SM Mall of Asia', stationId: '4', date: getDate(12), time: '14:20', status: 'Active', amount: 21.00 },
    { id: 'BK-020', userId: 'usr_5', stationName: 'SLEX Shell Mamplasan', stationId: '3', date: getDate(14), time: '08:30', status: 'Completed', amount: 45.00 },
    { id: 'BK-021', userId: 'usr_1', stationName: 'BGC High Street', stationId: '2', date: getDate(15), time: '13:00', status: 'Pending', amount: 13.50 },
    { id: 'BK-022', userId: 'usr_2', stationName: 'Ayala Triangle Gardens', stationId: '1', date: getDate(20), time: '19:00', status: 'Completed', amount: 27.00 },
    { id: 'BK-023', userId: 'usr_3', stationName: 'Intramuros Tech Hub', stationId: '5', date: getDate(22), time: '10:45', status: 'Active', amount: 33.00 },
    { id: 'BK-024', userId: 'usr_4', stationName: 'SM Mall of Asia', stationId: '4', date: getDate(25), time: '16:15', status: 'Completed', amount: 20.50 },
    { id: 'BK-025', userId: 'usr_5', stationName: 'SLEX Shell Mamplasan', stationId: '3', date: getDate(28), time: '15:30', status: 'Pending', amount: 42.00 },
];

export const MOCK_USERS: User[] = [
    { 
        id: 'usr_000', 
        name: 'Mark Johnson', 
        email: 'mark.admin@wynx.com', 
        role: 'Super Admin', 
        status: 'Active', 
        subscriptionPlan: 'Supreme',
        avatar: 'https://i.pravatar.cc/150?u=mark',
        lastLogin: getDate(0),
        joinDate: '2023-01-15',
        phoneNumber: '+63 917 123 4567'
    },
    { 
        id: 'usr_1', 
        name: 'Alex Johnson', 
        email: 'alex@example.com', 
        role: 'Subscriber', 
        status: 'Active', 
        subscriptionPlan: 'Elite',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        lastLogin: getDate(0),
        joinDate: '2023-05-20',
        phoneNumber: '+63 917 555 0001'
    },
    { 
        id: 'usr_2', 
        name: 'Sarah Connor', 
        email: 'sarah@example.com', 
        role: 'User', 
        status: 'Active', 
        subscriptionPlan: 'Basic',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        lastLogin: getDate(1),
        joinDate: '2023-08-12',
        phoneNumber: '+63 918 777 9999'
    },
    { 
        id: 'usr_3', 
        name: 'Michael Chen', 
        email: 'mike.chen@tech.com', 
        role: 'Admin', 
        status: 'Active', 
        subscriptionPlan: 'Premium',
        avatar: 'https://i.pravatar.cc/150?u=mike',
        lastLogin: getDate(0),
        joinDate: '2023-03-10',
        phoneNumber: '+63 920 123 8888'
    },
    { 
        id: 'usr_4', 
        name: 'Emily Blunt', 
        email: 'emily@studio.com', 
        role: 'User', 
        status: 'Inactive', 
        subscriptionPlan: 'Basic',
        avatar: 'https://i.pravatar.cc/150?u=emily',
        lastLogin: getDate(14),
        joinDate: '2023-11-05',
        phoneNumber: '+63 916 444 3322'
    },
    { 
        id: 'usr_5', 
        name: 'David Kim', 
        email: 'dkim@finance.com', 
        role: 'Subscriber', 
        status: 'Active', 
        subscriptionPlan: 'Premium',
        avatar: 'https://i.pravatar.cc/150?u=david',
        lastLogin: getDate(2),
        joinDate: '2023-06-25',
        phoneNumber: '+63 917 999 1111'
    },
    {
        id: 'usr_6',
        name: 'Jessica Pearson',
        email: 'j.pearson@law.com',
        role: 'Subscriber',
        status: 'Suspended',
        subscriptionPlan: 'Supreme',
        avatar: 'https://i.pravatar.cc/150?u=jessica',
        lastLogin: getDate(5),
        joinDate: '2023-02-14',
        phoneNumber: '+63 917 888 7777'
    },
    {
        id: 'usr_7',
        name: 'Harvey Specter',
        email: 'h.specter@law.com',
        role: 'Admin',
        status: 'Active',
        subscriptionPlan: 'Elite',
        avatar: 'https://i.pravatar.cc/150?u=harvey',
        lastLogin: getDate(0),
        joinDate: '2023-02-15',
        phoneNumber: '+63 917 777 6666'
    }
];

export const MOCK_REVIEWS: Review[] = [
    { id: 'rev_1', userId: 'usr_1', userName: 'Alex Johnson', stationId: '1', stationName: 'Ayala Triangle Gardens', rating: 5, comment: 'Great charging speed and the solar canopy is a nice touch!', date: getDate(0), status: 'Published' },
    { id: 'rev_2', userId: 'usr_4', userName: 'Emily Blunt', stationId: '2', stationName: 'BGC High Street', rating: 2, comment: 'One of the connectors was broken. Please fix.', date: getDate(1), status: 'Flagged' },
    { id: 'rev_3', userId: 'usr_3', userName: 'Michael Chen', stationId: '5', stationName: 'Intramuros Tech Hub', rating: 4, comment: 'Good location but busy during lunch hours.', date: getDate(2), status: 'Published' },
];

export const REVENUE_DATA: ChartData[] = [
    { name: 'Jan', value: 4000, value2: 2400 },
    { name: 'Feb', value: 3000, value2: 1398 },
    { name: 'Mar', value: 2000, value2: 9800 },
    { name: 'Apr', value: 2780, value2: 3908 },
    { name: 'May', value: 1890, value2: 4800 },
    { name: 'Jun', value: 2390, value2: 3800 },
    { name: 'Jul', value: 3490, value2: 4300 },
    { name: 'Aug', value: 4200, value2: 5100 },
    { name: 'Sep', value: 3800, value2: 4600 },
    { name: 'Oct', value: 5100, value2: 5800 },
    { name: 'Nov', value: 4600, value2: 5200 },
    { name: 'Dec', value: 6000, value2: 6400 },
];

export const STATION_USAGE_DATA: ChartData[] = [
    { name: 'Mon', value: 65 },
    { name: 'Tue', value: 59 },
    { name: 'Wed', value: 80 },
    { name: 'Thu', value: 81 },
    { name: 'Fri', value: 56 },
    { name: 'Sat', value: 95 },
    { name: 'Sun', value: 88 },
];