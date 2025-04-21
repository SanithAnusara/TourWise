const emissionFactors = {
    petrol: 2.31,      // kg CO2 per liter
    diesel: 2.68,      // kg CO2 per liter
    electric: 0.12,    // kg CO2 per kWh
    bus: 0.05,         // kg CO2 per km per person
    train: 0.04,       // kg CO2 per km per person
    walk: 0,
    bike: 0
  };
  
  function calculateCarbonEmission({ vehicleType, fuelType, fuelEfficiency, distance }) {
    if (!distance || isNaN(distance)) return 0;
  
    if (vehicleType === "car" || vehicleType === "bike") {
      if (!fuelType || !fuelEfficiency || isNaN(fuelEfficiency)) return 0;
      const fuelUsed = distance / fuelEfficiency; // liters or kWh
      const factor = emissionFactors[fuelType] || 0;
      return parseFloat((fuelUsed * factor).toFixed(2)); // kg CO2
    }
  
    // For public transport
    const factor = emissionFactors[vehicleType] || 0;
    return parseFloat((distance * factor).toFixed(2));
  }
  
  module.exports = calculateCarbonEmission;
  