export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const NOTION_KEY = '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';
    const DATABASE_ID = '33bbaf12ae92807a8795eaafeac879cc';

    try {
        const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Notion Fetch Error:', data);
            return res.status(response.status).json({ success: false, error: data.message });
        }

        // Format Notion page objects into simple JS objects
        const trades = data.results.map(page => {
            const props = page.properties;
            return {
                id: page.id,
                day: props.Day?.title[0]?.text?.content || 'N/A',
                lots: props.Lots?.number ?? 0,
                bias: props.Bias?.select?.name || 'NEUTRAL',
                result: props.Result?.select?.name || 'EXECUTION',
                pnl: props.PnL?.number ?? 0
            };
        });

        return res.status(200).json({ success: true, trades });
    } catch (error) {
        console.error('Serverless Fetch Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}