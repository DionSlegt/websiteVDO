const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📝 Admin editor: http://localhost:${PORT}/admin-simple.html`);
    console.log(`🌐 Website: http://localhost:${PORT}/index.html`);
});

