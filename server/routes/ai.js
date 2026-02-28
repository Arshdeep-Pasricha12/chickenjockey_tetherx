const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST /api/ai/explain
router.post('/explain', async (req, res) => {
  try {
    const { faultCode, context, telemetry } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
       return res.status(503).json({ error: 'Gemini API Key is not configured.' });
    }

    if (!faultCode) {
      return res.status(400).json({ error: 'faultCode is required.' });
    }

    const prompt = `
      You are an expert, reassuring automotive AI mechanic named AutoPulse AI.
      A vehicle just reported the following fault: "${faultCode}".
      Context/Description: "${context || 'No context provided'}"
      Current Telemetry Data: ${JSON.stringify(telemetry || {})}

      Please explain this fault to the driver in plain English. 
      Do NOT use overly technical jargon without explaining it.
      Provide a 3-part response formatted exactly like this:

      **What it means:** (1-2 sentences explaining what the fault is)
      **Is it safe to drive?:** (Yes/No, with a 1 sentence explanation of danger level)
      **Next Steps:** (1-2 actionable steps for the driver)
    `;

    console.log('\n--- 🤖 SENDING TO GEMINI AI ---');
    console.log(prompt);
    console.log('-------------------------------\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
         temperature: 0.3, // keep it factual and grounded
      }
    });

    const aiExplanation = response.text;
    
    console.log('\n--- 💬 RECEIVED FROM GEMINI AI ---');
    console.log(aiExplanation);
    console.log('----------------------------------\n');
    
    res.json({ explanation: aiExplanation });

  } catch (err) {
    console.error('Gemini AI error:', err);
    res.status(500).json({ error: 'Failed to generate AI explanation.', details: err.message });
  }
});

// POST /api/ai/chat - Persistent chat assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, telemetry, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
       return res.status(503).json({ error: 'Gemini API Key is not configured.' });
    }

    if (!message) {
      return res.status(400).json({ error: 'message is required.' });
    }

    // Build a conversational prompt with history baked in
    let conversationContext = '';
    if (history && history.length > 0) {
      conversationContext = history
        .map(msg => `${msg.role === 'user' ? 'User' : 'AutoPulse AI'}: ${msg.content}`)
        .join('\n');
    }

    const prompt = `
      You are AutoPulse AI, the ultimate automotive expert and vehicle companion.
      You are extremely knowledgeable about EVERYTHING related to vehicles, cars, trucks, motorcycles, and automotive topics including:
      - Vehicle diagnostics, maintenance, and repair
      - Car brands, models, history, and comparisons
      - Driving tips, road safety, and traffic rules
      - Vehicle modifications, tuning, and performance upgrades
      - Road trips, route planning, and travel advice for drivers
      - Car buying advice, insurance, and financing
      - Automotive technology (EVs, hybrids, autonomous driving, etc.)
      - Motorsports, racing, and car culture
      - Fuel efficiency, tires, parts, and accessories
      - Vehicle regulations, emissions, and inspections
      
      You have real-time access to the user's vehicle telemetry data:
      CURRENT VEHICLE TELEMETRY:
      ${JSON.stringify(telemetry || {}, null, 2)}
      
      RULES:
      - Answer ANY vehicle/automotive related question thoroughly and enthusiastically.
      - If the user's telemetry shows a dangerous condition, proactively warn them.
      - Use the telemetry data to personalize your answers when relevant.
      - Be friendly, conversational, and passionate about cars.
      - Use markdown formatting: **bold** for key points, bullet lists when helpful.
      - If a question is completely unrelated to vehicles/automotive (e.g. politics, cooking), politely redirect and mention you specialize in vehicles.
      - Keep answers concise (3-5 sentences) unless the user asks for more detail.
      
      ${conversationContext ? `CONVERSATION HISTORY:\n${conversationContext}\n` : ''}
      User: ${message}
      AutoPulse AI:
    `;

    console.log('\n--- 🤖 USER CHAT MESSAGE ---');
    console.log(message);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.5 }
    });
    
    const aiResponse = response.text;

    console.log('\n--- 💬 AI CHAT RESPONSE ---');
    console.log(aiResponse);
    console.log('----------------------------\n');

    res.json({ response: aiResponse });

  } catch (err) {
    console.error('AI Chat error:', err.message);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// POST /api/ai/weather-advisory
router.post('/weather-advisory', async (req, res) => {
  try {
    const { temperature, humidity, condition, isDay } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const timeOfDay = isDay ? 'Daytime' : 'Nighttime';
    const prompt = `
      You are an expert automotive and road safety AI.
      Current weather conditions:
      - Temperature: ${temperature}°C
      - Humidity: ${humidity}%
      - Condition: ${condition}
      - Time: ${timeOfDay}
      
      Provide a highly concise, 1-2 sentence recommendation for driving under these exact conditions.
      Focus on vehicle settings (e.g., AC, defogger, lights) and driving behavior (e.g., speed, following distance).
      Keep it actionable and helpful. Do not use formatting like bold text or bullet points, just a plain string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.4 } // slightly more creative but still grounded
    });

    const advisory = response.text.trim();
    res.json({ advisory });

  } catch (err) {
    console.error('Weather Advisory error:', err.message);
    res.status(500).json({ error: 'Failed to generate weather advisory' });
  }
});

module.exports = router;
