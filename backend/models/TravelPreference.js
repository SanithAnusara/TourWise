const mongoose = require("mongoose");

const ItineraryDaySchema = new mongoose.Schema({
  DayNumber: { type: String, required: true },
  From: { type: String, required: true },
  To: { type: String, required: true },
  Accommodation: { type: String, required: true },
  Activities: { type: String, required: true }
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
  itinerary: [ItineraryDaySchema]  // Updated to store an array of days
});

module.exports = mongoose.model("TravelPreference", TravelPreferenceSchema);
