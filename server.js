const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '32kb' }));
app.use(express.static('.')); // Serve static files from current directory

const intakeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Het versturen is niet gelukt. Probeer het opnieuw.' }
});

const INTEREST_OPTIONS = ['Recreatief spelen', 'Training', 'Competitie', 'Proeftraining'];
const EVENING_OPTIONS = ['Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];

function sanitizePlainText(value, maxLength) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .replace(/[<>]/g, '')
        .trim()
        .slice(0, maxLength);
}

function escapeForEmail(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120;
}

function normalizeChoiceList(value, allowed) {
    if (!Array.isArray(value)) return [];
    return [...new Set(
        value
            .filter((item) => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => allowed.includes(item))
    )];
}

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

// Intake form submission
app.post('/api/intake', intakeLimiter, async (req, res) => {
    try {
        const body = req.body || {};

        // Honeypot: bots that fill this field get rejected silently-ish
        if (sanitizePlainText(body.website || body.honeypot || '', 200)) {
            return res.status(400).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        const name = sanitizePlainText(body.name, 100);
        const email = sanitizePlainText(body.email, 120).toLowerCase();
        const phone = sanitizePlainText(body.phone || '', 40);
        const playedBeforeRaw = sanitizePlainText(body.playedBefore, 10).toLowerCase();
        const experience = sanitizePlainText(body.experience || '', 500);
        const remarks = sanitizePlainText(body.remarks || '', 1000);
        const interests = normalizeChoiceList(body.interests, INTEREST_OPTIONS);
        const evenings = normalizeChoiceList(body.evenings, EVENING_OPTIONS);

        if (!name || !isValidEmail(email)) {
            return res.status(400).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        if (playedBeforeRaw !== 'ja' && playedBeforeRaw !== 'nee') {
            return res.status(400).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        if (interests.length === 0 || evenings.length === 0) {
            return res.status(400).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        if (playedBeforeRaw === 'nee' && experience) {
            // Experience should only be set when played before = ja
            // Ignore unexpected experience when "nee"
        }

        const experienceText =
            playedBeforeRaw === 'ja'
                ? (experience || 'Niet ingevuld')
                : 'Niet ingevuld';

        const apiKey = process.env.RESEND_API_KEY;
        const receiver = process.env.INTAKE_RECEIVER_EMAIL;

        if (!apiKey || !receiver) {
            console.error('Intake mail misconfigured: missing env vars', {
                hasApiKey: Boolean(apiKey),
                hasReceiver: Boolean(receiver)
            });
            return res.status(500).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        const resend = new Resend(apiKey);
        const fromAddress =
            process.env.INTAKE_FROM_EMAIL ||
            'VDO Uithoorn <onboarding@resend.dev>';

        const plainBody = [
            'Nieuwe intake via de VDO-website',
            '',
            'Naam:',
            name,
            '',
            'E-mailadres:',
            email,
            '',
            'Telefoonnummer:',
            phone || 'Niet ingevuld',
            '',
            'Eerder getafeltennist:',
            playedBeforeRaw,
            '',
            'Ervaring:',
            experienceText,
            '',
            'Interesse:',
            interests.join(', '),
            '',
            'Beschikbare avonden:',
            evenings.join(', '),
            '',
            'Opmerkingen:',
            remarks || 'Geen opmerkingen'
        ].join('\n');

        const htmlBody = `
            <p><strong>Nieuwe intake via de VDO-website</strong></p>
            <p><strong>Naam:</strong><br>${escapeForEmail(name)}</p>
            <p><strong>E-mailadres:</strong><br>${escapeForEmail(email)}</p>
            <p><strong>Telefoonnummer:</strong><br>${escapeForEmail(phone || 'Niet ingevuld')}</p>
            <p><strong>Eerder getafeltennist:</strong><br>${escapeForEmail(playedBeforeRaw)}</p>
            <p><strong>Ervaring:</strong><br>${escapeForEmail(experienceText)}</p>
            <p><strong>Interesse:</strong><br>${escapeForEmail(interests.join(', '))}</p>
            <p><strong>Beschikbare avonden:</strong><br>${escapeForEmail(evenings.join(', '))}</p>
            <p><strong>Opmerkingen:</strong><br>${escapeForEmail(remarks || 'Geen opmerkingen')}</p>
        `;

        const { error } = await resend.emails.send({
            from: fromAddress,
            to: [receiver],
            replyTo: email,
            subject: `Nieuwe intake via de VDO-website – ${name}`,
            text: plainBody,
            html: htmlBody
        });

        if (error) {
            console.error('Intake mail send failed', {
                name: error.name,
                message: error.message,
                statusCode: error.statusCode
            });
            return res.status(500).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('Intake route error', {
            name: err?.name,
            message: err?.message,
            statusCode: err?.statusCode
        });
        return res.status(500).json({
            error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📝 Admin editor: http://localhost:${PORT}/admin-simple.html`);
    console.log(`🌐 Website: http://localhost:${PORT}/index.html`);
});

