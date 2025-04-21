const mongoose = require("mongoose");

const ItineraryDaySchema = new mongoose.Schema({
  DayNumber: { type: String, required: true },
  From: { type: String, required: true },
  To: { type: String, required: true },
  Accommodation: { type: String, required: true },
  Activities: [{ type: String, required: true }], // Update this line to specify an array of strings
  Transportation: { type: String },
  SustainabilityTips: [{ type: String }]
});

const TravelPreferenceSchema = new mongoose.Schema({
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  groupSize: { type: Number, required: true },
  duration: { type: Number, required: true },
  vehicleType: { type: String, required: true },
  fuelType: { type: String },
  fuelEfficiency: { type: Number },
  itinerary: [ItineraryDaySchema],  // Make sure this accommodates an array of ItineraryDaySchema
  totalTravelDistance: { type: Number, required: false },
  carbonEmission: { type: Number }
});

module.exports = mongoose.model("TravelPreference", TravelPreferenceSchema);
