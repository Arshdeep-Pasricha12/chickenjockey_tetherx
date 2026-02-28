/**
 * AutoPulse — Drive Safety Scorer
 * 
 * Calculates a 0–100 safety score from driving behavior parameters.
 * Awards badges for good driving habits.
 */

const BADGES = [
  { id: 'speed_saint', name: 'Speed Saint', icon: '🏅', condition: s => s.avgSpeed <= 80, description: 'Maintained safe average speed' },
  { id: 'smooth_operator', name: 'Smooth Operator', icon: '🎯', condition: s => s.hardBrakes === 0, description: 'No hard braking events' },
  { id: 'gentle_starter', name: 'Gentle Starter', icon: '🌱', condition: s => s.rapidAccelerations === 0, description: 'No rapid acceleration events' },
  { id: 'night_owl', name: 'Night Owl Pro', icon: '🦉', condition: s => s.nightDriving && s.avgSpeed <= 60, description: 'Safe speed during night driving' },
  { id: 'eco_warrior', name: 'Eco Warrior', icon: '🌍', condition: s => s.avgSpeed >= 40 && s.avgSpeed <= 80, description: 'Optimal speed for fuel efficiency' },
  { id: 'maintenance_hero', name: 'Maintenance Hero', icon: '🔧', condition: s => s.vehicleCondition === 'good', description: 'Vehicle in good condition' },
];

function calculateSafetyScore(drivingData) {
  const {
    avgSpeed = 60,
    maxSpeed = 80,
    hardBrakes = 0,
    rapidAccelerations = 0,
    distanceKm = 50,
    durationMinutes = 60,
    nightDriving = false,
    weatherCondition = 'clear',
  } = drivingData;

  let score = 100;
  let deductions = [];

  // Speed scoring (max -30 points)
  if (maxSpeed > 160) {
    score -= 30;
    deductions.push({ reason: 'Extreme speed detected (>160 km/h)', points: -30 });
  } else if (maxSpeed > 120) {
    const penalty = Math.round((maxSpeed - 120) * 0.5);
    score -= penalty;
    deductions.push({ reason: `High max speed: ${maxSpeed} km/h`, points: -penalty });
  }

  if (avgSpeed > 100) {
    const penalty = Math.round((avgSpeed - 100) * 0.3);
    score -= penalty;
    deductions.push({ reason: `High average speed: ${avgSpeed} km/h`, points: -penalty });
  }

  // Hard braking (-5 per event, max -20)
  if (hardBrakes > 0) {
    const penalty = Math.min(hardBrakes * 5, 20);
    score -= penalty;
    deductions.push({ reason: `${hardBrakes} hard braking event(s)`, points: -penalty });
  }

  // Rapid acceleration (-3 per event, max -15)
  if (rapidAccelerations > 0) {
    const penalty = Math.min(rapidAccelerations * 3, 15);
    score -= penalty;
    deductions.push({ reason: `${rapidAccelerations} rapid acceleration(s)`, points: -penalty });
  }

  // Night driving with high speed (-10)
  if (nightDriving && avgSpeed > 80) {
    score -= 10;
    deductions.push({ reason: 'High speed during night driving', points: -10 });
  }

  // Weather conditions
  if (weatherCondition === 'rain' && avgSpeed > 70) {
    score -= 10;
    deductions.push({ reason: 'High speed in rainy conditions', points: -10 });
  } else if (weatherCondition === 'fog' && avgSpeed > 50) {
    score -= 15;
    deductions.push({ reason: 'High speed in foggy conditions', points: -15 });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine grade
  let grade, gradeColor, gradeEmoji;
  if (score >= 90) { grade = 'A+'; gradeColor = '#00e676'; gradeEmoji = '🌟'; }
  else if (score >= 80) { grade = 'A'; gradeColor = '#69f0ae'; gradeEmoji = '😊'; }
  else if (score >= 70) { grade = 'B'; gradeColor = '#ffc400'; gradeEmoji = '🙂'; }
  else if (score >= 60) { grade = 'C'; gradeColor = '#ff9100'; gradeEmoji = '😐'; }
  else if (score >= 50) { grade = 'D'; gradeColor = '#ff6d00'; gradeEmoji = '😟'; }
  else { grade = 'F'; gradeColor = '#ff1744'; gradeEmoji = '😰'; }

  // Check badges
  const scoreData = { ...drivingData, vehicleCondition: score >= 80 ? 'good' : 'needs work' };
  const earnedBadges = BADGES.filter(b => {
    try { return b.condition(scoreData); } catch { return false; }
  });

  return {
    score,
    grade,
    gradeColor,
    gradeEmoji,
    deductions,
    badges: earnedBadges,
    tips: generateTips(deductions),
    emotionalMessage: getEmotionalMessage(score),
  };
}

function generateTips(deductions) {
  const tips = [];
  for (const d of deductions) {
    if (d.reason.includes('speed')) tips.push('Try maintaining speeds under 100 km/h for safer and more fuel-efficient driving.');
    if (d.reason.includes('braking')) tips.push('Anticipate traffic flow to reduce hard braking. Keep a safe following distance.');
    if (d.reason.includes('acceleration')) tips.push('Accelerate gently — it\'s easier on your engine and passengers.');
    if (d.reason.includes('night')) tips.push('Reduce speed at night when visibility is lower.');
    if (d.reason.includes('rain') || d.reason.includes('fog')) tips.push('Adjust your speed to match weather conditions for maximum safety.');
  }
  return [...new Set(tips)]; // Remove duplicates
}

function getEmotionalMessage(score) {
  if (score >= 90) return '🌟 Outstanding driving! You\'re a road safety champion. Keep it up!';
  if (score >= 80) return '😊 Great job! You\'re a safe and responsible driver.';
  if (score >= 70) return '🙂 Good driving overall! A few small tweaks and you\'ll be even better.';
  if (score >= 60) return '😐 Room for improvement. Focus on the tips below for a safer drive.';
  if (score >= 50) return '😟 Your driving needs attention. Safety should always come first.';
  return '😰 Please focus on driving safely. Your life and others\' lives depend on it.';
}

module.exports = { calculateSafetyScore };
