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

        // Initialize cadets with default status
        this.cadets = cadetNames.map(name => ({
            name: name,
            status: 'present' // Default to present
        }));

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
                <select class="status-select" data-index="${index}">
                    <option value="present" ${cadet.status === 'present' ? 'selected' : ''}>Present</option>
                    <option value="late" ${cadet.status === 'late' ? 'selected' : ''}>Late</option>
                    <option value="absent" ${cadet.status === 'absent' ? 'selected' : ''}>Absent</option>
                </select>
            `;

            container.appendChild(cadetDiv);
        });

        // Add event listeners to status selects
        container.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const newStatus = e.target.value;
                this.cadets[index].status = newStatus;
                
                // Update the visual indicator
                const cadetItem = e.target.closest('.cadet-item');
                cadetItem.setAttribute('data-status', newStatus);
                
                this.updateStatement();
            });
        });
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
        
        const totalCadets = this.cadets.length;
        const presentCount = present.length;
        const accountedFor = present.length + late.length + absent.length;
        const unaccountedFor = totalCadets - accountedFor;

        let statement = `Cadet ${this.flightCommander}, may I make a statement? `;
        statement += `Flight's accountability is as follows: `;
        statement += `${presentCount} of ${totalCadets} cadets present. `;
        statement += `${accountedFor} accounted for, ${unaccountedFor} unaccounted for.`;

        if (late.length > 0) {
            const lateNames = late.map(c => c.name).join(', ');
            const lateVerb = late.length === 1 ? 'will be attending' : 'will be attending';
            statement += `\n\nCadet${late.length > 1 ? 's' : ''} ${lateNames} ${lateVerb} late.`;
        }

        if (absent.length > 0) {
            const absentNames = absent.map(c => c.name).join(', ');
            const absentVerb = absent.length === 1 ? 'will not be attending' : 'will not be attending';
            statement += `\n\nCadet${absent.length > 1 ? 's' : ''} ${absentNames} ${absentVerb}.`;
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