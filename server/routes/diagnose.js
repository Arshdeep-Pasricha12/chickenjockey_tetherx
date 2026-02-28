const express = require('express');
const router = express.Router();
const { detectFaults } = require('../engine/faultDetector');

// POST /api/diagnose
router.post('/', (req, res) => {
  try {
    const data = req.body;
    const params = data.params || data;
    const context = data.context || {};

    // Validate at least one parameter is provided
    const validKeys = ['speed', 'engineTemp', 'rpm', 'oilPressure', 'tirePressure', 'batteryVoltage', 'fuelLevel', 'brakeThickness'];
    const provided = validKeys.filter(k => params[k] !== undefined && params[k] !== '');

    if (provided.length === 0) {
      return res.status(400).json({
        error: 'Please provide at least one vehicle parameter.',
        validParameters: validKeys,
      });
    }

    const result = detectFaults(params, context);
    res.json(result);
  } catch (error) {
    console.error('Diagnose error:', error);
    res.status(500).json({ error: 'Internal server error during diagnosis.' });
  }
});

module.exports = router;
