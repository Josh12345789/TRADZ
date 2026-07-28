export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

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

            // Extract Name/Title
            const titleProp = props.Name || props.Title || Object.values(props).find(p => p.type === 'title');
            const titleText = titleProp?.title?.[0]?.text?.content || 'Untitled Trade';

            // Extract Date
            const dateVal = props.Date?.date?.start || 'N/A';

            // Extract Select values (case-sensitive mapping based on Notion screenshot)
            const assetVal = props.asset?.select?.name || props.asset?.rich_text?.[0]?.text?.content || 'N/A';
            const typeVal = props.Type?.select?.name || props.Type?.rich_text?.[0]?.text?.content || 'N/A';
            const biasVal = props.Bias?.select?.name || props.Bias?.rich_text?.[0]?.text?.content || 'N/A';
            const resultVal = props.Result?.select?.name || props.Result?.rich_text?.[0]?.text?.content || 'N/A';
            const tpVal = props.Tp?.select?.name || props.Tp?.rich_text?.[0]?.text?.content || 'N/A';

            // Extract PNL (Number)
            const pnlVal = props.PNL?.number ?? 0;

            return {
                id: page.id,
                title: titleText,
                date: dateVal,
                asset: assetVal,
                type: typeVal,
                bias: biasVal,
                result: resultVal,
                tp: tpVal,
                pnl: pnlVal
            };
        });

        return res.status(200).json({ success: true, trades });

    } catch (error) {
        console.error('Serverless Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
