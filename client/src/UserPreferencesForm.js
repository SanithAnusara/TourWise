import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./UserPreferencesForm.css";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "10px",
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
  const [fuelType, setFuelType] = useState("");
  const [fuelEfficiency, setFuelEfficiency] = useState("");
  const [locationError, setLocationError] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Conditional input fields based on vehicle type
  const isFuelNeeded = vehicleType === 'car' || vehicleType === 'bike';

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

    const userData = {
      startLocation,
      endLocation,
      groupSize,
      duration,
      vehicleType,
      fuelType: isFuelNeeded ? fuelType : undefined,
      fuelEfficiency: isFuelNeeded ? fuelEfficiency : undefined
    };

    try {
      setLoading(true);
      const saveResponse = await fetch(
        "http://localhost:4000/api/itineraries",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const saveData = await saveResponse.json();
      console.log("POST Response:", saveData); // Check what is being returned after posting preferences

      if (!saveResponse.ok)
        throw new Error(saveData.message || "Failed to save preferences.");

      const itineraryResponse = await fetch(
        "http://localhost:4000/api/itineraries/latest"
      );
      const fetchedItinerary = await itineraryResponse.json();
      console.log("Fetched Itinerary:", fetchedItinerary); // Verify fetched itinerary data

      if (!itineraryResponse.ok)
        throw new Error(
          fetchedItinerary.message || "Failed to retrieve itinerary."
        );

      setItinerary(fetchedItinerary); // Set itinerary if successfully fetched
    } catch (error) {
      console.error(`Error: ${error.message}`);
      setLocationError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyDJTBEHycR37sSWikqUffU8ok7OJt64ckY">
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
              setStartLocation({
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              });
            } else {
              setEndLocation({
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              });
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
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Vehicle
            </option>
            <option value="car">Car</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="bike">Bike</option>
            <option value="walk">Walk</option>
          </select>

          {isFuelNeeded && (
          <>
            <select value={fuelType} onChange={e => setFuelType(e.target.value)} required>
              <option value="">Select Fuel Type</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
            </select>

            <input 
              type="number" 
              placeholder="Fuel Efficiency (km/l or kWh/km)" 
              value={fuelEfficiency} 
              onChange={e => setFuelEfficiency(e.target.value)} 
              required 
            />
          </>
        )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Preferences"}
        </button>

        {/* Display Errors */}
        {locationError && <p className="error">{locationError}</p>}

        {/* Itinerary Output */}
        {itinerary && itinerary.itinerary && itinerary.itinerary.length > 0 && (
          <div className="itinerary-section">
            <h3>Generated Itinerary</h3>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Accommodation</th>
                  <th>Activities</th>
                </tr>
              </thead>
              <tbody>
                {itinerary.itinerary.map((day, index) => (
                  <tr key={index}>
                    <td>{day.DayNumber}</td>
                    <td>{day.From}</td>
                    <td>{day.To}</td>
                    <td>{day.Accommodation}</td>
                    <td>{day.Activities.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>
    </LoadScript>
  );
};

export default UserPreferencesForm;