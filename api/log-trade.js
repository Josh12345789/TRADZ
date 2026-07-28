export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { title, date, asset, type, bias, result, tp, pnl } = req.body;

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
                    'Name': {
                        title: [{ text: { content: title || 'New Trade' } }]
                    },
                    'Date': {
                        date: { start: date || new Date().toISOString().split('T')[0] }
                    },
                    'asset': {
                        select: { name: asset || 'sp500' }
                    },
                    'Type': {
                        select: { name: type || 'Buy' }
                    },
                    'Bias': {
                        select: { name: bias || 'Bullish' }
                    },
                    'Result': {
                        select: { name: result || 'Win' }
                    },
                    'Tp': {
                        select: { name: tp || 'High' }
                    },
                    'PNL': {
                        number: parseFloat(pnl) || 0
                    }
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Notion Insert Error:', data);
            return res.status(response.status).json({ success: false, error: data.message });
        }

        return res.status(200).json({ success: true, pageId: data.id });
    } catch (error) {
        console.error('Serverless Log Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
