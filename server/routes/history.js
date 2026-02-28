const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('diagnostic_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map DB columns to frontend format
    const history = data.map(row => ({
      id: row.id,
      date: row.created_at,
      type: row.type,
      title: row.title,
      summary: row.summary,
      status: row.status,
      emoji: row.emoji,
      faultsFound: row.faults_found,
    }));

    res.json({ history, totalEvents: history.length });
  } catch (error) {
    console.error('History GET error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// POST /api/history — add a diagnostic event
router.post('/', async (req, res) => {
  try {
    const { type = 'diagnosis', title, summary, status = 'logged', faultsFound = 0 } = req.body;
    const emoji = status === 'healthy' ? '😊' : status === 'resolved' ? '✅' : '📋';

    const { data, error } = await supabase
      .from('diagnostic_history')
      .insert({
        type,
        title: title || 'Diagnostic Check',
        summary: summary || 'Parameters checked.',
        status,
        emoji,
        faults_found: faultsFound,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id,
      date: data.created_at,
      type: data.type,
      title: data.title,
      summary: data.summary,
      status: data.status,
      emoji: data.emoji,
      faultsFound: data.faults_found,
    });
  } catch (error) {
    console.error('History POST error:', error.message);
    res.status(500).json({ error: 'Failed to save history.' });
  }
});

module.exports = router;
