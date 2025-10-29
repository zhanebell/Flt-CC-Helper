class FlightAccountability {
    constructor() {
        this.cadets = [];
        this.flightCommander = 'Sir/Ma\'am'; // Default, can be customized
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatement();
    }

    bindEvents() {
        const startBtn = document.getElementById('start-accountability');
        const updateBtn = document.getElementById('update-statement');
        const cadetInput = document.getElementById('cadet-input');

        startBtn.addEventListener('click', () => this.startAccountability());
        updateBtn.addEventListener('click', () => this.updateStatement());

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
        
        // Show the cadet list section
        document.getElementById('cadet-list').classList.remove('hidden');
    }

    renderCadetList() {
        const container = document.getElementById('cadets-container');
        container.innerHTML = '';

        this.cadets.forEach((cadet, index) => {
            const cadetDiv = document.createElement('div');
            cadetDiv.className = 'cadet-item';
            cadetDiv.setAttribute('data-status', cadet.status);

            cadetDiv.innerHTML = `
                <span class="cadet-name">${cadet.name}</span>
                <button class="status-button ${cadet.status}" data-index="${index}">
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
                
                // Update button appearance
                e.target.className = `status-button ${newStatus}`;
                e.target.textContent = this.getStatusText(newStatus);
                
                // Update the visual indicator
                const cadetItem = e.target.closest('.cadet-item');
                cadetItem.setAttribute('data-status', newStatus);
                
                this.updateStatement();
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

        let statement = `Cadet ${this.flightCommander}, may I make a statement? `;
        statement += `Flight's accountability is as follows: `;
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

    // Method to customize flight commander name
    setFlightCommander(name) {
        this.flightCommander = name;
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