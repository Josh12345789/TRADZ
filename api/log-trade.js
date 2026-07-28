export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { day, lots, bias, result, pnl } = req.body;

    const NOTION_KEY = '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';
    const DATABASE_ID = '33bbaf12ae92807a8795eaafeac879cc';

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
            console.error('Notion API Error:', data);
            return res.status(response.status).json({ success: false, error: data.message });
        }

        return res.status(200).json({ success: true, pageId: data.id });
    } catch (error) {
        console.error('Serverless Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}