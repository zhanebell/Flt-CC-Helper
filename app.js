class FlightAccountability {
    constructor() {
        this.cadets = [];
        this.flightName = 'Lima Flight'; // Default flight name
        this.reorderTimeout = null; // For delayed reordering
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatement();
    }

    bindEvents() {
        const startBtn = document.getElementById('start-accountability');
        const cadetInput = document.getElementById('cadet-input');

        startBtn.addEventListener('click', () => this.startAccountability());

        // Allow Enter key to start accountability
        cadetInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.startAccountability();
            }
        });
    }

    startAccountability() {
        const input = document.getElementById('cadet-input');
        const cadetNames = input.value
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (cadetNames.length === 0) {
            alert('Please enter at least one cadet name.');
            return;
        }

        // Initialize cadets with default status and add C/ prefix if not present
        this.cadets = cadetNames.map(name => {
            const formattedName = name.startsWith('C/') ? name : `C/${name}`;
            return {
                name: formattedName,
                status: 'unknown' // Default to unknown
            };
        });

        this.renderCadetList();
        this.updateStatement();
        
        // Hide the entire input section (including the Start Accountability button)
        document.getElementById('input-section').style.display = 'none';
        // Show the cadet list section
        document.getElementById('cadet-list').classList.remove('hidden');
    }

    renderCadetList() {
        const container = document.getElementById('cadets-container');
        container.innerHTML = '';

        // Sort cadets by status priority (unknown, late, absent, present) then alphabetically within each group
        const statusOrder = { 'unknown': 0, 'late': 1, 'absent': 2, 'present': 3 };
        const sortedCadets = [...this.cadets].sort((a, b) => {
            // First sort by status priority
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            // Then sort alphabetically within the same status
            return a.name.localeCompare(b.name);
        });

        sortedCadets.forEach((cadet, displayIndex) => {
            // Find original index for event handling
            const originalIndex = this.cadets.findIndex(c => c.name === cadet.name && c.status === cadet.status);
            
            const cadetDiv = document.createElement('div');
            cadetDiv.className = 'cadet-item';
            cadetDiv.setAttribute('data-status', cadet.status);

            cadetDiv.innerHTML = `
                <span class="cadet-name">${cadet.name}</span>
                <button class="status-button ${cadet.status}" data-index="${originalIndex}">
                    ${this.getStatusText(cadet.status)}
                </button>
            `;

            container.appendChild(cadetDiv);
        });

        // Add event listeners to status buttons for cycling
        container.querySelectorAll('.status-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const currentStatus = this.cadets[index].status;
                const newStatus = this.getNextStatus(currentStatus);
                
                this.cadets[index].status = newStatus;
                
                // Update button appearance immediately
                e.target.className = `status-button ${newStatus}`;
                e.target.textContent = this.getStatusText(newStatus);
                
                // Update the visual indicator immediately
                const cadetItem = e.target.closest('.cadet-item');
                cadetItem.setAttribute('data-status', newStatus);
                
                // Update statement immediately
                this.updateStatement();
                
                // Clear any existing reorder timeout
                if (this.reorderTimeout) {
                    clearTimeout(this.reorderTimeout);
                }
                
                // Delay the re-rendering/reordering by 1.5 seconds
                this.reorderTimeout = setTimeout(() => {
                    this.renderCadetList();
                }, 1500);
            });
        });
    }

    getStatusText(status) {
        switch(status) {
            case 'unknown': return 'UNKNOWN';
            case 'present': return 'PRESENT';
            case 'late': return 'LATE';
            case 'absent': return 'ABSENT';
            default: return 'UNKNOWN';
        }
    }

    getNextStatus(currentStatus) {
        const statusCycle = ['unknown', 'present', 'late', 'absent'];
        const currentIndex = statusCycle.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        return statusCycle[nextIndex];
    }

    updateStatement() {
        const statementElement = document.getElementById('statement-text');
        
        if (this.cadets.length === 0) {
            statementElement.textContent = 'Enter cadets below to generate accountability statement';
            return;
        }

        const present = this.cadets.filter(c => c.status === 'present');
        const late = this.cadets.filter(c => c.status === 'late');
        const absent = this.cadets.filter(c => c.status === 'absent');
        const unknown = this.cadets.filter(c => c.status === 'unknown');
        
        const totalCadets = this.cadets.length;
        const presentCount = present.length;
        const accountedFor = present.length + late.length + absent.length;
        const unaccountedFor = unknown.length;

    let statement = `${this.flightName}'s accountability is as follows: `;
        statement += `${presentCount} of ${totalCadets} cadets present. `;
        statement += `${accountedFor} accounted for, ${unaccountedFor} unaccounted for.`;

        if (late.length > 0) {
            const lateNames = late.map(c => c.name).join(', ');
            statement += `\n\n${late.length > 1 ? 'Cadets' : 'Cadet'} ${lateNames} will be attending late.`;
        }

        if (absent.length > 0) {
            const absentNames = absent.map(c => c.name).join(', ');
            statement += `\n\n${absent.length > 1 ? 'Cadets' : 'Cadet'} ${absentNames} will not be attending.`;
        }

        statementElement.textContent = statement;
    }

    // Method to customize flight name
    setFlightName(name) {
        this.flightName = name;
        this.updateStatement();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.flightApp = new FlightAccountability();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful');
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed');
            });
    });
}