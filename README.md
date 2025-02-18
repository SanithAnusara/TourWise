# TourWise
**TourWise** is a MERN stack web application that simplifies travel planning with personalized itinerary recommendations powered by ChatGPT API and a carbon emission calculator for eco-friendly decision-making. It promotes sustainable tourism by integrating data-driven insights and user-friendly features.

# TourWise Project Setup Guide

This guide provides step-by-step instructions to set up and run the TourWise project on your local machine.

## 1. Navigate to the Project Directory

cd TourWise

## 2. Install Dependencies

### Backend:

cd backend
npm install

### Frontend:

cd ../client
npm install

## 3. Set Up Environment Variables

Create a `.env` file in the **backend** folder with the following content:

MONGO_URI=<Your MongoDB Atlas connection string>
OPENAI_API_KEY=<Your OpenAI API key>


(*Replace the placeholders with your actual MongoDB and OpenAI credentials.*)

---

## 4. Run the Project

### Backend:

cd backend
npm start

### Frontend:

cd client
npm start

## 5. Open the App

Visit the following URL in your browser:
```
http://localhost:3000
```

---

## Prerequisites
- **Node.js** and **npm** installed on your machine.
- MongoDB Atlas account and OpenAI API key.

[Download Node.js](https://nodejs.org/)

----------------------------------------------------
