// DOM Elements
const mainContent = document.getElementById('main-content');
const navPassenger = document.getElementById('nav-passenger');
const navTTE = document.getElementById('nav-tte');
const navAdmin = document.getElementById('nav-admin');

// Router
function handleRoute() {
    const hash = window.location.hash || '#passenger';

    // Update Nav
    navPassenger.classList.toggle('active', hash === '#passenger');
    navTTE.classList.toggle('active', hash === '#tte');
    navAdmin.classList.toggle('active', hash === '#admin');

    // Render View
    if (hash === '#passenger') renderPassengerView();
    else if (hash === '#tte') renderTTEView();
    else if (hash === '#admin') renderAdminView();
}

// React to state changes
store.subscribe(() => {
    handleRoute();
});

window.addEventListener('hashchange', handleRoute);

// -------------------------------------------------------------
// Passenger Dashboard
// -------------------------------------------------------------
function renderPassengerView() {
    const pnr = store.state.activePassenger;
    const ticket = store.state.tickets[pnr];

    // Fetch optimal racks from AI
    const simulatedRacks = aiEngine.optimizeCoachRacks(ticket.coach);

    let html = `
        <div class="card">
            <h2 style="margin-bottom: 1.5rem;">My Journey & Luggage Assignment</h2>
            
            <div style="display:flex; flex-wrap:wrap; gap: 2rem;">
                <div style="flex: 1; min-width: 300px;">
                    <div style="background: var(--bg-light); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                        <p style="color:var(--text-light); text-transform:uppercase; font-size:0.85rem; font-weight:700;">Ticket Details</p>
                        <h3 style="color:var(--text-dark); margin:0.5rem 0;">${ticket.passengerName}</h3>
                        <p><strong>PNR:</strong> ${ticket.pnr}</p>
                        <p><strong>Coach:</strong> ${ticket.coach} | <strong>Seat:</strong> ${ticket.seat}</p>
                        <div style="margin-top: 1rem; padding: 1rem; background: var(--status-available); color:white; border-radius: 8px; font-weight: 600;">
                            Assigned Luggage Slot: ${ticket.assignedSlot}
                        </div>
                    </div>
                </div>
                
                <div style="flex: 1; min-width: 300px; text-align: center;">
                    <h4 style="margin-bottom: 0.5rem; color:var(--text-dark);">Digital Luggage Token</h4>
                    <p style="color:var(--text-light); font-size: 0.9rem; margin-bottom:1rem;">Present this QR code to the TTE for verification.</p>
                    <div id="qr-container"></div>
                </div>
            </div>

            <h3 style="margin-top: 2rem; margin-bottom: 1rem; color:var(--text-dark);">Coach ${ticket.coach} Upper Rack Availability</h3>
            <p style="color:var(--text-light); font-size:0.9rem;">AI Optimized layout for safe travel. Do not place luggage in red slots.</p>
            
            <div class="rack-visual">
                ${simulatedRacks.map(r => {
        let cClass = r.isOccupied ? 'slot-occupied' : 'slot-available';
        if (r.type === 'Premium') cClass = 'slot-premium';
        // Highlight passenger's own slot
        if (ticket.assignedSlot.includes(r.id)) cClass = 'slot-yours';

        return `
                        <div class="slot ${cClass}">
                            <span>${r.id}</span>
                            <span style="font-size:0.7rem; opacity:0.8; margin-top:0.3rem;">
                                ${ticket.assignedSlot.includes(r.id) ? 'Yours' : r.type === 'Premium' ? '₹500' : r.isOccupied ? 'Taken' : 'Free'}
                            </span>
                        </div>
                    `;
    }).join('')}
            </div>
            
            ${!ticket.hasExtraDataPaid ? `
                <div style="margin-top:2rem; background:rgba(245,158,11,0.1); padding:1.5rem; border-radius:12px; border:1px solid rgba(245,158,11,0.3);">
                    <h3 style="color:#B45309; margin-bottom:0.5rem;">Need More Space?</h3>
                    <p style="margin-bottom:1rem; color:#92400E;">Book an extra Premium large-tier slot digitally now to avoid conflicts and fines aboard the train.</p>
                    <button class="btn btn-gold" id="btn-book-extra">Book Extra Slot (₹500)</button>
                </div>
            ` : `
                <div style="margin-top:2rem; padding:1.5rem; background:var(--status-available); color:white; border-radius:12px;">
                    <h3 style="margin-bottom:0.5rem;">Premium Luggage Booked ✓</h3>
                    <p>You have access to extended baggage limits. Your QR code has been updated.</p>
                </div>
            `}
        </div>
    `;

    mainContent.innerHTML = html;

    // Generate QR
    const qrText = JSON.stringify({ pnr: ticket.pnr, slot: ticket.assignedSlot, extraPaid: ticket.hasExtraDataPaid });
    new QRCode(document.getElementById("qr-container"), {
        text: qrText,
        width: 150,
        height: 150,
        colorDark: "#1E3A8A",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });

    // Attach listeners
    const bookBtn = document.getElementById('btn-book-extra');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            if (confirm("Proceed with secure payment of ₹500 for Extra Premium Slot?")) {
                store.bookExtraLuggage(ticket.pnr);
                alert("Payment successful. Luggage capacity extended.");
                handleRoute();
            }
        });
    }
}


// -------------------------------------------------------------
// TTE Dashboard
// -------------------------------------------------------------
function renderTTEView() {
    let html = `
        <div class="card">
            <h2 style="margin-bottom: 2rem;">Scanner Interface</h2>
            <div class="scanner-window" id="scanner-mock">
                <!-- Mock QR Code Scanner View -->
                <div class="scanner-line"></div>
                <p style="color:white; text-align:center; position:absolute; bottom:10px; width:100%;">Align QR Code to scan</p>
            </div>
            
            <div style="text-align: center;">
                <h3 style="color:var(--text-dark); margin-bottom: 1rem;">Simulation Controls</h3>
                <div style="display:flex; justify-content:center; gap: 1rem;">
                    <button class="btn" id="sim-scan-ok">Simulate Clean Scan</button>
                    <button class="btn btn-danger" id="sim-scan-fail">Simulate Violation Scan</button>
                </div>
            </div>
        </div>
        
        <div id="scan-result-container"></div>
    `;

    mainContent.innerHTML = html;

    // Listeners for Mocking Scan Events
    document.getElementById('sim-scan-ok').addEventListener('click', () => {
        handleScanResult(store.state.tickets['PNR1234567890'], 'L2');
    });

    document.getElementById('sim-scan-fail').addEventListener('click', () => {
        // Will trigger anomaly because this ticket has hasExtraLuggageUnpaid = true
        handleScanResult(store.state.tickets['PNR0987654321'], 'L5');
    });
}

function handleScanResult(ticket, observedSlot) {
    const anomalyResult = aiEngine.detectAnomaly(ticket, observedSlot);
    const container = document.getElementById('scan-result-container');

    if (!anomalyResult.isAnomaly) {
        container.innerHTML = `
            <div class="card" style="border-left: 5px solid var(--status-available);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="color:var(--status-available)">Verification Successful ✓</h3>
                    <span class="badge badge-success">OK</span>
                </div>
                <p style="margin-top:1rem;"><strong>${ticket.passengerName} (Seat ${ticket.coach}-${ticket.seat})</strong> is correctly using Slot ${ticket.assignedSlot}.</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="card" style="border-left: 5px solid var(--status-conflict);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="color:var(--status-conflict)">Warning: Rules Violation Detected ⚠</h3>
                    <span class="badge badge-danger">ACTION REQUIRED</span>
                </div>
                <p style="margin:1rem 0; font-weight:600;">${ticket.passengerName} (PNR: ${ticket.pnr})</p>
                <p style="margin-bottom:1.5rem; color:var(--text-light);">${anomalyResult.reason}</p>
                
                <div style="display:flex; gap: 1rem;">
                    <button class="btn btn-gold" id="btn-issue-fine">Generate Fine (₹800)</button>
                </div>
            </div>
        `;

        document.getElementById('btn-issue-fine').addEventListener('click', () => {
            if (confirm('Issue digital mandate of ₹800 to passenger device?')) {
                store.issueDigitalFine(ticket.pnr, 800);
                alert('Digital Ticket Issued to Passenger. Matter resolved.');
                renderTTEView(); // Reset view
            }
        });
    }
}


// -------------------------------------------------------------
// Admin Dashboard
// -------------------------------------------------------------
function renderAdminView() {
    const data = store.state.analytics;
    const insights = aiEngine.getPredictiveInsights();
    const fines = store.state.recentFines;

    // Currency Formatter
    const formatINR = (num) => '₹' + num.toLocaleString('en-IN');

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <h2>System Overview & Revenue Insights</h2>
            <span class="badge badge-success" style="font-size:1rem;">Active</span>
        </div>
        
        <div class="metric-grid">
            <div class="metric-card">
                <p>Total Revenue Initiated</p>
                <h3>${formatINR(data.totalRevenue)}</h3>
            </div>
            <div class="metric-card">
                <p>Extra Luggage Sales</p>
                <h3 style="color:var(--accent-gold);">${formatINR(data.revenueExtraLuggage)}</h3>
            </div>
            <div class="metric-card">
                <p>Anomaly Fines Collected</p>
                <h3 style="color:var(--status-conflict);">${formatINR(data.revenueFines)}</h3>
            </div>
            <div class="metric-card">
                <p>Conflicts Automatically Resolved</p>
                <h3>${data.totalConflictsResolved}</h3>
            </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap: 2rem;">
            <div class="card" style="flex: 2; min-width: 300px;">
                <h3 style="margin-bottom: 1.5rem;">AI Predictive Route Analytics</h3>
                
                ${insights.map(insight => `
                    <div style="background:var(--bg-light); padding:1.5rem; border-radius:12px; margin-bottom:1rem; border-left:4px solid var(--accent-gold);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                            <h4 style="color:var(--text-dark);">${insight.route}</h4>
                            <span class="badge badge-warning">Confidence: ${insight.confidence}</span>
                        </div>
                        <p style="color:var(--status-conflict); font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">${insight.prediction}</p>
                        <p style="color:var(--text-light); font-size:0.9rem;"><strong>Action:</strong> ${insight.recommendation}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="card" style="flex: 1; min-width: 300px;">
                <h3 style="margin-bottom: 1.5rem;">Recent Enforcement Feed</h3>
                ${fines.length === 0 ? '<p style="color:var(--text-light);">No recent fines logged today.</p>' : ''}
                
                <div style="display:flex; flex-direction:column; gap:1rem;">
                    ${fines.map(f => `
                        <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 0.8rem;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
                                <strong>${f.pnr}</strong>
                                <span style="color:var(--status-conflict); font-weight:600;">+${formatINR(f.amount)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-light);">
                                <span>${f.type}</span>
                                <span>${f.time}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = html;
}

// Initial Boot
handleRoute();
