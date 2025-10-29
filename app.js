class FlightAccountability {
    constructor() {
        this.cadets = [];
        this.flightName = 'Lima Flight'; // Default flight name
        this.sortByStatus = false; // Default to alphabetical sorting
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

    bindSortToggle() {
        const sortBtn = document.getElementById('sort-toggle');
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.toggleSort());
        }
    }

    toggleSort() {
        this.sortByStatus = !this.sortByStatus;
        const sortBtn = document.getElementById('sort-toggle');
        sortBtn.textContent = this.sortByStatus ? 'Sort: By Status' : 'Sort: Alphabetical';
        this.renderCadetList();
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
        // Bind sort toggle after showing cadet list
        this.bindSortToggle();
    }

    renderCadetList() {
        const container = document.getElementById('cadets-container');
        container.innerHTML = '';

        // Sort cadets based on current sort mode
        let sortedCadets;
        if (this.sortByStatus) {
            // Sort by status priority (unknown, late, absent, present) then alphabetically within each group
            const statusOrder = { 'unknown': 0, 'late': 1, 'absent': 2, 'present': 3 };
            sortedCadets = [...this.cadets].sort((a, b) => {
                // First sort by status priority
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                // Then sort alphabetically within the same status
                return a.name.localeCompare(b.name);
            });
        } else {
            // Sort alphabetically only
            sortedCadets = [...this.cadets].sort((a, b) => a.name.localeCompare(b.name));
        }

        sortedCadets.forEach((cadet, displayIndex) => {
            // Find original index for event handling
            const originalIndex = this.cadets.findIndex(c => c.name === cadet.name && c.status === cadet.status);
            
            const cadetDiv = document.createElement('div');
            cadetDiv.className = 'cadet-item';
            cadetDiv.setAttribute('data-status', cadet.status);
            cadetDiv.setAttribute('data-index', originalIndex);

            cadetDiv.innerHTML = `
                <span class="cadet-name">${cadet.name}</span>
                <span class="status-button ${cadet.status}">
                    ${this.getStatusText(cadet.status)}
                </span>
            `;

            container.appendChild(cadetDiv);
        });

        // Add event listeners to entire cadet items for cycling
        container.querySelectorAll('.cadet-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(item.getAttribute('data-index'));
                const currentStatus = this.cadets[index].status;
                const newStatus = this.getNextStatus(currentStatus);
                
                this.cadets[index].status = newStatus;
                
                // Update status display immediately
                const statusSpan = item.querySelector('.status-button');
                statusSpan.className = `status-button ${newStatus}`;
                statusSpan.textContent = this.getStatusText(newStatus);
                
                // Update the visual indicator immediately
                item.setAttribute('data-status', newStatus);
                
                // Update statement immediately
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
        // Of the non-present cadets: accounted for = late + absent, unaccounted for = unknown
        const accountedFor = late.length + absent.length; // Non-present but status known
        const unaccountedFor = unknown.length; // Non-present with unknown status

        let statement = `${this.flightName}'s accountability is as follows: `;
        statement += `${presentCount} of ${totalCadets} cadets present. `;
        statement += `${accountedFor} accounted for, ${unaccountedFor} unaccounted for.`;

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