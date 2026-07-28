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

        const trades = data.results.map(page => {
            const props = page.properties;

            // Extract primary title (handles 'Day', 'Name', or primary Title column)
            const dayProp = props.Day || props.Name || Object.values(props).find(p => p.type === 'title');
            const dayText = dayProp?.title?.[0]?.text?.content 
                         || dayProp?.rich_text?.[0]?.text?.content 
                         || 'N/A';

            // Extract numeric & select fields
            const lots = props.Lots?.number ?? props.Lots?.number ?? 0;
            const bias = props.Bias?.select?.name || props.Bias?.rich_text?.[0]?.text?.content || 'NEUTRAL';
            const result = props.Result?.select?.name || props.Result?.rich_text?.[0]?.text?.content || 'EXECUTION';
            const pnl = props.PnL?.number ?? props['P&L']?.number ?? 0;

            return {
                id: page.id,
                day: dayText,
                lots: lots,
                bias: bias,
                result: result,
                pnl: pnl
            };
        });

        return res.status(200).json({ success: true, trades });
    } catch (error) {
        console.error('Serverless Fetch Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
