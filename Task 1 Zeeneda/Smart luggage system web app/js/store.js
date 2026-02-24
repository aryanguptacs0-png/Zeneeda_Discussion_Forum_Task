/**
 * store.js
 * Global State Management imitating a database and reactive event loop
 */
class SystemStore {
    constructor() {
        this.state = {
            // Mock Ticket Database
            tickets: {
                'PNR1234567890': {
                    pnr: 'PNR1234567890',
                    passengerName: 'Anil Kumar',
                    coach: 'B4',
                    seat: '42',
                    assignedSlot: 'L2',
                    hasExtraDataPaid: false,
                    hasExtraLuggageUnpaid: false
                },
                'PNR0987654321': { // A ticket with violations for the TTE demo
                    pnr: 'PNR0987654321',
                    passengerName: 'Priya Sharma',
                    coach: 'B4',
                    seat: '12',
                    assignedSlot: 'L4',
                    hasExtraDataPaid: false,
                    hasExtraLuggageUnpaid: true
                }
            },

            // Current Active Passenger
            activePassenger: 'PNR1234567890',

            // Admin Analytics Data
            analytics: {
                totalRevenue: 125000,
                revenueExtraLuggage: 85000,
                revenueFines: 40000,
                totalConflictsResolved: 142,
                activeAlerts: 3
            },

            // TTE Violations Log
            recentFines: []
        };
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Actions
    bookExtraLuggage(pnr) {
        if (this.state.tickets[pnr]) {
            this.state.tickets[pnr].hasExtraDataPaid = true;
            this.state.tickets[pnr].hasExtraLuggageUnpaid = false;

            // Upgrade their slot
            this.state.tickets[pnr].assignedSlot = 'L5 (Premium)';
            this.state.analytics.totalRevenue += 500;
            this.state.analytics.revenueExtraLuggage += 500;

            this.notify();
            return true;
        }
        return false;
    }

    issueDigitalFine(pnr, amount) {
        if (this.state.tickets[pnr]) {
            // Mark the problem as resolved through fine payment
            this.state.tickets[pnr].hasExtraLuggageUnpaid = false;
            this.state.tickets[pnr].hasExtraDataPaid = true;

            this.state.analytics.totalRevenue += amount;
            this.state.analytics.revenueFines += amount;
            this.state.analytics.totalConflictsResolved += 1;

            this.state.recentFines.unshift({
                pnr,
                amount,
                time: new Date().toLocaleTimeString(),
                type: 'Misplaced / Excess Luggage'
            });

            this.notify();
            return true;
        }
        return false;
    }
}

window.store = new SystemStore();
