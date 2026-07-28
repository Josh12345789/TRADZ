const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// API Key and Database Configuration
const NOTION_KEY = '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';
const DATABASE_ID = '33bbaf12ae92807a8795eaafeac879cc';

app.post('/api/log-trade', async (req, res) => {
    const { day, lots, bias, result, pnl } = req.body;

    try {
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: { database_id: DATABASE_ID },
                properties: {
                    'Day': {
                        title: [{ text: { content: day || 'N/A' } }]
                    },
                    'Lots': {
                        number: parseFloat(lots) || 0
                    },
                    'Bias': {
                        select: { name: bias || 'NEUTRAL' }
                    },
                    'Result': {
                        select: { name: result || 'EXECUTION' }
                    },
                    'PnL': {
                        number: parseFloat(pnl) || 0
                    }
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Notion API Error Detail:', data);
            return res.status(response.status).json({ success: false, error: data.message });
        }

        res.status(200).json({ success: true, pageId: data.id });
    } catch (error) {
        console.error('Server Internal Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`TRADEZ Notion Bridge operational on http://localhost:${PORT}`);
});