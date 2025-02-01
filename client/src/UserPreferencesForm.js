import React, { useState } from 'react';
import './UserPreferencesForm.css';


const UserPreferencesForm = () => {
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [groupSize, setGroupSize] = useState(1);
    const [duration, setDuration] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [locationError, setLocationError] = useState('');

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setStartLocation(`Lat: ${latitude}, Lon: ${longitude}`);
                    setLocationError('');
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            setLocationError('User denied the request for Geolocation.');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setLocationError('Location information is unavailable.');
                            break;
                        case error.TIMEOUT:
                            setLocationError('The request to get user location timed out.');
                            break;
                        default:
                            setLocationError('An unknown error occurred.');
                            break;
                    }
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = { startLocation, endLocation, groupSize, duration, vehicleType };
      
        // First, save user preferences in the database
        fetch('http://localhost:4000/api/save-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        })
          .then((res) => res.json())
          .then((savedData) => {
            console.log('Saved Preferences:', savedData);
      
            // Then, generate itinerary
            return fetch('http://localhost:4000/api/generate-itinerary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
            });
          })
          .then((res) => res.json())
          .then((itineraryData) => {
            console.log('Itinerary Response:', itineraryData);
            setItinerary(itineraryData.itinerary); // Store itinerary in state
          })
          .catch((err) => console.error('Error:', err));
      };
      
      
      
      
      
      

    return (
        <form onSubmit={handleSubmit} className="preferences-form">
            <h2>Travel Preferences</h2>

            <div className="form-group">
                <label>Start Location:</label>
                <div>
                    <input
                        type="text"
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                        required
                    />
                    <button type="button" onClick={getCurrentLocation} className="location-btn">
                        Use Current Location
                    </button>
                </div>
                {locationError && <p className="error-text">{locationError}</p>}
            </div>

            <div className="form-group">
                <label>End Location:</label>
                <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Group Size:</label>
                <input
                    type="number"
                    value={groupSize}
                    min="1"
                    onChange={(e) => setGroupSize(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Duration (in days):</label>
                <input
                    type="number"
                    value={duration}
                    min="1"
                    onChange={(e) => setDuration(e.target.value)}
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
                    <option value="" disabled>Select Vehicle</option>
                    <option value="car">Car</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="bike">Bike</option>
                    <option value="walk">Walk</option>
                </select>
            </div>

            <button type="submit" className="submit-btn">
                Submit Preferences
            </button>
        </form>
    );
};

export default UserPreferencesForm;