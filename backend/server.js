const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TravelPreference = require('./models/TravelPreference'); // Import the model

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

// Include the itinerary route for planning suggestions
const itineraryRoute = require('./routes/itinerary');
app.use('/api', itineraryRoute);

// Save user data to the database
app.post('/api/save-preferences', (req, res) => {
  const { startLocation, endLocation, groupSize, duration, vehicleType } = req.body;

  const newPreference = new TravelPreference({
    startLocation,
    endLocation,
    groupSize,
    duration,
    vehicleType,
  });

  newPreference.save()
    .then(() => {
      res.status(200).json({ message: 'Preferences saved successfully!' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error saving preferences' });
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
