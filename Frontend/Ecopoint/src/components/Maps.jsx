import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../css/map.css"; // Ensure you have this CSS for styling the map container
import tr1 from "../assets/1.svg";
import tr2 from "../assets/2.svg";
import L from "leaflet";
const icon1 = new L.Icon({
  iconUrl: tr1,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const icon2 = new L.Icon({
  iconUrl: tr2,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

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
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {points.map((point) => {
            const position = [point.geometry.y, point.geometry.x];
            const icon = point.attributes.esatur === "F" ? icon1 : icon2;

            return (
              <Marker key={point._id} position={position} icon={icon}>
                <Popup>
                <span style={{fontStyle:"italic",marginLeft:"20%"}}>{point.attributes.amenity}</span> <br />
                  <span style={{fontWeight:"bolder"}}>Etat de saturation:</span> {point.attributes.esatur === "T" ? "Saturé" : "Non saturé"}<br />
                  <span style={{fontWeight:"bolder"}}>Degré de saturation:</span> <span style={{color:point.attributes.esatur === "T" ? "red" : "green"}}>{point.attributes.dsatur.toFixed(2)}%</span>
                </Popup>
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
