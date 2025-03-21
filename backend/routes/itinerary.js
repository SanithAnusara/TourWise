const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const Itinerary = require("../models/TravelPreference"); // Ensure this path is correct

dotenv.config();
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create a new itinerary (POST /api/itineraries)
router.post("/itineraries", async (req, res) => {
  const { startLocation, endLocation, groupSize, duration, vehicleType } = req.body;
  const prompt = `Create a travel itinerary plan for the following data.
    From ${startLocation.lat},${startLocation.lng} to ${endLocation.lat},${endLocation.lng},
    A group of ${groupSize} people,
    Duration ${duration} days,
    Travel by ${vehicleType}.
    Consider the sustainability, environmental impact, community involvement, and adherence to ethical practices.
    
    Format the data as an array of days using the following JSON format.
    "Days":[
      {
        "DayNumber" : "Day number",
        "From" : "From location of the day",
        "To" : "To location of the day",
        "Accommodation" : "Accommodation location at the end of the day",
        "Activities" : "Activities to do within the day"
      }]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    // Log the full response for debugging
    console.log("OpenAI Response:", response.choices[0].message.content);

    // Attempt to locate the start and end of JSON content
    const startIndex = response.choices[0].message.content.indexOf('{');
    const endIndex = response.choices[0].message.content.lastIndexOf('}') + 1;  // +1 to include the closing bracket
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      throw new Error("No JSON content found in response, or JSON format is incorrect.");
    }

    // Extract the JSON string
    const jsonString = response.choices[0].message.content.substring(startIndex, endIndex);

    // Parse the JSON data
    const itineraryData = JSON.parse(jsonString);

    const newItinerary = new Itinerary({
      startLocation,
      endLocation,
      groupSize,
      duration,
      vehicleType,
      itinerary: itineraryData.Days
    });

    await newItinerary.save();
    res.status(201).json({ message: "Itinerary created successfully!", data: newItinerary });
  } catch (error) {
    console.error("Error generating or saving itinerary:", error);
    res.status(500).json({ message: "Failed to generate or save itinerary", error: error.message });
  }
});

// Get the latest itinerary
router.get("/itineraries/latest", async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne().sort({ _id: -1 });
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving itinerary", error: error.message });
  }
});

// Get all itineraries (GET /api/itineraries)
router.get("/itineraries", async (req, res) => {
  try {
    const itineraries = await Itinerary.find();
    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving itineraries", error: error.message });
  }
});

// Get a specific itinerary by ID (GET /api/itineraries/:id)
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

// Update an itinerary (PUT /api/itineraries/:id)
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

// Delete an itinerary (DELETE /api/itineraries/:id)
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
