import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../css/map.css"; // Ensure you have this CSS for styling the map container

const MapComponent = () => {
  const center = [36.7268319170765, 3.1853721052532684]; // Initial center of the map
  const [points, setPoints] = useState([]);

  useEffect(() => {
    // Fetch points data from the server
    const fetchPoints = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/resources/allCollectingPoints");
        const data = await response.json();
        console.log("Fetched points:", data); 
        setPoints(data); 
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };

    fetchPoints();
  }, []); 

  return (
    <div id="Maps">
      <h2>Maps</h2>
      <div className="map1">
        <div className="map-container">
          <MapContainer center={center} zoom={14} className="leaflet-container">
            {/* Map background using OpenStreetMap */}
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Dynamically render markers */}
            {points.map((point) => {
              const position = [point.geometry.y, point.geometry.x]; // Make sure to use [latitude, longitude]
              console.log("Marker position:", position); // Log for debugging
              return (
                <Marker key={point._id} position={position}>
                  <Popup>{point.attributes.amenity}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
