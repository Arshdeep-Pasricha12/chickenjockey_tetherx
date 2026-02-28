const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST /api/community/car-issues — Get common faults for a car model via Gemini
router.post('/car-issues', async (req, res) => {
  try {
    const { make, model, year } = req.body;

    if (!make || !model) {
      return res.status(400).json({ error: 'make and model are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API Key is not configured.' });
    }

    const prompt = `
      You are an expert automotive database with extensive knowledge of vehicle reliability data.
      
      For the car: ${year || ''} ${make} ${model}
      
      Return the 6 most commonly reported problems/faults that owners of this specific car model face.
      Use real-world reliability data and common owner complaints.
      
      Return ONLY a valid JSON array (no markdown, no backticks, no explanation) with this exact structure:
      [
        {
          "title": "Short fault name",
          "description": "1-2 sentence explanation of the issue",
          "severity": "low" | "medium" | "high" | "critical",
          "affectedPercent": number between 5-65 (realistic % of owners who report this),
          "category": "Engine" | "Transmission" | "Electrical" | "Suspension" | "Brakes" | "AC/Climate" | "Body" | "Fuel System" | "Steering" | "Exhaust",
          "typicalFix": "What usually fixes this issue",
          "estimatedCost": "Cost range in INR (e.g. ₹2,000 - ₹5,000)",
          "urgency": "Fix immediately" | "Fix within a week" | "Fix when convenient" | "Monitor only"
        }
      ]
      
      Be realistic with the data. Use common Indian car service costs.
      Return ONLY the JSON array, nothing else.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.3 }
    });

    let text = response.text.trim();
    // Strip markdown code fences if present
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const issues = JSON.parse(text);

    console.log(`\n--- 🚗 CAR ISSUES for ${year || ''} ${make} ${model} ---`);
    console.log(`Found ${issues.length} common issues`);
    console.log('-------------------------------------------\n');

    res.json({ issues, car: { make, model, year } });

  } catch (err) {
    console.error('Car issues error:', err.message);
    res.status(500).json({ error: 'Failed to fetch car issues.', details: err.message });
  }
});

// GET /api/community/tips
router.get('/tips', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('community_tips')
      .select('*')
      .order('likes', { ascending: false });

    if (error) throw error;

    const tips = data.map(row => ({
      id: row.id,
      author: row.author,
      avatar: row.avatar,
      content: row.content,
      likes: row.likes,
      date: row.created_at,
      tag: row.tag,
    }));

    res.json({ tips });
  } catch (error) {
    console.error('Tips GET error:', error.message);
    res.status(500).json({ error: 'Failed to fetch tips.' });
  }
});

// POST /api/community/ask
router.post('/ask', async (req, res) => {
  try {
    const { author = 'Anonymous', content } = req.body;
    if (!content) return res.status(400).json({ error: 'Question content is required.' });

    const { data, error } = await supabase
      .from('community_questions')
      .insert({ author, content })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id,
      author: data.author,
      content: data.content,
      answers: data.answers,
      date: data.created_at,
      resolved: data.resolved,
    });
  } catch (error) {
    console.error('Ask POST error:', error.message);
    res.status(500).json({ error: 'Failed to post question.' });
  }
});

// GET /api/community/questions
router.get('/questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('community_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const questions = data.map(row => ({
      id: row.id,
      author: row.author,
      content: row.content,
      answers: row.answers,
      date: row.created_at,
      resolved: row.resolved,
    }));

    res.json({ questions });
  } catch (error) {
    console.error('Questions GET error:', error.message);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

module.exports = router;
