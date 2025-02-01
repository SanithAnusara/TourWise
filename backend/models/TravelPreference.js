const mongoose = require("mongoose");

const TravelPreferenceSchema = new mongoose.Schema({
  startLocation: { type: Object, required: true },
  endLocation: { type: Object, required: true },
  groupSize: { type: Number, required: true },
  duration: { type: Number, required: true },
  vehicleType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TravelPreference = mongoose.model(
  "TravelPreference",
  TravelPreferenceSchema
);

module.exports = TravelPreference;
