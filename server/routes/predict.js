const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { predictMaintenance } = require('../engine/predictor');

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const { user_id, mileage = 50000, params = {}, context = {} } = req.body;
    // We expect params to contain safetyScore, brakeThickness, etc.
    const result = predictMaintenance(params, parseInt(mileage), context);

    // If there's an accelerated wear alert and the user is passed, save it
    if (user_id && result.predictions) {
      const alertsToSave = [];
      for (const pred of result.predictions) {
        if (pred.note && pred.note.includes('accelerated') && (pred.urgency === 'immediate' || pred.urgency === 'soon')) {
           alertsToSave.push({
             user_id,
             severity: 'WARNING',
             message: `Predictive Alert: ${pred.name} (${pred.daysRemaining} days remaining). ${pred.note}`,
             source: 'Predictive Engine',
             telemetry_data: params
           });
        }
      }

      if (alertsToSave.length > 0) {
         await supabase.from('alerts').insert(alertsToSave);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ error: 'Internal server error during prediction.' });
  }
});

module.exports = router;
