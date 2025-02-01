const mongoose = require('mongoose');

const TravelPreferenceSchema = new mongoose.Schema({
  startLocation: String,
  endLocation: String,
  groupSize: Number,
  duration: Number,
  vehicleType: String,
  createdAt: { type: Date, default: Date.now },
});

const TravelPreference = mongoose.model('TravelPreference', TravelPreferenceSchema);

module.exports = TravelPreference;
