const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { predictMaintenance } = require('../engine/predictor');
const { GoogleGenAI } = require('@google/genai');

let ai = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (err) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is missing. AI Predictions will use fallback logic.');
}

// Helper to clean markdown JSON blocks
function parseJSONFromText(text) {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Failed to parse AI response as JSON');
  }
}

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const { user_id, mileage = 50000, params = {}, context = {}, serviceHistory = "" } = req.body;
    
    let result = null;

    // Try AI Prediction first
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          You are AutoPulse AI, an expert predictive maintenance engine.
          Calculate the maintenance timeline for this vehicle based on its live telemetry and service history.
          
          Current Mileage: ${mileage} km
          Live Telemetry: ${JSON.stringify(params)}
          User Service History Context: "${serviceHistory || 'No recent service history provided.'}"
          
          Provide a highly realistic prediction of what needs service next.
          Return ONLY a valid JSON object matching exactly this structure:
          {
            "timestamp": "${new Date().toISOString()}",
            "mileage": ${mileage},
            "predictions": [
              {
                "id": "String (e.g. oil_change, brake_replacement, battery_replacement)",
                "name": "String (e.g. Oil Change)",
                "icon": "String (an emoji)",
                "kmRemaining": 1200,
                "daysRemaining": 30,
                "condition": "String (good, degraded, worn, critical)",
                "urgency": "String (must be EXACTLY one of: immediate, soon, upcoming, scheduled)",
                "emotionalMessage": "String (a friendly, reassuring, or urgent message to the driver)"
              }
            ],
            "nextAction": { /* The single most urgent prediction object from the array */ }
          }
          Ensure no markdown wraps the JSON. Just raw format. Generate at least 4-5 predictions (Oil, Brakes, Battery, Tires, etc). Sort them from most urgent to least.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2, // Low temp for structured JSON
          }
        });

        result = parseJSONFromText(response.text);
        console.log("✅ Successfully generated AI Predictive Maintenance");
      } catch (aiError) {
        console.error("AI Prediction failed, falling back to static algorithms:", aiError);
      }
    }

    // Fallback to static rules if AI fails or is disabled
    if (!result || !result.predictions) {
       result = predictMaintenance(params, parseInt(mileage), context);
    }

    // Save serious alerts to DB
    if (user_id && result.predictions) {
      const alertsToSave = [];
      for (const pred of result.predictions) {
        if (pred.urgency === 'immediate' || pred.urgency === 'soon') {
           alertsToSave.push({
             user_id,
             severity: 'WARNING',
             message: `Predictive Alert: ${pred.name} (${pred.daysRemaining} days remaining). ${pred.emotionalMessage}`,
             source: 'AI Predictive Engine',
             telemetry_data: params
           });
        }
      }

      if (alertsToSave.length > 0) {
         try {
           await supabase.from('alerts').insert(alertsToSave);
         } catch(dbErr) {
           console.error("Failed to save alerts to Supabase");
         }
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ error: 'Internal server error during prediction.' });
  }
});

module.exports = router;
