import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./UserPreferencesForm.css";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
};

const center = {
  lat: 51.5166,
  lng: 0.1353,
};

const UserPreferencesForm = () => {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [groupSize, setGroupSize] = useState(1);
  const [duration, setDuration] = useState(1);
  const [vehicleType, setVehicleType] = useState("");
  const [locationError, setLocationError] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStartLocation({ lat: latitude, lng: longitude });
          setLocationError("");
        },
        () => {
          setLocationError("Failed to get location. Please select manually.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startLocation || !endLocation) {
      setLocationError("Please select both start and end locations.");
      return;
    }

    const userData = { startLocation, endLocation, groupSize, duration, vehicleType };

    try {
      setLoading(true);
      const saveResponse = await fetch("http://localhost:4000/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const saveData = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saveData.message || "Failed to save preferences.");

      setItinerary(saveData.data.itineraryText);
    } catch (error) {
      setLocationError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <form onSubmit={handleSubmit} className="preferences-form">
        <h2>Travel Preferences</h2>

        {/* Start Location */}
        <div className="form-group">
          <label>Start Location:</label>
          <button type="button" onClick={getCurrentLocation} className="btn">
            Use Current Location
          </button>
        </div>

        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={startLocation || center}
          onClick={(event) => {
            if (!startLocation) {
              setStartLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            } else {
              setEndLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            }
          }}
        >
          {startLocation && <Marker position={startLocation} />}
          {endLocation && <Marker position={endLocation} />}
        </GoogleMap>

        {/* Group Size */}
        <div className="form-group">
          <label>Group Size:</label>
          <input
            type="number"
            value={groupSize}
            min="1"
            onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        {/* Duration */}
        <div className="form-group">
          <label>Duration (days):</label>
          <input
            type="number"
            value={duration}
            min="1"
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        {/* Vehicle Type */}
        <div className="form-group">
          <label>Vehicle Type:</label>
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required>
            <option value="" disabled>Select Vehicle</option>
            <option value="car">Car</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="bike">Bike</option>
            <option value="walk">Walk</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Preferences"}
        </button>

        {/* Display Errors */}
        {locationError && <p className="error">{locationError}</p>}

        {/* Itinerary Output */}
        {itinerary && (
          <div className="itinerary-section">
            <h3>Generated Itinerary</h3>
            <pre>{itinerary}</pre>
          </div>
        )}
      </form>
    </LoadScript>
  );
};

export default UserPreferencesForm;
