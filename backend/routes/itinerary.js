const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();//router is an instance of express.Router(), which helps define routes separately

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); //Initializing OpenAI API

//Handles user requests to generate an itinerary
router.post("/itineraries", async (req, res) => {
  try {
    const { startLocation, endLocation, groupSize, duration, vehicleType } = req.body; //Extracts travel details from the request body

    //Validating Input Data
    if (!startLocation || !endLocation || !groupSize || !duration || !vehicleType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Generate itinerary using ChatGPT
    const prompt = `Create a ${duration}-day travel itinerary from ${startLocation.lat},${startLocation.lng} 
    to ${endLocation.lat},${endLocation.lng} for a group of ${groupSize} traveling by ${vehicleType}. 
    Include places to visit and activities each day.`;

    //Sending Request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    //Extracts the AI-generated itinerary from the response and returns it as a JSON object to the client
    res.json({ itinerary: response.choices[0].message.content });
    
  } catch (error) {
    console.error("Error generating itinerary:", error);
    res.status(500).json({ message: "Failed to generate itinerary", error: error.message });
  }
});

module.exports = router;
