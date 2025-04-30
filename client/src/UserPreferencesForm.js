import React, { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import "./UserPreferencesForm.css";

const libraries = ["places"];

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
  const [isStartSearching, setIsStartSearching] = useState(false);
  const [isEndSearching, setIsEndSearching] = useState(false);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");

  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const isFuelNeeded = vehicleType === "car" || vehicleType === "bike";

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setStartLocation({ lat: latitude, lng: longitude });
          setLocationError("");
          const address = await reverseGeocode(latitude, longitude);
          setStartAddress(address);
          if (startInputRef.current) {
            startInputRef.current.value = address;
          }
        },
        () => {
          setLocationError("Failed to get location. Please select manually.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const reverseGeocode = async (lat, lng) => {
    const apiKey = "AIzaSyA9azTdCHv4RBAQms7mYHlew9TfATz56-E";
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();
    return data.results[0]?.formatted_address || "Unknown location";
  };

  const onStartLoad = (autocomplete) => {
    startAutocompleteRef.current = autocomplete;
    setIsStartSearching(true);
  };

  const onEndLoad = (autocomplete) => {
    endAutocompleteRef.current = autocomplete;
    setIsEndSearching(true);
  };

  const onStartPlaceChanged = () => {
    if (startAutocompleteRef.current) {
      const place = startAutocompleteRef.current.getPlace();
      if (place.geometry) {
        setStartLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setStartAddress(place.formatted_address);
        if (startInputRef.current) {
          startInputRef.current.value = place.formatted_address;
        }
      }
    }
  };

  const onEndPlaceChanged = () => {
    if (endAutocompleteRef.current) {
      const place = endAutocompleteRef.current.getPlace();
      if (place.geometry) {
        setEndLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setEndAddress(place.formatted_address);
        if (endInputRef.current) {
          endInputRef.current.value = place.formatted_address;
        }
      }
    }
  };

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
      fuelEfficiency: isFuelNeeded ? fuelEfficiency : undefined,
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
      if (!saveResponse.ok) {
        throw new Error(saveData.message || "Failed to save preferences.");
      }

      const itineraryResponse = await fetch(
        "http://localhost:4000/api/itineraries/latest"
      );
      const fetchedItinerary = await itineraryResponse.json();
      if (!itineraryResponse.ok) {
        throw new Error(
          fetchedItinerary.message || "Failed to retrieve itinerary."
        );
      }

      const resolvedItinerary = await Promise.all(
        fetchedItinerary.itinerary.map(async (day) => {
          const fromName = await getLocationName(day.From);
          const toName = await getLocationName(day.To);
          return { ...day, From: fromName, To: toName };
        })
      );

      setItinerary({
        ...fetchedItinerary,
        itinerary: resolvedItinerary,
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      setLocationError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const getLocationName = async (latLngString) => {
    if (!latLngString || !latLngString.includes(",")) {
      return latLngString; // fallback to original if format is bad
    }

    const [latStr, lngStr] = latLngString.split(",");
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return latLngString; // fallback again
    }

    const apiKey = "AIzaSyA9azTdCHv4RBAQms7mYHlew9TfATz56-E";
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    const data = await response.json();
    return data.results[0]?.formatted_address || latLngString;
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyA9azTdCHv4RBAQms7mYHlew9TfATz56-E"
      libraries={libraries}
    >
      <form onSubmit={handleSubmit} className="preferences-form">
        <h2>Travel Preferences</h2>

        <div className="form-group">
          <label>Start Location:</label>
          <div className="location-inputs">
            <Autocomplete
              onLoad={onStartLoad}
              onPlaceChanged={onStartPlaceChanged}
            >
              <input
                ref={startInputRef}
                type="text"
                placeholder={
                  isStartSearching ? "Search start location" : "Loading..."
                }
                className="location-search"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
              />
            </Autocomplete>
            <button type="button" onClick={getCurrentLocation} className="btn">
              Use Current Location
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>End Location:</label>
          <Autocomplete onLoad={onEndLoad} onPlaceChanged={onEndPlaceChanged}>
            <input
              ref={endInputRef}
              type="text"
              placeholder={
                isEndSearching ? "Search end location" : "Loading..."
              }
              className="location-search"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
            />
          </Autocomplete>
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={startLocation || center}
          onClick={async (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            if (!startLocation) {
              setStartLocation({ lat, lng });
              const address = await reverseGeocode(lat, lng);
              setStartAddress(address);
              if (startInputRef.current) {
                startInputRef.current.value = address;
              }
            } else {
              setEndLocation({ lat, lng });
              const address = await reverseGeocode(lat, lng);
              setEndAddress(address);
              if (endInputRef.current) {
                endInputRef.current.value = address;
              }
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

          {isFuelNeeded && (
            <>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                required
              >
                <option value="">Select Fuel Type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
              </select>

              <input
                type="number"
                placeholder="Fuel Efficiency (km/l or kWh/km)"
                value={fuelEfficiency}
                onChange={(e) => setFuelEfficiency(e.target.value)}
                required
              />
            </>
          )}
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Preferences"}
        </button>

        {locationError && <p className="error">{locationError}</p>}

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

        {itinerary && (
          <div className="carbon-emission-section">
            <h3>Environmental Impact</h3>
            <div className="emission-details">
              <p>
                <strong>Total Distance:</strong> {itinerary.totalTravelDistance}{" "}
                km
              </p>
              <p>
                <strong>Carbon Emission:</strong> {itinerary.carbonEmission} kg
                CO2
              </p>
              <div className="emission-tips">
                <p>
                  <strong>Impact Level:</strong>{" "}
                  {itinerary.carbonEmission < 50
                    ? "Low Impact 🌱"
                    : itinerary.carbonEmission < 100
                    ? "Moderate Impact 🌿"
                    : "High Impact 🌳"}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </LoadScript>
  );
};

export default UserPreferencesForm;
