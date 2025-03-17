const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const Itinerary = require("../models/TravelPreference");

dotenv.config();
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/itineraries", async (req, res) => {
  const { startLocation, endLocation, groupSize, duration, vehicleType } = req.body;

  if (!startLocation || !endLocation || !groupSize || !duration || !vehicleType) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const prompt = `Create a travel itinerary plan for the following data.
    From ${startLocation.lat},${startLocation.lng} to ${endLocation.lat},${endLocation.lng},
    A group of ${groupSize} people,
    Duration ${duration} days,
    Travel by ${vehicleType}.
    Consider the sustainability, environmental impact, community involvement, and adherence to ethical practices.
    
    Format the data as an array of days using the following JSON format.
    "Days":[
      {
        "DayNumber" : "1",
        "From" : "Location A",
        "To" : "Location B",
        "Accommodation" : "Hotel XYZ",
        "Activities" : "Activity 1, Activity 2"
      }]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("OpenAI Response:", response.choices[0].message.content); // Debug: log the response

    // Assuming the response is wrapped in some non-JSON preamble or postamble:
    let jsonResponse = response.choices[0].message.content;
    jsonResponse = jsonResponse.substring(jsonResponse.indexOf('{'), jsonResponse.lastIndexOf('}') + 1); // Trim non-JSON parts if needed

    const itinerary = JSON.parse(jsonResponse); // Now attempt to parse it

    const newItinerary = new Itinerary({
      startLocation,
      endLocation,
      groupSize,
      duration,
      vehicleType,
      itinerary: itinerary.Days
    });

    await newItinerary.save();
    res.status(201).json({ message: "Itinerary created successfully!", data: newItinerary });
  } catch (error) {
    console.error("Error generating or saving itinerary:", error);
    res.status(500).json({ message: "Failed to generate or save itinerary", error: error.message });
  }
});


module.exports = router;
