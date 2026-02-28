const express = require('express');
const router = express.Router();
const { calculateSafetyScore } = require('../engine/safetyScorer');

// POST /api/safety-score
router.post('/', (req, res) => {
  try {
    const result = calculateSafetyScore(req.body);
    res.json(result);
  } catch (error) {
    console.error('Safety score error:', error);
    res.status(500).json({ error: 'Internal server error calculating safety score.' });
  }
});

module.exports = router;
