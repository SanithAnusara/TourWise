const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("TravelPreference", TravelPreferenceSchema);
