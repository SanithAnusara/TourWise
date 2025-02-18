const express = require("express");
const OpenAI = require("openai"); // Ensure you install: npm install openai
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/generate-itinerary", async (req, res) => {
  try {
    const { startLocation, endLocation, groupSize, duration, vehicleType } = req.body;

    if (!startLocation || !endLocation || !groupSize || !duration || !vehicleType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Generate itinerary using ChatGPT
    const prompt = `Create a ${duration}-day travel itinerary from ${startLocation.lat},${startLocation.lng} 
    to ${endLocation.lat},${endLocation.lng} for a group of ${groupSize} traveling by ${vehicleType}. 
    Include places to visit and activities each day.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ itinerary: response.choices[0].message.content });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    res.status(500).json({ message: "Failed to generate itinerary", error: error.message });
  }
});

module.exports = router;
