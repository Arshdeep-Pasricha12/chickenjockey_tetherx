/**
 * AutoPulse — Core Fault Detection Engine
 *
 * Rule-based threshold analysis for 8 vehicle parameters.
 * Each parameter is checked against normal/warning/critical ranges.
 * Cross-parameter correlations detect compounded risks.
 * Results are prioritized by severity.
 */

const SEVERITY = {
  CRITICAL: { level: 4, label: "critical", color: "#ff1744" },
  HIGH: { level: 3, label: "high", color: "#ff6d00" },
  MEDIUM: { level: 2, label: "medium", color: "#ffc400" },
  LOW: { level: 1, label: "low", color: "#00e676" },
};

// ── Parameter Rules ──────────────────────────────────────────────
const RULES = {
  engineTemp: {
    unit: "°C",
    displayName: "Engine Temperature",
    icon: "🌡️",
    checks: [
      {
        test: (v) => v > 120,
        severity: SEVERITY.CRITICAL,
        title: "Engine Overheating — Critical!",
        description:
          "Engine temperature has exceeded 120°C. Immediate shutdown risk.",
        fix: "Pull over safely and turn off the engine immediately. Do NOT open the radiator cap. Call roadside assistance.",
        emotional:
          "🚨 This is serious — please stop driving right now. Your safety comes first.",
      },
      {
        test: (v) => v > 105,
        severity: SEVERITY.HIGH,
        title: "Engine Running Hot",
        description:
          "Engine temperature is between 105–120°C, above normal operating range.",
        fix: "Turn off the A/C, turn on the heater to dissipate heat, and drive to the nearest service station.",
        emotional:
          "⚠️ Don't panic — reduce load on your engine and get checked soon.",
      },
      {
        test: (v) => v < 70 && v > 0,
        severity: SEVERITY.LOW,
        title: "Engine Not Warmed Up",
        description:
          "Engine temperature is below 70°C. May be normal during cold starts.",
        fix: "Let the engine warm up for a few minutes before driving aggressively.",
        emotional:
          "💡 Give your car a moment to wake up — just like us on cold mornings.",
      },
    ],
  },

  rpm: {
    unit: "RPM",
    displayName: "Engine RPM",
    icon: "⚙️",
    checks: [
      {
        test: (v) => v > 7000,
        severity: SEVERITY.CRITICAL,
        title: "RPM Dangerously High — Redline!",
        description:
          "Engine RPM has exceeded 7000. Risk of engine damage or failure.",
        fix: "Ease off the accelerator immediately. Shift to a higher gear if manual. If persistent, pull over.",
        emotional:
          "🚨 Your engine is screaming — please let it breathe. Slow down now.",
      },
      {
        test: (v) => v > 6000,
        severity: SEVERITY.HIGH,
        title: "RPM Above Normal Range",
        description:
          "Engine RPM is between 6000–7000. Sustained high RPM causes wear.",
        fix: "Reduce speed, shift up, or ease off the throttle. Avoid sustained high-RPM driving.",
        emotional:
          "⚠️ Your engine is working hard — give it a break before it overheats.",
      },
      {
        test: (v) => v < 600 && v > 0,
        severity: SEVERITY.MEDIUM,
        title: "RPM Too Low — Rough Idle",
        description:
          "Engine RPM is below 600. May indicate idle issues or stalling risk.",
        fix: "Check for vacuum leaks, dirty throttle body, or failing idle air control valve.",
        emotional:
          "🔧 Your car seems a bit sluggish — a quick tune-up should help.",
      },
    ],
  },

  oilPressure: {
    unit: "psi",
    displayName: "Oil Pressure",
    icon: "🛢️",
    checks: [
      {
        test: (v) => v < 15,
        severity: SEVERITY.CRITICAL,
        title: "Oil Pressure Critically Low!",
        description:
          "Oil pressure is below 15 psi. Engine seizure risk is imminent.",
        fix: "Stop driving immediately! Check oil level and top up if low. Do not restart until pressure is restored.",
        emotional:
          "🚨 This is an emergency — your engine needs oil NOW. Please pull over safely.",
      },
      {
        test: (v) => v < 25,
        severity: SEVERITY.HIGH,
        title: "Oil Pressure Below Normal",
        description:
          "Oil pressure is between 15–25 psi, below the safe operating range.",
        fix: "Check oil level with the dipstick. Look for leaks under the car. Visit a mechanic soon.",
        emotional:
          "⚠️ Your engine's lifeblood is running low — don't ignore this one.",
      },
      {
        test: (v) => v > 65,
        severity: SEVERITY.MEDIUM,
        title: "Oil Pressure Too High",
        description:
          "Oil pressure exceeds 65 psi. May indicate a blocked oil passage.",
        fix: "Check oil viscosity and pressure relief valve. Have a mechanic inspect.",
        emotional:
          "🔧 Unusual reading — worth getting checked to prevent future issues.",
      },
    ],
  },

  tirePressure: {
    unit: "psi",
    displayName: "Tire Pressure",
    icon: "🛞",
    checks: [
      {
        test: (v) => v < 25,
        severity: SEVERITY.CRITICAL,
        title: "Tire Pressure Dangerously Low!",
        description:
          "Tire pressure is below 25 psi. Blowout risk is very high.",
        fix: "Do not drive at high speed. Inflate tires at the nearest gas station or use a spare.",
        emotional:
          "🚨 Your tires are in danger — please slow down and get air immediately.",
      },
      {
        test: (v) => v > 40,
        severity: SEVERITY.CRITICAL,
        title: "Tire Pressure Dangerously High!",
        description:
          "Tire pressure exceeds 40 psi. Risk of blowout, especially on hot roads.",
        fix: "Release air to bring pressure to 30-35 psi. Check when tires are cold for accurate reading.",
        emotional:
          "🚨 Over-inflated tires are a hidden danger — please release some air now.",
      },
      {
        test: (v) => v < 30,
        severity: SEVERITY.MEDIUM,
        title: "Tire Pressure Low",
        description:
          "Tire pressure is between 25–30 psi. Reduces fuel efficiency and handling.",
        fix: "Inflate tires to the manufacturer-recommended pressure (usually 30-35 psi).",
        emotional:
          "💡 A small top-up will improve your ride and save fuel money.",
      },
      {
        test: (v) => v > 35,
        severity: SEVERITY.LOW,
        title: "Tire Pressure Slightly High",
        description:
          "Tire pressure is between 35–40 psi. Slightly above optimal.",
        fix: "Release a small amount of air. Recheck pressure when tires are cold.",
        emotional: "💡 Just a tiny adjustment needed — no stress.",
      },
    ],
  },

  batteryVoltage: {
    unit: "V",
    displayName: "Battery Voltage",
    icon: "🔋",
    checks: [
      {
        test: (v) => v < 11.8,
        severity: SEVERITY.CRITICAL,
        title: "Battery Voltage Critical — May Not Start!",
        description:
          "Battery voltage is below 11.8V. Car may not start or may stall.",
        fix: "Jump-start the vehicle or replace the battery. Check the alternator for charging issues.",
        emotional:
          "🚨 Your car's heart is fading — get a new battery before you're stranded.",
      },
      {
        test: (v) => v < 12.4,
        severity: SEVERITY.HIGH,
        title: "Battery Voltage Low",
        description:
          "Battery voltage is between 11.8–12.4V. Battery is not fully charged.",
        fix: "Drive for 20+ minutes to let the alternator recharge. If it persists, test the battery.",
        emotional:
          "⚠️ Your battery needs a good charge — a short drive should help.",
      },
      {
        test: (v) => v > 14.7,
        severity: SEVERITY.HIGH,
        title: "Battery Overcharging",
        description:
          "Battery voltage exceeds 14.7V. Alternator may be overcharging.",
        fix: "Have the voltage regulator and alternator checked immediately.",
        emotional:
          "⚠️ Too much power can be just as bad — get your alternator checked.",
      },
    ],
  },

  speed: {
    unit: "km/h",
    displayName: "Vehicle Speed",
    icon: "🏎️",
    checks: [
      {
        test: (v) => v > 160,
        severity: SEVERITY.CRITICAL,
        title: "Speed Dangerously High!",
        description: "Vehicle speed exceeds 160 km/h. Extreme accident risk.",
        fix: "Gradually reduce speed. Do NOT brake suddenly at high speed. Move to the slow lane.",
        emotional:
          "🚨 Please slow down — no destination is worth risking your life.",
      },
      {
        test: (v) => v > 120,
        severity: SEVERITY.MEDIUM,
        title: "Speed Above Safe Limit",
        description:
          "Vehicle speed is between 120–160 km/h. Increased risk and fuel consumption.",
        fix: "Reduce speed to below 120 km/h for safer driving and better fuel economy.",
        emotional:
          "⚠️ Ease off a bit — you'll still get there on time, and much safer.",
      },
    ],
  },

  fuelLevel: {
    unit: "%",
    displayName: "Fuel Level",
    icon: "⛽",
    checks: [
      {
        test: (v) => v < 10,
        severity: SEVERITY.CRITICAL,
        title: "Fuel Almost Empty!",
        description:
          "Fuel level is below 10%. Risk of running out and getting stranded.",
        fix: "Find the nearest fuel station immediately. Avoid highways where stations are far apart.",
        emotional:
          "🚨 You're running on fumes — please refuel NOW before it's too late.",
      },
      {
        test: (v) => v < 20,
        severity: SEVERITY.MEDIUM,
        title: "Fuel Level Low",
        description:
          "Fuel level is between 10–20%. Time to plan a refueling stop.",
        fix: "Head to the nearest fuel station. Running on low fuel can damage the fuel pump.",
        emotional:
          "💡 Time for a pit stop — your car (and wallet) will thank you.",
      },
    ],
  },

  brakeThickness: {
    unit: "mm",
    displayName: "Brake Pad Thickness",
    icon: "🛑",
    checks: [
      {
        test: (v) => v < 2,
        severity: SEVERITY.CRITICAL,
        title: "Brake Pads Extremely Worn!",
        description:
          "Brake pad thickness is below 2mm. Braking power severely compromised.",
        fix: "Replace brake pads immediately. Avoid high-speed driving until replaced.",
        emotional:
          "🚨 Your brakes are almost gone — this is life-threatening. Get them replaced TODAY.",
      },
      {
        test: (v) => v < 4,
        severity: SEVERITY.HIGH,
        title: "Brake Pads Wearing Thin",
        description:
          "Brake pad thickness is between 2–4mm. Replacement needed soon.",
        fix: "Schedule brake pad replacement within the next 1-2 weeks.",
        emotional:
          "⚠️ Your brakes have served you well — time to give them a refresh.",
      },
    ],
  },
};

// ── Cross-Parameter Correlations ─────────────────────────────────
const CORRELATIONS = [
  {
    test: (p) => p.engineTemp > 105 && p.oilPressure < 25,
    severity: SEVERITY.CRITICAL,
    title: "🔥 Compound Risk: High Temp + Low Oil",
    description:
      "Engine running hot with low oil pressure. Extremely high risk of engine seizure.",
    fix: "Stop immediately! This combination can destroy your engine within minutes. Call a tow truck.",
    emotional:
      "🚨 Two danger signs together — please take this very seriously and stop NOW.",
    parameters: ["engineTemp", "oilPressure"],
  },
  {
    test: (p) => p.speed > 120 && p.brakeThickness < 4,
    severity: SEVERITY.CRITICAL,
    title: "💀 Compound Risk: High Speed + Worn Brakes",
    description:
      "Driving at high speed with thin brake pads. Extremely dangerous stopping conditions.",
    fix: "Reduce speed immediately. Maintain extra following distance. Get brakes replaced ASAP.",
    emotional:
      "🚨 Speed and bad brakes are a deadly combination — slow down right now.",
    parameters: ["speed", "brakeThickness"],
  },
  {
    test: (p) => p.engineTemp > 105 && p.speed > 120,
    severity: SEVERITY.HIGH,
    title: "⚠️ Compound Risk: Hot Engine + High Speed",
    description:
      "High engine temperature at high speed increases breakdown risk.",
    fix: "Slow down to reduce engine load. Turn off A/C and open windows.",
    emotional:
      "⚠️ Your engine is stressed and you're pushing it — ease off the gas.",
    parameters: ["engineTemp", "speed"],
  },
  {
    test: (p) => p.batteryVoltage < 12.4 && p.rpm < 600,
    severity: SEVERITY.HIGH,
    title: "⚠️ Compound Risk: Low Battery + Rough Idle",
    description:
      "Low battery voltage combined with low RPM may indicate alternator failure.",
    fix: "Have the alternator tested. The battery may not be getting recharged while driving.",
    emotional:
      "⚠️ Your car's electrical system needs attention — don't risk a breakdown.",
    parameters: ["batteryVoltage", "rpm"],
  },
  {
    test: (p) => p.fuelLevel < 20 && p.speed > 120,
    severity: SEVERITY.HIGH,
    title: "⚠️ Compound Risk: Low Fuel + High Speed",
    description:
      "Low fuel at high speed makes reaching a station risky. High speed burns fuel faster.",
    fix: "Reduce speed to improve fuel economy. Locate the nearest fuel station immediately.",
    emotional:
      "⚠️ Slow down to stretch your fuel — you don't want to be stranded at high speed.",
    parameters: ["fuelLevel", "speed"],
  },
  {
    test: (p) => p.speed === 80 && p.rpm < 1500,
    severity: SEVERITY.HIGH,
    title: "⚠️ Compound Risk: RPM & Speed Mismatch",
    description: "Speed is 80 km/h but RPM is unusually low (<1500). Possible clutch slipping or transmission gear engagement issue.",
    fix: "Avoid rapid acceleration. Have your transmission and clutch inspected by a professional.",
    emotional: "⚠️ Your gears might be slipping. Go easy on the pedal until you get it checked.",
    parameters: ["speed", "rpm"],
  },
  {
    test: (p) => p.rpm > 4000 && p.engineTemp > 100,
    severity: SEVERITY.CRITICAL,
    title: "🔥 CRITICAL: Engine Under Extreme Stress",
    description: "High RPM combined with High Engine Temperature. This condition rapidly degrades engine components and risks catastrophic failure.",
    fix: "PULL OVER IMMEDIATELY. Let the engine idle to cool down. Do not turn it off immediately if boiling over, let the fans run.",
    emotional: "🚨 Your engine is screaming and burning up! STOP NOW before permanent damage occurs.",
    parameters: ["rpm", "engineTemp"],
  },
  {
    test: (p, ctx) => p.batteryVoltage < 12.4 && p.speed < 20 && ctx?.acOn,
    severity: SEVERITY.HIGH,
    title: "⚡ Compound Risk: Electrical Stress at Low Speed",
    description: "Low battery voltage while AC is on at low speed. Alternator may not be charging sufficiently under high load at idle.",
    fix: "Turn off AC and other non-essential electronics until you reach higher speeds or get the alternator tested.",
    emotional: "⚠️ Your car is struggling to power the AC right now. Give the alternator a break by turning it off.",
    parameters: ["batteryVoltage", "speed"],
    requiresContext: true
  },
  {
    test: (p, ctx) => ctx?.gear === 1 && p.speed > 30,
    severity: SEVERITY.HIGH,
    title: "⚙️ Compound Risk: Engine Over-revving for Gear",
    description: "Driving over 30 km/h in 1st gear places massive stress on the engine and transmission.",
    fix: "Shift to a higher gear immediately to reduce engine stress and save fuel.",
    emotional: "⚠️ You're holding 1st gear way too long! Please upshift to let the engine breathe.",
    parameters: ["speed"],
    requiresContext: true
  }
];

// ── Context-Aware Priority Engine ────────────────────────────────
function applyPriorityMultipliers(baseFault, context) {
  if (!context) return baseFault;
  
  let multiplier = 1.0;
  const reasons = [];

  if (context.tripType === 'Highway') {
    multiplier *= 1.4;
    reasons.push('Highway speeds increase risk');
  }
  if (context.weather === 'Rain' || context.weather === 'Fog') {
    multiplier *= 1.3;
    reasons.push(`Reduced visibility/traction due to ${context.weather}`);
  } else if (context.weather === 'Storm') {
    multiplier *= 1.5;
    reasons.push('Extreme weather conditions');
  }
  if (context.timeOfDay === 'Night') {
    multiplier *= 1.3;
    reasons.push('Nighttime driving limits visibility');
  }
  if (context.driverProfile === 'New') {
    multiplier *= 1.2;
    reasons.push('Inexperienced driver profile');
  }
  if (context.passengers >= 5 || context.load === 'Heavy') {
    multiplier *= 1.2;
    reasons.push('Heavy vehicle load impacts handling/braking');
  }

  // Cap multiplier
  multiplier = Math.min(multiplier, 2.5);

  let newLevel = baseFault.severityLevel * multiplier;
  
  let newSeverity = baseFault.severity;
  let newColor = baseFault.color;
  let urgencyFlag = "";

  if (newLevel >= SEVERITY.CRITICAL.level) {
    newSeverity = SEVERITY.CRITICAL.label;
    newColor = SEVERITY.CRITICAL.color;
    if (baseFault.severityLevel < SEVERITY.CRITICAL.level) {
      urgencyFlag = " (Upgraded due to context)";
    }
  } else if (newLevel >= SEVERITY.HIGH.level) {
    newSeverity = SEVERITY.HIGH.label;
    newColor = SEVERITY.HIGH.color;
  } else if (newLevel >= SEVERITY.MEDIUM.level) {
    newSeverity = SEVERITY.MEDIUM.label;
    newColor = SEVERITY.MEDIUM.color;
  }

  const contextNote = reasons.length > 0 ? `\n\nContext Warning: Priority increased. ${reasons.join(', ')}.` : '';

  return {
    ...baseFault,
    severity: newSeverity,
    severityLevel: newLevel, // keep the floated level for accurate sorting
    color: newColor,
    title: baseFault.title + urgencyFlag,
    description: baseFault.description + contextNote
  };
}

// ── Main Detection Function ──────────────────────────────────────
function detectFaults(params, context = {}) {
  const faults = [];

  // Check each parameter against its rules
  for (const [paramKey, config] of Object.entries(RULES)) {
    const value = params[paramKey];
    if (value === undefined || value === null || value === "") continue;

    const numVal = parseFloat(value);
    if (isNaN(numVal)) continue;

    for (const check of config.checks) {
      if (check.test(numVal)) {
        let fault = {
          id: `${paramKey}-${check.severity.label}-${Date.now()}`,
          parameter: paramKey,
          displayName: config.displayName,
          icon: config.icon,
          value: numVal,
          unit: config.unit,
          severity: check.severity.label,
          severityLevel: check.severity.level,
          color: check.severity.color,
          title: check.title,
          description: check.description,
          fix: check.fix,
          emotionalMessage: check.emotional,
          type: "single",
        };
        
        faults.push(applyPriorityMultipliers(fault, context));
        break; // Only report the highest severity fault per parameter
      }
    }
  }

  // Check cross-parameter correlations
  const numParams = {};
  for (const key of Object.keys(params)) {
    numParams[key] = parseFloat(params[key]);
  }

  for (const corr of CORRELATIONS) {
    try {
      if (corr.test(numParams, context)) {
        let fault = {
          id: `corr-${corr.parameters.join("-")}-${Date.now()}`,
          parameter: corr.parameters.join(" + "),
          displayName: "Cross-Parameter Alert",
          icon: "🔗",
          severity: corr.severity.label,
          severityLevel: corr.severity.level,
          color: corr.severity.color,
          title: corr.title,
          description: corr.description,
          fix: corr.fix,
          emotionalMessage: corr.emotional,
          type: "correlation",
          relatedParams: corr.parameters,
        };
        faults.push(applyPriorityMultipliers(fault, context));
      }
    } catch (e) {
      // Skip if params missing for correlation
    }
  }

  // Sort by severity (highest first)
  faults.sort((a, b) => b.severityLevel - a.severityLevel);

  // Overall health assessment
  const maxSeverity = faults.length > 0 ? faults[0].severityLevel : 0;
  let overallStatus, overallEmoji, overallMessage;

  if (maxSeverity === 0) {
    overallStatus = "healthy";
    overallEmoji = "😊";
    overallMessage =
      "Your vehicle is in great shape! All parameters are within normal range. Keep up the good maintenance!";
  } else if (maxSeverity === 1) {
    overallStatus = "good";
    overallEmoji = "🙂";
    overallMessage =
      "Your vehicle is mostly fine with minor observations. Nothing urgent, but keep an eye on the noted items.";
  } else if (maxSeverity === 2) {
    overallStatus = "warning";
    overallEmoji = "⚠️";
    overallMessage =
      "Some parameters need your attention. Address the warnings when possible to prevent bigger issues.";
  } else if (maxSeverity === 3) {
    overallStatus = "danger";
    overallEmoji = "🔶";
    overallMessage =
      "There are significant issues that need prompt attention. Please address the high-severity alerts soon.";
  } else {
    overallStatus = "critical";
    overallEmoji = "🚨";
    overallMessage =
      "CRITICAL issues detected! Your safety may be at risk. Please take immediate action on the red alerts.";
  }

  return {
    timestamp: new Date().toISOString(),
    totalFaults: faults.length,
    overallStatus,
    overallEmoji,
    overallMessage,
    faults,
    parametersChecked: Object.keys(params).length,
  };
}

module.exports = { detectFaults, RULES, SEVERITY };
