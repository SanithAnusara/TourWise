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
  lat: 6.9271,
  lng: 79.8612,
};

const UserPreferencesForm = () => {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [groupSize, setGroupSize] = useState(1);
  const [duration, setDuration] = useState(1);
  const [vehicleType, setVehicleType] = useState("");
  const [locationError, setLocationError] = useState("");
  const [itinerary, setItinerary] = useState(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStartLocation({ lat: latitude, lng: longitude });
          setLocationError("");
        },
        (error) => {
          setLocationError("Failed to get location. Please select manually.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const resetLocations = () => {
    setStartLocation(null);
    setEndLocation(null);
    setLocationError("");
  };

  const handleSubmit = (e) => {
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
    };

    fetch("http://localhost:4000/api/save-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((res) => res.json())
      .then(() =>
        fetch("http://localhost:4000/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        })
      )
      .then((res) => res.json())
      .then((data) => {
        if (data.itinerary) {
          setItinerary(data.itinerary);
        } else {
          throw new Error("Itinerary generation failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setLocationError(`Failed to generate itinerary: ${error.message}`);
      });
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyA9azTdCHv4RBAQms7mYHlew9TfATz56-E">
      <form onSubmit={handleSubmit} className="preferences-form">
        <h2>Travel Preferences</h2>
        <div className="form-group">
          <label>Start Location:</label>
          <button type="button" onClick={getCurrentLocation} className="btn">
            Use Current Location
          </button>
          <button
            type="button"
            onClick={resetLocations}
            className="btn btn-secondary"
          >
            Reset Locations
          </button>
          {locationError && <p className="error">{locationError}</p>}
        </div>

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
        </div>

        <button type="submit" className="btn-submit">
          Submit Preferences
        </button>

        {itinerary && (
          <div className="itinerary-section">
            <h3>Generated Itinerary</h3>
            <pre>{JSON.stringify(itinerary, null, 2)}</pre>
          </div>
        )}
      </form>
    </LoadScript>
  );
};

export default UserPreferencesForm;
