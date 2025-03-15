const express = require("express");
const cors = require("cors");//Enables Cross-Origin Resource Sharing (allows the frontend to communicate with the backend)
const bodyParser = require("body-parser");//Middleware to parse incoming request bodies (JSON)
const mongoose = require("mongoose");
const dotenv = require("dotenv");//Loads environment variables
const TravelPreference = require("./models/TravelPreference"); // Import the model

dotenv.config();

const app = express(); //Initializes the Express application
app.use(cors()); //Enables CORS so that the API can be accessed from different domains
app.use(bodyParser.json()); //Ensures incoming JSON requests are parsed properly.


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,//Uses MongoDB’s new server discovery and monitoring engine
  serverSelectionTimeoutMS: 10000 // Timeout if it can't connect in 10s
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));


// Include the itinerary route for planning suggestions
const itineraryRoute = require("./routes/itinerary");
app.use("/api", itineraryRoute);//All routes in itinerary.js are prefixed with /api

// Save user data to the database
app.post("/api/save-preferences", async (req, res) => {
  try {
    let { startLocation, endLocation, groupSize, duration, vehicleType } = req.body;

    // Ensure startLocation and endLocation are stored correctly
    if (typeof startLocation === "string" || typeof endLocation === "string") {
      return res.status(400).json({ message: "Invalid location format. Must include lat and lng." });
    }

    //Creates a new Mongoose document using the TravelPreference model and populates it with the extracted data.
    const newPreference = new TravelPreference({
      startLocation,
      endLocation,
      groupSize,
      duration,
      vehicleType,
    });
    await newPreference.save();

    res.status(200).json({ message: "Preferences saved successfully!", data: newPreference });
  } catch (err) {
    console.error("Error saving preferences:", err);
    res.status(500).json({ message: "Error saving preferences", error: err.message });
  }
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
