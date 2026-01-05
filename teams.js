// Functie om standen op te halen van de NTTB site
// Let op: Dit werkt mogelijk niet vanwege CORS-beperkingen
// Als alternatief kan de data handmatig worden bijgewerkt in de teamStandings object hieronder
async function fetchStandingsFromNTTB(teamClass, poule) {
    try {
        // De NAS competitie pagina URL
        const nasUrl = 'https://holland-noord.nttb.nl/competities/regiocompetitie-in-nas/';
        
        // Probeer de data op te halen via een CORS proxy (dit is een tijdelijke oplossing)
        // In productie zou je een eigen backend/proxy moeten gebruiken
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(nasUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        // Parse de HTML om de standen te extraheren
        // Dit is complex omdat de data in een iframe staat
        // Voor nu retourneren we null en gebruiken we de fallback data
        
        return null; // Data parsing niet geïmplementeerd vanwege complexiteit
    } catch (error) {
        console.error('Fout bij ophalen standen:', error);
        return null;
    }
}

// Helper functie om invallers te filteren uit teamleden
function filterInvallers(members) {
    if (!members) return [];
    return members.filter(member => !member.toLowerCase().includes('invaller'));
}

// Automatisch update systeem voor teams en standen
// Dit systeem checkt periodiek de laatste competitie en werkt teams/standen bij

// API base URL - gebruik backend server als beschikbaar
const API_BASE = window.location.port === '3000' ? '/api' : (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api');

// Laatste update timestamp
let lastUpdateTime = localStorage.getItem('teamsLastUpdate');
let updateInterval = null;

/**
 * Vraag de backend aan om alle VDO teams en standen op te halen voor de laatste competitie
 * @returns {Promise<Object>} Object met alle teams data
 */
async function fetchLatestTeamsData() {
    try {
        const response = await fetch(`${API_BASE}/teams/update`, {
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

/**
 * Update de teams data in de applicatie
 * @param {Object} newData - Nieuwe teams data van de backend
 */
function updateTeamsData(newData) {
    if (!newData || !newData.teams) {
        console.log('Geen nieuwe data om bij te werken');
        return;
    }
    
    // Update teamStandings object
    Object.keys(newData.teams).forEach(teamName => {
        teamStandings[teamName] = newData.teams[teamName];
    });
    
    // Update HTML met nieuwe teams
    updateTeamsHTML(newData.teams);
    
    // Sla update tijd op
    lastUpdateTime = new Date().toISOString();
    localStorage.setItem('teamsLastUpdate', lastUpdateTime);
    localStorage.setItem('teamsData', JSON.stringify(newData.teams));
    
    console.log('Teams data bijgewerkt:', new Date().toLocaleString('nl-NL'));
}

/**
 * Update de HTML met nieuwe teams
 * @param {Object} teams - Teams data object
 */
function updateTeamsHTML(teams) {
    // Dit wordt aangeroepen wanneer teams worden toegevoegd of verwijderd
    // Voor nu loggen we alleen, in de toekomst kunnen we de DOM dynamisch updaten
    console.log('Teams HTML zou moeten worden bijgewerkt met:', Object.keys(teams));
}

/**
 * Check of er een update nodig is (elke 24 uur)
 */
async function checkForUpdates() {
    const now = new Date();
    const lastUpdate = lastUpdateTime ? new Date(lastUpdateTime) : null;
    
    // Check of er 24 uur zijn verstreken sinds laatste update
    const hoursSinceUpdate = lastUpdate 
        ? (now - lastUpdate) / (1000 * 60 * 60)
        : 24; // Als geen laatste update, update nu
    
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

/**
 * Start het automatische update systeem
 */
function startAutoUpdate() {
    // Check direct bij laden
    checkForUpdates();
    
    // Check elke 6 uur op updates
    updateInterval = setInterval(() => {
        checkForUpdates();
    }, 6 * 60 * 60 * 1000); // 6 uur in milliseconden
    
    console.log('Automatisch update systeem gestart');
}

/**
 * Stop het automatische update systeem
 */
function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('Automatisch update systeem gestopt');
    }
}

// Laad opgeslagen data bij start
if (lastUpdateTime) {
    const savedData = localStorage.getItem('teamsData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            // Merge met bestaande data (niet overschrijven)
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

// Start automatische updates wanneer de pagina laadt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoUpdate);
} else {
    startAutoUpdate();
}

// Team Standings Data
// Bijgewerkt op basis van Najaarscompetitie 2025 - Holland-Noord - Senioren
// Bron: https://tafeltennis.nl/landelijke-competitie-via-nas/
const teamStandings = {
    'VDO 1': {
        class: 'Overgangsklasse',
        poule: 'A',
        members: [
            'P.H.L. Bakker (Paul)',
            'D. Slegt (Dion)',
            'M. van Dijk (Martijn)',
            'L. Hoogland (Lars)'
        ],
        standings: [
            { position: 1, team: 'HBC 1', games: 8, wins: 5, draws: 2, losses: 1, points: 58 },
            { position: 2, team: "Amsterdam '78 4", games: 8, wins: 4, draws: 1, losses: 2, points: 46 },
            { position: 3, team: 'VDO 1', games: 8, wins: 2, draws: 1, losses: 4, points: 36 },
            { position: 4, team: 'Spaarne 1', games: 8, wins: 1, draws: 4, losses: 2, points: 35 },
            { position: 5, team: 'HTC 2', games: 8, wins: 1, draws: 1, losses: 5, points: 25 }
        ]
    },
    'VDO 2': {
        class: '1e klasse',
        poule: 'D',
        members: [
            'R. Vos (Richard)',
            'D. Demaret (Daniël)',
            'H. Sanlitürk (Hakan)',
            'P.R. Peters (Per)'
        ],
        standings: [
            { position: 1, team: 'Tempo-Team 8', games: 10, wins: 7, draws: 0, losses: 2, points: 70 },
            { position: 2, team: 'US 3', games: 10, wins: 5, draws: 1, losses: 3, points: 53 },
            { position: 3, team: "Amsterdam '78 8", games: 10, wins: 5, draws: 0, losses: 4, points: 50 },
            { position: 4, team: 'Esopus 1', games: 10, wins: 4, draws: 1, losses: 4, points: 48 },
            { position: 5, team: 'Noordkop 1', games: 10, wins: 3, draws: 1, losses: 5, points: 46 },
            { position: 6, team: 'VDO 2', games: 10, wins: 2, draws: 1, losses: 7, points: 33 }
        ]
    },
    'VDO 3': {
        class: '3e klasse',
        poule: 'G',
        members: [
            'S.T. Visser (Sjoerd)',
            'J.M. Filius (Joscha)',
            'S. van der Wal (Stefan)',
            'L. Hu (Leo)'
        ],
        standings: [
            { position: 1, team: 'VDO 3', games: 10, wins: 7, draws: 1, losses: 2, points: 66 },
            { position: 2, team: 'TTV SDO 3', games: 10, wins: 5, draws: 1, losses: 4, points: 59 },
            { position: 3, team: 'TSO 2', games: 10, wins: 5, draws: 2, losses: 3, points: 56 },
            { position: 4, team: 'Holendrecht 1', games: 10, wins: 3, draws: 3, losses: 4, points: 48 },
            { position: 5, team: "Amsterdam '78 14", games: 10, wins: 4, draws: 0, losses: 6, points: 47 },
            { position: 6, team: 'Tempo-Team 15', games: 10, wins: 1, draws: 0, losses: 9, points: 24 }
        ]
    },
    'VDO 4': {
        class: '3e klasse',
        poule: 'D',
        members: [
            'R.A. van der Jagt (René)',
            'A.J. Kas (Astrid)',
            'M.F. van Rossum (Maarten)',
            'R.E. Wouters (Rob)'
        ],
        standings: [
            { position: 1, team: 'Amstelveen 3', games: 8, wins: 6, draws: 0, losses: 2, points: 57 },
            { position: 2, team: 'HTC 6', games: 8, wins: 5, draws: 1, losses: 2, points: 55 },
            { position: 3, team: 'VDO 4', games: 8, wins: 3, draws: 1, losses: 4, points: 41 },
            { position: 4, team: 'TTAZ 2', games: 8, wins: 3, draws: 0, losses: 5, points: 28 },
            { position: 5, team: 'ZTTC 5', games: 8, wins: 1, draws: 0, losses: 7, points: 19 }
        ]
    },
    'VDO 5': {
        class: '4e klasse',
        poule: 'G',
        members: [
            'T. Valkenburg (Teun)',
            'J. Flach (Joost)',
            'R.R. Allard (Ragnar)',
            'J.J.M. van der Wal (Jan)'
        ],
        standings: [
            { position: 1, team: 'VDO 5', games: 10, wins: 9, draws: 0, losses: 1, points: 78 },
            { position: 2, team: 'Tempo-Team 19', games: 10, wins: 8, draws: 0, losses: 2, points: 74 },
            { position: 3, team: 'Diemen 1', games: 10, wins: 5, draws: 0, losses: 5, points: 51 },
            { position: 4, team: 'ZTTC 7', games: 10, wins: 4, draws: 1, losses: 5, points: 43 },
            { position: 5, team: 'JOVO 6', games: 10, wins: 2, draws: 0, losses: 8, points: 31 },
            { position: 6, team: 'Spaarne 2', games: 10, wins: 1, draws: 0, losses: 9, points: 23 }
        ]
    },
    'VDO 1 Duo': {
        class: '3e klasse',
        poule: 'A',
        members: [
            'R.C. Peters (Roy)',
            'A.J. Kas (Astrid)',
            'R.M. de Boer (Richard)'
        ],
        standings: [
            { position: 1, team: 'Rapidity 1', games: 8, wins: 6, draws: 0, losses: 2, points: 27 },
            { position: 2, team: 'Amstelveen 2', games: 8, wins: 5, draws: 0, losses: 3, points: 21 },
            { position: 3, team: 'VDO 1 Duo', games: 8, wins: 4, draws: 0, losses: 4, points: 19 },
            { position: 4, team: 'US 3', games: 8, wins: 4, draws: 0, losses: 4, points: 19 },
            { position: 5, team: 'Castricum 2', games: 8, wins: 2, draws: 0, losses: 6, points: 14 }
        ]
    },
    'VDO 1 Jeugd': {
        class: 'Klasse A',
        poule: 'B',
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
    }
};

// Modal elements
const modal = document.getElementById('team-modal');
const modalTeamName = document.getElementById('modal-team-name');
const modalTeamClass = document.getElementById('modal-team-class');
const modalTeamPoule = document.getElementById('modal-team-poule');
const standingsBody = document.getElementById('standings-body');
const closeBtn = document.querySelector('.modal-close');

// Open modal when team card is clicked
document.addEventListener('DOMContentLoaded', function() {
    const teamCards = document.querySelectorAll('.team-card');
    
    teamCards.forEach(card => {
        card.addEventListener('click', function() {
            const teamName = this.getAttribute('data-team');
            const teamClass = this.getAttribute('data-class');
            const teamPoule = this.getAttribute('data-poule');
            
            openModal(teamName, teamClass, teamPoule);
        });
    });
    
    // Close modal when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside of it
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});

function openModal(teamName, teamClass, teamPoule) {
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
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

