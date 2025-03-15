const mongoose = require("mongoose");

//This schema defines how travel preferences will be stored in the database
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

//Creates and exports a model called "TravelPreference" based on the TravelPreferenceSchema
module.exports = mongoose.model("TravelPreference", TravelPreferenceSchema);
