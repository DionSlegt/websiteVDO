const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Render / reverse proxies zetten X-Forwarded-For
app.set('trust proxy', 1);

// Basis security headers (zonder helmet package)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '32kb' }));
app.use(express.static('.')); // Serve static files from current directory

// Pretty URL for privacy page (static serves /privacy.html, not /privacy)
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

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

function parseChildAge(value) {
    if (typeof value === 'number') {
        if (!Number.isInteger(value) || value < 1 || value > 17) return null;
        return value;
    }
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!/^\d{1,2}$/.test(trimmed)) return null;
    const age = Number(trimmed);
    if (!Number.isInteger(age) || age < 1 || age > 17) return null;
    return age;
}

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

        const intakeFor = sanitizePlainText(body.intakeFor, 10).toLowerCase();
        const playedBeforeRaw = sanitizePlainText(body.playedBefore, 10).toLowerCase();
        const experience = sanitizePlainText(body.experience || '', 500);
        const remarks = sanitizePlainText(body.remarks || '', 1000);
        const interests = normalizeChoiceList(body.interests, INTEREST_OPTIONS);
        const evenings = normalizeChoiceList(body.evenings, EVENING_OPTIONS);

        if (intakeFor !== 'self' && intakeFor !== 'child') {
            return res.status(400).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        let contactName = '';
        let contactEmail = '';
        let contactPhone = '';
        let parentName = '';
        let childName = '';
        let childAge = null;

        if (intakeFor === 'self') {
            contactName = sanitizePlainText(body.name, 100);
            contactEmail = sanitizePlainText(body.email, 120).toLowerCase();
            contactPhone = sanitizePlainText(body.phone || '', 40);

            if (!contactName || !isValidEmail(contactEmail)) {
                return res.status(400).json({
                    error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
                });
            }
        } else {
            parentName = sanitizePlainText(body.parentName, 100);
            contactEmail = sanitizePlainText(body.parentEmail, 120).toLowerCase();
            contactPhone = sanitizePlainText(body.parentPhone || '', 40);
            childName = sanitizePlainText(body.childName, 100);
            childAge = parseChildAge(body.childAge);
            contactName = parentName;

            if (
                !parentName ||
                !isValidEmail(contactEmail) ||
                childAge === null
            ) {
                return res.status(400).json({
                    error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
                });
            }
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

        const experienceText =
            playedBeforeRaw === 'ja'
                ? (experience || 'Niet ingevuld')
                : 'Niet ingevuld';

        const apiKey = process.env.RESEND_API_KEY;
        const configuredReceiver = sanitizePlainText(
            process.env.INTAKE_RECEIVER_EMAIL || '',
            120
        ).toLowerCase();
        const receiver = isValidEmail(configuredReceiver)
            ? configuredReceiver
            : 'vdotest@outlook.com';

        if (!apiKey) {
            console.error('Intake mail misconfigured: missing env vars', {
                hasApiKey: false,
                hasReceiver: Boolean(receiver)
            });
            return res.status(500).json({
                error: 'Het versturen is niet gelukt. Probeer het opnieuw.'
            });
        }

        if (!isValidEmail(configuredReceiver) && process.env.INTAKE_RECEIVER_EMAIL) {
            console.error('Intake mail misconfigured: invalid INTAKE_RECEIVER_EMAIL format');
        }

        const resend = new Resend(apiKey);
        const fromAddress =
            process.env.INTAKE_FROM_EMAIL ||
            'VDO Uithoorn <onboarding@resend.dev>';

        const intakeForLabel = intakeFor === 'child' ? 'kind' : 'mijzelf';
        const childNameDisplay = childName || 'Niet ingevuld';
        const subjectName =
            intakeFor === 'child' ? `kind: ${childNameDisplay}` : contactName;

        const contactPlainLines =
            intakeFor === 'child'
                ? [
                      'Intake voor:',
                      intakeForLabel,
                      '',
                      'Naam ouder/verzorger:',
                      parentName,
                      '',
                      'E-mailadres ouder/verzorger:',
                      contactEmail,
                      '',
                      'Telefoonnummer ouder/verzorger:',
                      contactPhone || 'Niet ingevuld',
                      '',
                      'Naam kind:',
                      childNameDisplay,
                      '',
                      'Leeftijd kind:',
                      String(childAge)
                  ]
                : [
                      'Intake voor:',
                      intakeForLabel,
                      '',
                      'Naam:',
                      contactName,
                      '',
                      'E-mailadres:',
                      contactEmail,
                      '',
                      'Telefoonnummer:',
                      contactPhone || 'Niet ingevuld'
                  ];

        const plainBody = [
            'Nieuwe intake via de VDO-website',
            '',
            ...contactPlainLines,
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

        const contactHtml =
            intakeFor === 'child'
                ? `
            <p><strong>Intake voor:</strong><br>${escapeForEmail(intakeForLabel)}</p>
            <p><strong>Naam ouder/verzorger:</strong><br>${escapeForEmail(parentName)}</p>
            <p><strong>E-mailadres ouder/verzorger:</strong><br>${escapeForEmail(contactEmail)}</p>
            <p><strong>Telefoonnummer ouder/verzorger:</strong><br>${escapeForEmail(contactPhone || 'Niet ingevuld')}</p>
            <p><strong>Naam kind:</strong><br>${escapeForEmail(childNameDisplay)}</p>
            <p><strong>Leeftijd kind:</strong><br>${escapeForEmail(String(childAge))}</p>
                `
                : `
            <p><strong>Intake voor:</strong><br>${escapeForEmail(intakeForLabel)}</p>
            <p><strong>Naam:</strong><br>${escapeForEmail(contactName)}</p>
            <p><strong>E-mailadres:</strong><br>${escapeForEmail(contactEmail)}</p>
            <p><strong>Telefoonnummer:</strong><br>${escapeForEmail(contactPhone || 'Niet ingevuld')}</p>
                `;

        const htmlBody = `
            <p><strong>Nieuwe intake via de VDO-website</strong></p>
            ${contactHtml}
            <p><strong>Eerder getafeltennist:</strong><br>${escapeForEmail(playedBeforeRaw)}</p>
            <p><strong>Ervaring:</strong><br>${escapeForEmail(experienceText)}</p>
            <p><strong>Interesse:</strong><br>${escapeForEmail(interests.join(', '))}</p>
            <p><strong>Beschikbare avonden:</strong><br>${escapeForEmail(evenings.join(', '))}</p>
            <p><strong>Opmerkingen:</strong><br>${escapeForEmail(remarks || 'Geen opmerkingen')}</p>
        `;

        const { error } = await resend.emails.send({
            from: fromAddress,
            to: [receiver],
            replyTo: contactEmail,
            subject: `Nieuwe intake via de VDO-website – ${subjectName}`,
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

