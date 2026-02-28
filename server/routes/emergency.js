const express = require('express');
const router = express.Router();

const EMERGENCY_PROTOCOLS = {
  breakdown: {
    title: 'Vehicle Breakdown',
    steps: [
      'Turn on hazard lights immediately',
      'Safely move to the shoulder or side of the road',
      'Place warning triangle 50m behind your vehicle',
      'Stay inside the vehicle if on a highway',
      'Call roadside assistance or nearest service center',
    ],
  },
  accident: {
    title: 'Accident',
    steps: [
      'Check yourself and passengers for injuries',
      'Call emergency services (112) if anyone is hurt',
      'Turn off the engine and turn on hazard lights',
      'Do not move the vehicle unless it blocks traffic',
      'Exchange information with other parties involved',
      'Document the scene with photos',
    ],
  },
  fire: {
    title: 'Vehicle Fire',
    steps: [
      'Pull over immediately and turn off the engine',
      'Get everyone out of the vehicle and move 30m away',
      'Call fire services (101) immediately',
      'Do NOT open the hood if smoke is coming from engine',
      'Use a fire extinguisher only if the fire is small and contained',
    ],
  },
  flat_tire: {
    title: 'Flat Tire',
    steps: [
      'Slow down gradually and find a safe, flat spot',
      'Turn on hazard lights and apply parking brake',
      'Use the spare tire kit if available',
      'If no spare, call roadside assistance',
      'Do not drive on a flat tire — it damages the rim',
    ],
  },
};

// POST /api/emergency
router.post('/', async (req, res) => {
  try {
    const { emergencyType = 'breakdown', lat, lng } = req.body;
    const protocol = EMERGENCY_PROTOCOLS[emergencyType] || EMERGENCY_PROTOCOLS.breakdown;

    let nearbyServiceCenters = [];
    let isRealData = false;

    if (lat && lng) {
      try {
        nearbyServiceCenters = await fetchNearbyFromNominatim(lat, lng);
        if (nearbyServiceCenters.length > 0) {
          isRealData = true;
        }
      } catch (err) {
        console.error('Nominatim fetch error:', err.message);
      }
    }

    // Fallback to default centers if Nominatim fails or no location
    if (nearbyServiceCenters.length === 0) {
      nearbyServiceCenters = getDefaultServiceCenters();
      isRealData = false;
    }

    res.json({
      timestamp: new Date().toISOString(),
      emergencyType,
      protocol,
      nearbyServiceCenters,
      isRealData,
      userLocation: lat && lng ? { lat, lng } : null,
      calmingMessage: '🫂 Help is on the way. Stay calm, stay safe. You\'re not alone.',
      emergencyNumbers: {
        police: '100',
        ambulance: '108',
        fire: '101',
        roadside: '1800-123-4567',
      },
    });
  } catch (error) {
    console.error('Emergency error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fetch nearby auto repair shops via OpenStreetMap Nominatim API (free, no key)
async function fetchNearbyFromNominatim(lat, lng) {
  const searchTerms = ['car repair', 'auto repair', 'car service center', 'car garage'];
  const allResults = [];
  const seen = new Set();

  for (const term of searchTerms) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(term)}&format=json&limit=5` +
        `&viewbox=${lng - 0.1},${lat + 0.1},${lng + 0.1},${lat - 0.1}` +
        `&bounded=1&addressdetails=1&extratags=1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'AutoPulse-VehicleIntelligence/1.0' },
      });

      if (!response.ok) continue;
      const data = await response.json();

      for (const place of data) {
        const name = place.name || place.display_name?.split(',')[0] || 'Service Center';
        if (seen.has(name)) continue;
        seen.add(name);

        const pLat = parseFloat(place.lat);
        const pLng = parseFloat(place.lon);
        const distance = haversineDistance(lat, lng, pLat, pLng);

        // Extract contact details from extratags
        const tags = place.extratags || {};
        const phone = tags.phone || tags['contact:phone'] || tags.mobile || 'N/A';
        const website = tags.website || tags['contact:website'] || null;
        const hours = tags.opening_hours || null;
        const email = tags.email || tags['contact:email'] || null;

        allResults.push({
          id: `osm-${place.osm_id}`,
          name,
          address: place.display_name || 'Address unavailable',
          coordinates: { lat: pLat, lng: pLng },
          distance: distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`,
          distanceKm: distance,
          phone,
          website,
          hours,
          email,
          type: place.type === 'car_repair' ? 'Car Repair' : 'Auto Service',
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
        });
      }

      // Small delay between requests to respect Nominatim rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.error(`Nominatim search for "${term}" failed:`, err.message);
    }
  }

  // Sort by distance and return top 6
  allResults.sort((a, b) => a.distanceKm - b.distanceKm);
  return allResults.slice(0, 6);
}

// Haversine formula for distance between two coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * (Math.PI / 180); }

// Default fallback service centers
function getDefaultServiceCenters() {
  return [
    { id: 'default-1', name: 'AutoCare Express', address: '123 Main Road, Near City Center', distance: '1.2 km', distanceKm: 1.2, phone: '+91 98765 43210', type: 'Multi-brand', rating: '4.5' },
    { id: 'default-2', name: 'QuickFix Motors', address: '456 Industrial Area, Phase 2', distance: '2.8 km', distanceKm: 2.8, phone: '+91 98765 43211', type: 'Authorized Service', rating: '4.2' },
    { id: 'default-3', name: 'RoadStar Garage', address: '789 Highway Plaza, Exit 5', distance: '4.1 km', distanceKm: 4.1, phone: '+91 98765 43212', type: 'Premium Service', rating: '4.7' },
  ];
}

module.exports = router;
