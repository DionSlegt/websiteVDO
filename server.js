const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Helper function to read JSON file
function readJSONFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        const data = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return null;
    }
}

// Helper function to write JSON file
function writeJSONFile(filePath, data) {
    try {
        const fullPath = path.join(__dirname, filePath);
        const dir = path.dirname(fullPath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// API Routes

// Get home content
app.get('/api/content/home', (req, res) => {
    const data = readJSONFile('_data/home.json');
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Home content not found' });
    }
});

// Save home content
app.post('/api/content/home', (req, res) => {
    const data = req.body;
    if (writeJSONFile('_data/home.json', data)) {
        res.json({ success: true, message: 'Home content saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save home content' });
    }
});

// Get contact info
app.get('/api/content/contact', (req, res) => {
    const data = readJSONFile('_data/contact.json');
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Contact info not found' });
    }
});

// Save contact info
app.post('/api/content/contact', (req, res) => {
    const data = req.body;
    if (writeJSONFile('_data/contact.json', data)) {
        res.json({ success: true, message: 'Contact info saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save contact info' });
    }
});

// Get over content
app.get('/api/content/over', (req, res) => {
    const data = readJSONFile('_data/over.json');
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Over content not found' });
    }
});

// Save over content
app.post('/api/content/over', (req, res) => {
    const data = req.body;
    if (writeJSONFile('_data/over.json', data)) {
        res.json({ success: true, message: 'Over content saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save over content' });
    }
});

// Get meppers content
app.get('/api/content/meppers', (req, res) => {
    const data = readJSONFile('_data/meppers.json');
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Meppers content not found' });
    }
});

// Save meppers content
app.post('/api/content/meppers', (req, res) => {
    const data = req.body;
    if (writeJSONFile('_data/meppers.json', data)) {
        res.json({ success: true, message: 'Meppers content saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save meppers content' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Helper functie om te wachten tot element beschikbaar is
async function waitForElement(page, selector, timeout = 30000) {
    try {
        await page.waitForSelector(selector, { timeout });
        return true;
    } catch (error) {
        return false;
    }
}

// Helper functie om select option te selecteren
async function selectOption(page, selector, value) {
    try {
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.select(selector, value);
        await page.waitForTimeout(2000); // Wacht tot pagina geladen is
        return true;
    } catch (error) {
        console.error(`Fout bij selecteren ${value} in ${selector}:`, error.message);
        return false;
    }
}

// Helper functie om invallers te filteren
function filterInvallers(members) {
    if (!members) return [];
    return members.filter(member => !member.toLowerCase().includes('invaller'));
}

// Haal de laatste competitienaam op
async function getLatestCompetitionName(page) {
    try {
        await page.goto('https://tafeltennis.nl/landelijke-competitie-via-nas/', { waitUntil: 'networkidle2' });
        
        // Wacht op iframe en select element
        const iframeSelector = 'iframe';
        await waitForElement(page, iframeSelector, 10000);
        
        const frames = await page.frames();
        const nasFrame = frames.find(frame => frame.url().includes('nas') || frame.name() !== '');
        
        if (!nasFrame) {
            throw new Error('NAS iframe niet gevonden');
        }
        
        // Wacht op competitienaam dropdown
        const competitionSelect = 'select[name*="cnid"], select:has(option:contains("Najaarscompetitie")), select:has(option:contains("Voorjaarscompetitie"))';
        await waitForElement(nasFrame, competitionSelect, 10000);
        
        // Haal alle opties op
        const options = await nasFrame.$$eval('select option', options => 
            options.map(opt => opt.textContent.trim()).filter(text => text && text !== '-- maak uw keuze --')
        );
        
        // Vind de laatste (meest recente) competitie
        // Competities zijn meestal gesorteerd met de nieuwste eerst
        const latestCompetition = options.find(opt => 
            opt.includes('2025') || opt.includes('2026') || opt.includes('2027')
        ) || options[0];
        
        console.log('Laatste competitie gevonden:', latestCompetition);
        return latestCompetition;
    } catch (error) {
        console.error('Fout bij ophalen laatste competitienaam:', error);
        return 'Najaarscompetitie 2025'; // Fallback
    }
}

// Haal standen op voor een poule
async function getStandingsForPoule(nasFrame) {
    try {
        const standings = await nasFrame.evaluate(() => {
            const results = [];
            // Zoek naar standen tabel - probeer verschillende selectors
            let rows = Array.from(document.querySelectorAll('table tr'));
            
            // Als geen rijen gevonden, probeer andere selectors
            if (rows.length === 0) {
                rows = Array.from(document.querySelectorAll('tr'));
            }
            
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 3) {
                    const position = cells[0]?.textContent.trim();
                    const teamName = cells[1]?.textContent.trim();
                    // Probeer verschillende kolommen voor games en points
                    let games = cells[2]?.textContent.trim();
                    let points = cells[cells.length - 1]?.textContent.trim();
                    
                    // Als points niet in laatste kolom, zoek naar kolom met punten
                    if (!points || isNaN(parseInt(points))) {
                        for (let i = cells.length - 1; i >= 0; i--) {
                            const val = cells[i]?.textContent.trim();
                            if (val && !isNaN(parseInt(val)) && parseInt(val) > 0) {
                                points = val;
                                break;
                            }
                        }
                    }
                    
                    if (position && teamName && !isNaN(parseInt(position))) {
                        results.push({
                            position: parseInt(position),
                            team: teamName,
                            games: parseInt(games) || 0,
                            points: parseInt(points) || 0
                        });
                    }
                }
            });
            
            return results;
        });
        
        return standings;
    } catch (error) {
        console.error('Fout bij ophalen standen:', error);
        return [];
    }
}

// Haal teamleden op voor een team
async function getTeamMembers(nasFrame, teamLink) {
    try {
        // Klik op team link
        await nasFrame.click(`a[href="${teamLink}"]`);
        await nasFrame.waitForTimeout(3000);
        
        const members = await nasFrame.evaluate(() => {
            const memberList = [];
            // Zoek naar teamleden in de pagina
            const text = document.body.textContent;
            const lines = text.split('\n');
            
            lines.forEach(line => {
                // Zoek naar patroon: "nummer naam (naam) stats"
                const match = line.match(/(\d+)\s+([A-Z]\.\s*[A-Z]\.?\s*[A-Za-z]+)\s*\(([^)]+)\)/);
                if (match) {
                    const fullName = match[2].trim();
                    const shortName = match[3].trim();
                    memberList.push(`${fullName} (${shortName})`);
                }
            });
            
            return memberList;
        });
        
        // Ga terug
        await nasFrame.goBack();
        await nasFrame.waitForTimeout(2000);
        
        return filterInvallers(members);
    } catch (error) {
        console.error('Fout bij ophalen teamleden:', error);
        return [];
    }
}

// Haal alle VDO teams op voor een competitiegroep
async function getVDOTeamsForGroup(page, competitionName, groupName) {
    const teams = {};
    
    try {
        // Navigeer naar de NAS pagina
        await page.goto('https://tafeltennis.nl/landelijke-competitie-via-nas/', { waitUntil: 'networkidle2' });
        await page.waitForTimeout(3000);
        
        // Wacht op iframes
        const frames = await page.frames();
        let nasFrame = null;
        
        // Zoek naar het juiste iframe (meestal de tweede of derde)
        for (const frame of frames) {
            try {
                const selectExists = await frame.$('select') !== null;
                if (selectExists) {
                    nasFrame = frame;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!nasFrame) {
            console.log('NAS iframe niet gevonden voor', groupName);
            return teams;
        }
        
        // Selecteer competitienaam (gebruik text matching)
        const competitionSelect = await nasFrame.$('select');
        if (competitionSelect) {
            const options = await nasFrame.$$eval('select option', opts => 
                opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
            );
            const competitionOption = options.find(o => o.text === competitionName);
            if (competitionOption) {
                await nasFrame.select('select', competitionOption.value);
                await page.waitForTimeout(2000);
            }
        }
        
        // Selecteer competitiegroep
        const groupSelects = await nasFrame.$$('select');
        if (groupSelects.length > 1) {
            const groupOptions = await nasFrame.$$eval('select:nth-of-type(2) option', opts =>
                opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
            );
            const groupOption = groupOptions.find(o => o.text === groupName);
            if (groupOption) {
                await nasFrame.select('select:nth-of-type(2)', groupOption.value);
                await page.waitForTimeout(2000);
            }
        }
        
        // Selecteer weergave - gebruik "Standen" voor betere scraping
        const viewOptions = await nasFrame.$$eval('select:nth-of-type(3) option', opts =>
            opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
        );
        const viewOption = viewOptions.find(o => o.text.includes('Standen'));
        if (viewOption) {
            await nasFrame.select('select:nth-of-type(3)', viewOption.value);
            await page.waitForTimeout(2000);
        }
        
        // Selecteer VDO filter
        const filterOptions = await nasFrame.$$eval('select:nth-of-type(4) option', opts =>
            opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
        );
        const vdoOption = filterOptions.find(o => o.text === 'VDO');
        if (vdoOption) {
            await nasFrame.select('select:nth-of-type(4)', vdoOption.value);
            await page.waitForTimeout(3000);
        }
        
        // Haal poules op
        const pouleSelect = await nasFrame.$('select:last-of-type');
        if (pouleSelect) {
            const poules = await nasFrame.$$eval('select:last-of-type option', opts =>
                opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
                    .filter(o => o.text && o.text !== '-- maak uw keuze --')
            );
            
            // Voor elke poule
            for (const poule of poules) {
                await nasFrame.select('select:last-of-type', poule.value);
                await page.waitForTimeout(3000);
                
                // Haal standen op
                const standings = await getStandingsForPoule(nasFrame);
                
                // Vind VDO teams in de standen
                const vdoStandings = standings.filter(s => s.team.includes('VDO'));
                
                for (const standing of vdoStandings) {
                    const teamName = standing.team;
                    if (!teams[teamName]) {
                        teams[teamName] = {
                            class: poule.text.split(' - ')[0] || '',
                            poule: poule.text.split(' - ')[1] || poule.text,
                            members: [],
                            standings: []
                        };
                    }
                    
                    // Voeg standen toe
                    teams[teamName].standings = standings;
                }
            }
        }
        
    } catch (error) {
        console.error(`Fout bij ophalen teams voor ${groupName}:`, error.message);
    }
    
    return teams;
}

// Teams update endpoint - haalt automatisch de laatste competitie op en werkt teams/standen bij
app.post('/api/teams/update', async (req, res) => {
    let browser = null;
    
    try {
        console.log('Teams update aangevraagd...');
        
        // Start browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Haal laatste competitienaam op
        const latestCompetition = await getLatestCompetitionName(page);
        console.log('Gebruik competitie:', latestCompetition);
        
        // Lijst van alle competitiegroepen om te doorzoeken
        const competitionGroups = [
            'Holland-Noord - Senioren',
            'Holland-Noord - Senioren Duo',
            'Holland-Noord - Jeugd',
            'Holland-Noord - Jeugd Starters',
            // Voeg meer groepen toe indien nodig
        ];
        
        const allTeams = {};
        
        // Doorzoek elke competitiegroep
        for (const group of competitionGroups) {
            console.log(`Doorzoeken ${group}...`);
            const teams = await getVDOTeamsForGroup(page, latestCompetition, group);
            
            // Merge teams in allTeams
            Object.keys(teams).forEach(teamName => {
                allTeams[teamName] = {
                    ...teams[teamName],
                    competition: latestCompetition,
                    group: group
                };
            });
        }
        
        await browser.close();
        
        res.json({
            success: true,
            message: 'Teams data opgehaald',
            teams: allTeams,
            lastUpdate: new Date().toISOString(),
            competition: latestCompetition
        });
        
    } catch (error) {
        console.error('Fout bij teams update:', error);
        
        if (browser) {
            await browser.close();
        }
        
        res.status(500).json({
            success: false,
            error: error.message,
            note: 'Controleer of puppeteer correct is geïnstalleerd: npm install'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📝 Admin editor: http://localhost:${PORT}/admin-simple.html`);
    console.log(`🌐 Website: http://localhost:${PORT}/index.html`);
    console.log(`🔄 Teams auto-update: POST /api/teams/update`);
});

