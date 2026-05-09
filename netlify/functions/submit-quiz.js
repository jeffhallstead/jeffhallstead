exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_API_TOKEN;
  const BASE_ID  = 'appIbbAkkBtxHFn3R';
  const TABLE_ID = 'tbloqkiW7KdxQDlJW';

  if (!AIRTABLE_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing Airtable token' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const fields = {
    'Name':               body.name || '',
    'Email':              body.email || '',
    'Mode':               body.mode === 'own' ? 'Own Brand' : 'Client Brand',
    'Overall Score':      body.overallScore,
    'Tier':               body.tier,
    'Profile Headline':   body.headline,
    'Narrative Score':    body.narrativeScore,
    'Engine Score':       body.engineScore,
    'Distribution Score': body.distributionScore,
    'Commerce Score':     body.commerceScore,
    'CTA Recommendation': body.ctaRecommendation,
    'Submitted At':       new Date().toISOString(),
  };

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Airtable error');
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
