// api/ia.js — Vercel Serverless Function
// Proxy para la API de Claude (evita CORS del navegador)
// © 2025 Javier González Rodríguez

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { system, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Variable de entorno en Vercel
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: system || 'Eres un asistente de citas.',
        messages: messages.slice(-10) // Últimos 10 mensajes para no exceder tokens
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(response.status).json({ error: 'API error', details: err });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

