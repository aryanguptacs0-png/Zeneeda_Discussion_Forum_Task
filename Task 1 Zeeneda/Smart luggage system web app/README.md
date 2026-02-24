# Smart Seat & Luggage Management System

A conceptual web application designed to solve passenger conflicts over unstructured luggage placement in railway coaches. This system digitally maps passenger seats to fixed, reserved luggage slots to ensure fair space utilization, enhanced security, and new digital revenue streams.

## Core Features
- **Passenger Dashboard:** View assigned luggage slots based on QR-verified ticket details. Includes a dynamic, real-time visual representation of the luggage rack, letting users avoid conflicts.
- **Digital Extra Capacity:** Passengers can securely pre-book "Premium" or extra luggage space right from their dashboard avoiding messy interactions on the train.
- **TTE Scanning Simulation:** A mock interface for Ticket Examiners to "scan" a passenger’s luggage QR code. The system auto-detects placement anomalies (e.g. wrong slot or unpaid excess baggage).
- **Automated Fine Generation:** TTEs can issue instant digital fines to the passenger's account if a conflict or unpaid baggage is detected. 
- **Admin Analytics:** Comprehensive dashboard highlighting predictive AI routing demands, total system revenue (across tickets, upgrades, and fines), and a live feed of recent platform enforcement.

## Local Deployment Details
This project was strictly designed as a **Vanilla JS Single Page Application (SPA)** with zero external build dependencies (No Node.js, Webpack, or Vite required).

### Directory Structure
```
smart-luggage/
├── index.html        # App entry point + CDN dependencies
├── css/
│   └── styles.css    # Responsive Railway-themed design system
└── js/
    ├── app.js        # DOM Manipulation, Views & Routing
    ├── store.js      # Global reactive state & Mock Database
    └── aiEngine.js   # Simulated predictive analytics & conflict rules
```

## How to Run
1. Navigate to the `smart-luggage/` directory.
2. Double-click **`index.html`** to load the application locally in any modern browser.
3. Switch between user personas using the Top Navigation Bar (`Passenger`, `TTE Staff`, `Admin Analytics`).
4. **Test the TTE Flow**:
   - Go to `TTE Staff`
   - Click *Simulate Violation Scan*
   - See the AI flag the unpaid luggage anomaly, and issue the digital fine.
   - Go to `Admin Analytics` and observe the revenue metrics instantly update using the reactive `store.js` framework!
