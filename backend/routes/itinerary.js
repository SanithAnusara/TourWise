const express = require('express');
const router = express.Router();
const TravelPreference = require('../models/TravelPreference'); // Import the model

// Route to save user preferences
router.post('/save-preferences', async (req, res) => {
  try {
    const newPreference = new TravelPreference(req.body);
    await newPreference.save();
    res.json({ message: 'Preferences saved successfully', data: newPreference });
  } catch (error) {
    res.status(500).json({ error: 'Error saving preferences' });
  }
});

module.exports = router;
