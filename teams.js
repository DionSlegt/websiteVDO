
const TEAMS_API_BASE = window.location.port === '3000' ? '/api' : (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api');

let lastUpdateTime = localStorage.getItem('teamsLastUpdate');
let updateInterval = null;
async function fetchLatestTeamsData() {
    try {
        const response = await fetch(`${TEAMS_API_BASE}/teams/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.warn('Backend server niet beschikbaar, gebruik lokale data');
            return null;
        }
    } catch (error) {
        console.warn('Backend server niet beschikbaar:', error);
        return null;
    }
}

function updateTeamsData(newData) {
    if (!newData || !newData.teams) {
        console.log('Geen nieuwe data om bij te werken');
        return;
    }
    
    Object.keys(newData.teams).forEach(teamName => {
        teamStandings[teamName] = newData.teams[teamName];
    });
    
    updateTeamsHTML(newData.teams);
    lastUpdateTime = new Date().toISOString();
    localStorage.setItem('teamsLastUpdate', lastUpdateTime);
    localStorage.setItem('teamsData', JSON.stringify(newData.teams));
    
    console.log('Teams data bijgewerkt:', new Date().toLocaleString('nl-NL'));
}

function updateTeamsHTML(teams) {
    console.log('Teams HTML zou moeten worden bijgewerkt met:', Object.keys(teams));
}

async function checkForUpdates() {
    const now = new Date();
    const lastUpdate = lastUpdateTime ? new Date(lastUpdateTime) : null;
    const hoursSinceUpdate = lastUpdate 
        ? (now - lastUpdate) / (1000 * 60 * 60)
        : 24;
    
    if (hoursSinceUpdate >= 24) {
        console.log('Controleren op updates...');
        const newData = await fetchLatestTeamsData();
        if (newData) {
            updateTeamsData(newData);
        }
    } else {
        console.log(`Laatste update: ${Math.round(hoursSinceUpdate)} uur geleden. Volgende check over ${Math.round(24 - hoursSinceUpdate)} uur.`);
    }
}

async function forceUpdateTeams() {
    console.log('Handmatige teams update gestart...');
    const newData = await fetchLatestTeamsData();
    if (newData && newData.teams && Object.keys(newData.teams).length > 0) {
        updateTeamsData(newData);
        console.log('Teams succesvol geüpdatet!');
        return true;
    } else {
        console.warn('Geen nieuwe teams data ontvangen of leeg resultaat');
        return false;
    }
}


function startAutoUpdate() {
    forceUpdateTeams().catch(err => {
        console.error('Fout bij automatische update:', err);
    checkForUpdates();
    });
    
    updateInterval = setInterval(() => {
        checkForUpdates();
    }, 6 * 60 * 60 * 1000);
    
    console.log('Automatisch update systeem gestart');
}

function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('Automatisch update systeem gestopt');
    }
}

if (lastUpdateTime) {
    const savedData = localStorage.getItem('teamsData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            Object.keys(parsedData).forEach(teamName => {
                if (!teamStandings[teamName]) {
                    teamStandings[teamName] = parsedData[teamName];
                }
            });
        } catch (e) {
            console.error('Fout bij laden opgeslagen data:', e);
        }
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoUpdate);
} else {
    startAutoUpdate();
}

const teamStandings = {
    'VDO 1': {
        class: 'Overgangsklasse',
        poule: 'A',
        members: [
            'D. Slegt (Dion)',
            'P.H.L. Bakker (Paul)',
            'M. van Dijk (Martijn)',
            'L. Hoogland (Lars)'
        ],
        standings: [
            { position: 1, team: 'De Victors 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 2, team: 'DOV 2', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 3, team: 'Amsterdam \'78 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 4, team: 'Amsterdam \'78 5', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 5, team: 'VDO 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 6, team: 'Olympia (E) 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 7, team: 'Victory \'55 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 }
        ]
    },
    'VDO 2': {
        class: '2e klasse',
        poule: 'D',
        members: [
            'R. Vos (Richard)',
            'D. Demaret (Daniël)',
            'P.R. Peters (Per)',
            'H. Sanlitürk (Hakan)'
        ],
        standings: [
            { position: 1, team: 'US 4', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 2, team: 'Amsterdam \'78 9', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 3, team: 'Oranje Zwart 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 4, team: 'VDO 2', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 5, team: 'JOVO 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 6, team: 'HBC 2', games: 0, wins: 0, draws: 0, losses: 0, points: 0 }
        ]
    },
    'VDO 3': {
        class: '2e klasse',
        poule: 'F',
        members: [
            'J.M. Filius (Joscha)',
            'S.T. Visser (Sjoerd)',
            'M. van der Wal (Marco)',
            'S. van der Wal (Stefan)',
            'L. Hu (Leo)'
        ],
        standings: [
            { position: 1, team: 'Amstelveen 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 2, team: 'Tempo-Team 9', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 3, team: 'HTC 4', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 4, team: 'ZTTC 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 5, team: 'Amsterdam \'78 10', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 6, team: 'VDO 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 }
        ]
    },
    'VDO 4': {
        class: '3e klasse',
        poule: 'F',
        members: [
            'R.A. van der Jagt (René)',
            'R.E. Wouters (Rob)',
            'M.F. van Rossum (Maarten)',
            'R.R. Tessensohn (Raymond)',
            'R.M. de Boer (Richard)'
        ],
        standings: [
            { position: 1, team: 'Het Nootwheer 4', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 2, team: 'Tempo-Team 12', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 3, team: 'Rapidity 6', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 4, team: 'Amsterdam \'78 11', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 5, team: 'Holendrecht 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 6, team: 'VDO 4', games: 0, wins: 0, draws: 0, losses: 0, points: 0 }
        ]
    },
    'VDO 5': {
        class: '3e klasse',
        poule: 'D',
        members: [
            'A.J. Kas (Astrid)',
            'T. Valkenburg (Teun)',
            'R.R. Allard (Ragnar)',
            'J.J.M. van der Wal (Jan)',
            'J. Flach (Joost)',
            'K. Buis (Kevin)'
        ],
        standings: [
            { position: 1, team: 'Sassem 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 2, team: 'GSV Heemstede 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 3, team: 'HTC 7', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 4, team: 'Amsterdam \'78 14', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 5, team: 'VDO 5', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 6, team: 'HBC 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 }
        ]
    },
    'VDO 6': {
        class: '5e klasse',
        poule: 'C',
        members: [
            'C.M. Heine (Collin)',
            'F. Groenevelt (Frederiek)',
            'M. Over (Marije)',
            'S. Demaret (Sebastiaan)',
            'R. van der Wal (Ria)'
        ],
        standings: [
            { position: 1, team: 'TSO 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 2, team: 'Diemen 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 3, team: 'Tempo-Team 22', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 4, team: 'VDO 6', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 5, team: 'JOVO 6', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 6, team: 'HBC 4', games: 0, wins: 0, draws: 0, losses: 0, points: 0 }
        ]
    },
    'VDO 1 Duo': {
        class: '3e klasse',
        poule: 'B',
        members: [
            'A.J. Kas (Astrid)',
            'R.M. de Boer (Richard)',
            'R.C. Peters (Roy)'
        ],
        standings: [
            { position: 1, team: 'TSTZ-Haarlem 4', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 2, team: 'Diemen 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 3, team: 'HTC 3', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 4, team: 'Rapidity 4', games: 0, wins: 0, draws: 0, losses: 0, points: 0 },
            { position: 5, team: 'VDO 1', games: 0, wins: 0, draws: 0, losses: 0, points: 0 }
        ]
    },
    'VDO 1 Jeugd': {
        class: '5e klasse',
        poule: 'C',
        members: [
            'R.G. Gibadullin (Renald)',
            'W.H. Ye (Wystan)',
            'J. Haak (Jelte)'
        ],
        standings: [
            { position: 1, team: 'HTC 2', games: 8, wins: 6, draws: 0, losses: 1, points: 27 },
            { position: 2, team: 'Het Nootwheer 1', games: 8, wins: 5, draws: 0, losses: 2, points: 25 },
            { position: 3, team: 'VDO 1 Jeugd', games: 8, wins: 6, draws: 0, losses: 2, points: 25 },
            { position: 4, team: 'Diemen 1', games: 8, wins: 4, draws: 0, losses: 3, points: 21 },
            { position: 5, team: 'Rapidity 2', games: 8, wins: 1, draws: 0, losses: 7, points: 2 }
        ]
    },
    'VDO 1 Jeugd Starters': {
        class: 'Groep A',
        poule: 'B',
        members: [
            'N.E.J.W. Lee (Nathan)',
            'O.R. Warger (Otis)',
            'K.S.D. van Dijk (Koen)',
            'R. Müller (Ryan)',
            'N. Demaret (Nina)'
        ],
        standings: []
    }
};

// Modal elements (will be initialized in DOMContentLoaded)
let modal;
let modalTeamName;
let modalTeamClass;
let modalTeamPoule;
let standingsBody;
let closeBtn;

// Handle team card click
function handleTeamCardClick(e, card) {
    e.stopPropagation();
    e.preventDefault();
    
    const teamName = card.getAttribute('data-team');
    const teamClass = card.getAttribute('data-class');
    const teamPoule = card.getAttribute('data-poule');
    
    console.log('Team card clicked!', { teamName, teamClass, teamPoule });
    
    if (modal && modalTeamName && modalTeamClass && modalTeamPoule && standingsBody) {
        console.log('Opening modal...');
        openModal(teamName, teamClass, teamPoule);
    } else {
        console.error('Modal elements not found:', {
            modal: !!modal,
            modalTeamName: !!modalTeamName,
            modalTeamClass: !!modalTeamClass,
            modalTeamPoule: !!modalTeamPoule,
            standingsBody: !!standingsBody
        });
    }
}

// Function to initialize modal functionality
function initModal() {
    // Initialize modal elements
    modal = document.getElementById('team-modal');
    modalTeamName = document.getElementById('modal-team-name');
    modalTeamClass = document.getElementById('modal-team-class');
    modalTeamPoule = document.getElementById('modal-team-poule');
    standingsBody = document.getElementById('standings-body');
    closeBtn = document.querySelector('.modal-close');

    console.log('Initializing modal...', {
        modal: !!modal,
        modalTeamName: !!modalTeamName,
        modalTeamClass: !!modalTeamClass,
        modalTeamPoule: !!modalTeamPoule,
        standingsBody: !!standingsBody
    });
    
    // Use event delegation for "Bekijk Standen" buttons (works even if buttons are added later)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.view-standings-btn');
        if (btn) {
            e.stopPropagation();
            e.preventDefault();
            
            const teamName = btn.getAttribute('data-team');
            const teamClass = btn.getAttribute('data-class');
            const teamPoule = btn.getAttribute('data-poule');
            
            console.log('View standings button clicked!', { teamName, teamClass, teamPoule });
            
            if (modal && modalTeamName && modalTeamClass && modalTeamPoule && standingsBody) {
                console.log('Opening modal...');
                openModal(teamName, teamClass, teamPoule);
            } else {
                console.error('Modal elements not found', {
                    modal: !!modal,
                    modalTeamName: !!modalTeamName,
                    modalTeamClass: !!modalTeamClass,
                    modalTeamPoule: !!modalTeamPoule,
                    standingsBody: !!standingsBody
                });
            }
        }
    });
    
    // Also add direct listeners as backup
    const viewStandingsButtons = document.querySelectorAll('.view-standings-btn');
    console.log('Found view standings buttons:', viewStandingsButtons.length);
    
    viewStandingsButtons.forEach((btn, index) => {
        const teamName = btn.getAttribute('data-team');
        console.log(`Button ${index + 1}:`, teamName);
    });
    
    // Also keep card click functionality as fallback
    const teamCards = document.querySelectorAll('.team-card');
    console.log('Found team cards:', teamCards.length);
    
    teamCards.forEach((card, index) => {
        const teamName = card.getAttribute('data-team');
        console.log(`Adding click listener to card ${index + 1}:`, teamName);
        
        // Add click listener to the card itself - use capture phase
        card.addEventListener('click', function(e) {
            // Only handle if not clicking on the button
            if (!e.target.closest('.view-standings-btn')) {
                console.log('Click detected on card:', teamName);
                handleTeamCardClick(e, this);
            }
        }, true); // Capture phase - catches clicks before they bubble
    });
    
    // Close modal when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeModal();
        });
    }
    
    // Close modal when clicking outside of it (on the backdrop)
    if (modal) {
        modal.addEventListener('click', function(e) {
            // Only close if clicking directly on the modal backdrop, not on modal-content
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Prevent modal-content clicks from closing the modal
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Initialize when DOM is ready
function initializeModalSystem() {
    // Wait a bit to ensure all elements are in the DOM
    setTimeout(() => {
        initModal();
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModalSystem);
} else {
    // DOM is already loaded
    initializeModalSystem();
}

// Also try to initialize after a short delay as fallback
setTimeout(() => {
    const buttons = document.querySelectorAll('.view-standings-btn');
    if (buttons.length > 0 && (!modal || !modalTeamName)) {
        console.log('Re-initializing modal system...');
        initModal();
    }
}, 500);

// Test function - can be called from console: testModal()
window.testModal = function() {
    console.log('Testing modal...');
    const testCard = document.querySelector('.team-card');
    if (testCard) {
        console.log('Found test card:', testCard.getAttribute('data-team'));
        const teamName = testCard.getAttribute('data-team');
        const teamClass = testCard.getAttribute('data-class');
        const teamPoule = testCard.getAttribute('data-poule');
        if (modal && modalTeamName && modalTeamClass && modalTeamPoule && standingsBody) {
            console.log('All modal elements found, opening modal...');
            openModal(teamName, teamClass, teamPoule);
        } else {
            console.error('Modal elements missing');
        }
    } else {
        console.error('No team cards found');
    }
};

// Test button click function
window.testButton = function() {
    console.log('Testing button click...');
    const btn = document.querySelector('.view-standings-btn');
    if (btn) {
        console.log('Found button:', btn.getAttribute('data-team'));
        btn.click();
    } else {
        console.error('No button found');
    }
};

function openModal(teamName, teamClass, teamPoule) {
    console.log('openModal called with:', { teamName, teamClass, teamPoule });
    
    // Re-check modal elements in case they weren't initialized
    if (!modal) {
        modal = document.getElementById('team-modal');
    }
    if (!modalTeamName) {
        modalTeamName = document.getElementById('modal-team-name');
    }
    if (!modalTeamClass) {
        modalTeamClass = document.getElementById('modal-team-class');
    }
    if (!modalTeamPoule) {
        modalTeamPoule = document.getElementById('modal-team-poule');
    }
    if (!standingsBody) {
        standingsBody = document.getElementById('standings-body');
    }
    
    if (!modal || !modalTeamName || !modalTeamClass || !modalTeamPoule || !standingsBody) {
        console.error('Modal elements not found', {
            modal: !!modal,
            modalTeamName: !!modalTeamName,
            modalTeamClass: !!modalTeamClass,
            modalTeamPoule: !!modalTeamPoule,
            standingsBody: !!standingsBody
        });
        alert('Er is een probleem met het laden van de standen. Controleer de console voor details.');
        return;
    }
    
    console.log('All modal elements found, updating content...');
    
    // Update modal header
    modalTeamName.textContent = teamName;
    modalTeamClass.textContent = teamClass;
    modalTeamPoule.textContent = teamPoule;
    
    // Get standings data
    const teamData = teamStandings[teamName];
    
    if (teamData && teamData.standings) {
        // Clear previous standings
        standingsBody.innerHTML = '';
        
        // Populate standings table
        teamData.standings.forEach(standing => {
            const row = document.createElement('tr');
            
            // Highlight VDO team
            if (standing.team === teamName) {
                row.classList.add('highlight');
            }
            
            row.innerHTML = `
                <td>${standing.position}</td>
                <td>${standing.team}</td>
                <td>${standing.games}</td>
                <td>${standing.wins || '-'}</td>
                <td>${standing.draws || '-'}</td>
                <td>${standing.losses || '-'}</td>
                <td><strong>${standing.points}</strong></td>
            `;
            
            standingsBody.appendChild(row);
        });
    } else {
        // No standings data available
        standingsBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    Standen worden binnenkort bijgewerkt
                </td>
            </tr>
        `;
    }
    
    // Show modal
    console.log('Adding active class to modal...');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    console.log('Modal should now be visible. Modal classes:', modal.className);
    console.log('Modal display style:', window.getComputedStyle(modal).display);
}

function closeModal() {
    if (!modal) {
        return;
    }
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

