const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const Itinerary = require("../models/TravelPreference");

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Create a new itinerary (POST /api/itineraries)
router.post("/itineraries", async (req, res) => {
  try {
    const { startLocation, endLocation, groupSize, duration, vehicleType } = req.body;

    if (!startLocation || !endLocation || !groupSize || !duration || !vehicleType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `Create a ${duration}-day travel itinerary from ${startLocation.lat},${startLocation.lng} 
    to ${endLocation.lat},${endLocation.lng} for a group of ${groupSize} traveling by ${vehicleType}. 
    Include places to visit and activities each day.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const itinerary = response.choices[0].message.content;

    // Save itinerary in MongoDB
    const newItinerary = new Itinerary({
      startLocation,
      endLocation,
      groupSize,
      duration,
      vehicleType,
      itineraryText: itinerary,
    });

    await newItinerary.save();
    res.status(201).json({ message: "Itinerary created successfully!", data: newItinerary });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    res.status(500).json({ message: "Failed to generate itinerary", error: error.message });
  }
});

// ✅ Get all itineraries (GET /api/itineraries)
router.get("/itineraries", async (req, res) => {
  try {
    const itineraries = await Itinerary.find();
    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving itineraries", error: error.message });
  }
});

// ✅ Get a specific itinerary by ID (GET /api/itineraries/:id)
router.get("/itineraries/:id", async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving itinerary", error: error.message });
  }
});

// ✅ Update an itinerary (PUT /api/itineraries/:id)
router.put("/itineraries/:id", async (req, res) => {
  try {
    const updatedItinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json({ message: "Itinerary updated successfully!", data: updatedItinerary });
  } catch (error) {
    res.status(500).json({ message: "Error updating itinerary", error: error.message });
  }
});

// ✅ Delete an itinerary (DELETE /api/itineraries/:id)
router.delete("/itineraries/:id", async (req, res) => {
  try {
    const deletedItinerary = await Itinerary.findByIdAndDelete(req.params.id);
    if (!deletedItinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json({ message: "Itinerary deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting itinerary", error: error.message });
  }
});

module.exports = router;
