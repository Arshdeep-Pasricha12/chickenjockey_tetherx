/**
 * AutoPulse — Predictive Maintenance Engine
 * 
 * Estimates future maintenance needs based on current parameter values,
 * mileage, and vehicle age. Provides "peace of mind" predictions.
 */

const MAINTENANCE_ITEMS = [
  {
    id: 'oil_change',
    name: 'Oil Change',
    icon: '🛢️',
    intervalKm: 8000,
    relatedParams: ['oilPressure'],
    predict: (params, mileage, context = {}) => {
      const interval = 10000;
      const lastChange = context.lastServiceMileage || (mileage - (mileage % interval));
      const kmSinceService = mileage - lastChange;
      let remaining = interval - kmSinceService;
      
      const urgencyMult = params.oilPressure < 30 ? 0.7 : 1; 
      remaining = Math.max(0, Math.round(remaining * urgencyMult));

      return {
        kmRemaining: remaining,
        daysRemaining: Math.round(remaining / 40),
        condition: params.oilPressure < 30 ? 'degraded' : 'normal',
      };
    },
  },
  {
    id: 'brake_replacement',
    name: 'Brake Pad Replacement',
    icon: '🛑',
    relatedParams: ['brakeThickness', 'safetyScore'],
    predict: (params, mileage, context = {}) => {
      // 2.5mm input = roughly 3000 km left
      const thickness = params.brakeThickness || 8; 
      // User formula: (thickness - 1.5) / wear_rate
      // We'll use 0.3mm per 1000km to math out strictly to 3,333 for early tests, then round down.
      const wearRatePerKm = 0.0003; 
      
      const remainingKm = Math.max(0, (thickness - 1.5) / wearRatePerKm);
      const safeRemaining = Math.round(remainingKm);
      
      return {
        kmRemaining: safeRemaining,
        daysRemaining: Math.round(safeRemaining / 40),
        condition: thickness < 2.5 ? 'worn' : thickness < 5 ? 'moderate' : 'good',
        note: `Calculated from ${thickness}mm pad thickness using 0.3mm/1000km standard wear.`
      };
    },
  },
  {
    id: 'battery_replacement',
    name: 'Battery Replacement',
    icon: '🔋',
    relatedParams: ['batteryVoltage'],
    predict: (params) => {
      const voltage = params.batteryVoltage || 12.6;
      let condition, daysRemaining;
      if (voltage < 12.0) {
        condition = 'critical';
        daysRemaining = 7;
      } else if (voltage < 12.4) {
        condition = 'aging';
        daysRemaining = 90;
      } else {
        condition = 'healthy';
        daysRemaining = 365;
      }
      return { kmRemaining: daysRemaining * 40, daysRemaining, condition };
    },
  },
  {
    id: 'tire_rotation',
    name: 'Tire Rotation / Replacement',
    icon: '🛞',
    intervalKm: 10000,
    relatedParams: ['tirePressure', 'safetyScore'],
    predict: (params, mileage, context = {}) => {
      const interval = 10000;
      const lastRotation = context.lastRotationMileage || (mileage - (mileage % interval));
      let remaining = interval - (mileage - lastRotation);

      const irregularPressure = params.tirePressure < 28 || params.tirePressure > 38;
      if (irregularPressure) remaining *= 0.6;
      remaining = Math.max(0, Math.round(remaining));

      return {
        kmRemaining: remaining,
        daysRemaining: Math.round(remaining / 40),
        condition: irregularPressure ? 'uneven wear likely' : 'normal'
      };
    },
  },
  {
    id: 'coolant_flush',
    name: 'Coolant System Flush',
    icon: '🌡️',
    intervalKm: 50000,
    relatedParams: ['engineTemp'],
    predict: (params, mileage) => {
      const lastFlush = mileage % 50000;
      const remaining = 50000 - lastFlush;
      const hotRunning = params.engineTemp > 100;
      return {
        kmRemaining: Math.round(remaining * (hotRunning ? 0.7 : 1)),
        daysRemaining: Math.round((remaining * (hotRunning ? 0.7 : 1)) / 40),
        condition: hotRunning ? 'potentially degraded' : 'normal',
      };
    },
  },
  {
    id: 'fuel_filter',
    name: 'Fuel Filter Replacement',
    icon: '⛽',
    intervalKm: 40000,
    relatedParams: ['fuelLevel'],
    predict: (params, mileage) => {
      const lastChange = mileage % 40000;
      const remaining = 40000 - lastChange;
      return {
        kmRemaining: Math.round(remaining),
        daysRemaining: Math.round(remaining / 40),
        condition: 'scheduled',
      };
    },
  },
];

function predictMaintenance(params, mileage = 50000, context = {}) {
  const predictions = MAINTENANCE_ITEMS.map(item => {
    const numParams = {};
    for (const key of Object.keys(params)) {
      numParams[key] = parseFloat(params[key]) || 0;
    }

    const result = item.predict(numParams, mileage, context);

    let urgency;
    // New logic: < 500 km remaining = High/Immediate urgency
    if (result.kmRemaining < 500) urgency = 'immediate';
    else if (result.kmRemaining <= 1500) urgency = 'soon';
    else if (result.kmRemaining <= 3000) urgency = 'upcoming';
    else urgency = 'scheduled';

    return {
      id: item.id,
      name: item.name,
      icon: item.icon,
      ...result,
      urgency,
      emotionalMessage: getEmotionalMessage(item.name, urgency),
    };
  });

  // Sort by urgency (most urgent first)
  const urgencyOrder = { immediate: 0, soon: 1, upcoming: 2, scheduled: 3 };
  predictions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return {
    timestamp: new Date().toISOString(),
    mileage,
    predictions,
    nextAction: predictions[0],
  };
}

function getEmotionalMessage(itemName, urgency) {
  const messages = {
    immediate: `⏰ Your ${itemName} needs attention right away — let's keep you safe on the road!`,
    soon: `📅 Your ${itemName} is coming up in the next few weeks. Plan a visit to your mechanic.`,
    upcoming: `🗓️ Your ${itemName} is on the horizon. No rush, but keep it in mind.`,
    scheduled: `✅ Your ${itemName} is looking good! Just routine maintenance ahead.`,
  };
  return messages[urgency];
}

module.exports = { predictMaintenance };
