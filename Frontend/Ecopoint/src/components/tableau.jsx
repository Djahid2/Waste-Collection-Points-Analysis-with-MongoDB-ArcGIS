import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/tableau.css";
import trash from "../assets/1.svg";

const Tableau = () => {
    const [points, setPoints] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [roads, setRoads] = useState([]); // Add state for roads
    const [editPoint, setEditPoint] = useState(null);
    const [formData, setFormData] = useState({ nom: "", adresse: "", typeDeDechet: "" });
    const [selectedIds, setSelectedIds] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [filterQuartier, setFilterQuartier] = useState("all");
    const [uniqueQuartiers, setUniqueQuartiers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPoint, setNewPoint] = useState({
        FID: 1,
        id: "",
        route: null,
        dsatur: 2,
        amenity: "",
        esatur: "",
        x: "",
        y: ""
    });
    const [closestRoad, setClosestRoad] = useState(null);
    const rowsPerPage = 10;

    useEffect(() => {
        fetchPoints();
        fetchRoads(); // Fetch roads when component mounts
    }, []);

    useEffect(() => {
        // Only fetch neighborhoods after points data is available
        if (points.length > 0) {
            fetchNeighborhoods();
            
            // Extract unique quartier names for filter dropdown
            const quartiers = [...new Set(points.map(p => p.quartier))];
            setUniqueQuartiers(quartiers);
        }
    }, [points]);

    // Add effect to find closest road when coordinates change
    useEffect(() => {
        if (newPoint.x && newPoint.y && roads.length > 0) {
            const closest = findClosestRoad(parseFloat(newPoint.x), parseFloat(newPoint.y));
            setClosestRoad(closest);
        }
    }, [newPoint.x, newPoint.y, roads]);

    const fetchPoints = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/resources/allCollectingPoints");
            const roadsRes = await axios.get("http://localhost:5000/api/resources/allRoads");

            const formatted = res.data.map((p) => {
                const relatedRoad = roadsRes.data.find((road) => road.attributes.FID === p.attributes.route);
                let quartier = relatedRoad?.attributes?.Cartier || null;
                
                // Handle empty strings or null values for quartier
                if (!quartier || quartier.trim() === "") {
                    quartier = "N/A";
                }
                
                return {
                    id: p._id,
                    nom: p.attributes?.amenity || "N/A",
                    typeDeDechet: p.attributes?.esatur || "N/A",
                    degreDeSaturation: p.attributes?.dsatur || "N/A",
                    quartier: quartier,
                    route: p.attributes?.route,
                    x: p.geometry?.x,
                    y: p.geometry?.y
                };
            });

            setPoints(formatted);
        } catch (err) {
            console.error("Erreur de chargement :", err);
        }
    };

    const fetchRoads = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/resources/allRoads");
            setRoads(res.data);
        } catch (err) {
            console.error("Erreur de chargement des routes :", err);
        }
    };

    // Function to call the backend endpoint to update saturation
    const triggerSaturationUpdate = async () => {
        try {
            await axios.post("http://localhost:5000/api/resources/updateSaturation");
            console.log("Saturation update completed");
        } catch (err) {
            console.error("Error updating saturation:", err);
        }
    };
    const triggerCheminOptimalUpdate = async () => {
        try {
            await axios.post("http://localhost:5000/api/resources/updateCheminOptimal");
            console.log("Saturation update completed");
        } catch (err) {
            console.error("Error updating saturation:", err);
        }
    };

    // Function to calculate distance between two points
    const calculateDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    };

    // Function to find the minimum distance from a point to a line segment
    const pointToLineSegmentDistance = (x, y, x1, y1, x2, y2) => {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) // To avoid division by zero
            param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        return calculateDistance(x, y, xx, yy);
    };

    // Function to find the closest road to a given point
    const findClosestRoad = (x, y) => {
        let closestRoad = null;
        let minDistance = Infinity;

        roads.forEach((road) => {
            if (road.geometry && road.geometry.paths && road.geometry.paths.length > 0) {
                // For each path in the road
                for (const path of road.geometry.paths) {
                    // For each segment in the path
                    for (let i = 0; i < path.length - 1; i++) {
                        const [x1, y1] = path[i];
                        const [x2, y2] = path[i + 1];
                        
                        const distance = pointToLineSegmentDistance(x, y, x1, y1, x2, y2);
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestRoad = road;
                        }
                    }
                }
            }
        });

        return closestRoad;
    };

    const handleFilterChange = (e) => {
        setFilterText(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    const handleQuartierFilterChange = (e) => {
        setFilterQuartier(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const filteredRows = points.filter((p) => {
        const nameMatch = p.nom.toLowerCase().includes(filterText);
        const quartierMatch = filterQuartier === "all" || p.quartier === filterQuartier;
        return nameMatch && quartierMatch;
    });

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
   
    const currentRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    
    const handleEdit = (point) => {
        setEditPoint(point.id);
        setFormData({ nom: point.nom, adresse: point.adresse, typeDeDechet: point.typeDeDechet });
    };

    const handleSave = async () => {
        try {
            await axios.patch(`http://localhost:5000/api/resources/updateCollectingPoint/${editPoint}`, {
                amenity: formData.nom,
            });
            setEditPoint(null);
            fetchPoints();
        } catch (err) {
            console.error("Erreur de sauvegarde :", err);
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert("Sélectionnez au moins un point.");
        try {
            await axios.delete(`http://localhost:5000/api/resources/deleteCollectingPoint/${selectedIds}`);
            setSelectedIds([]);
            fetchPoints();
            await triggerSaturationUpdate(); // Call saturation update after deletion
            await triggerCheminOptimalUpdate(); // Call saturation update after deletion
        } catch (err) {
            console.error("Erreur de suppression :", err);
        }
    };

    const handleRowSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    }

    const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    const handleCoordinateChange = (e, field) => {
        const value = e.target.value;
        setNewPoint({ ...newPoint, [field]: value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        
        // Find the closest road if not already found
        const closest = closestRoad || findClosestRoad(parseFloat(newPoint.x), parseFloat(newPoint.y));
        
        if (!closest) {
            alert("Aucune route trouvée. Veuillez vérifier les coordonnées.");
            return;
        }
        
        try {
            await axios.post("http://localhost:5000/api/resources/addCollectingPoint", {
                FID: 1,
                id: `CP${Date.now()}`,
                route: closest.attributes.FID, // Use the FID of the closest road
                dsatur: 2,
                amenity: newPoint.amenity,
                x: parseFloat(newPoint.x),
                y: parseFloat(newPoint.y),
            });
            setShowAddForm(false);
            setNewPoint({ amenity: "", esatur: "", x: "", y: "" });
            setClosestRoad(null);
            fetchPoints(); // Refresh points to update quartier info
            await triggerSaturationUpdate(); // Call saturation update after adding a point
            await triggerCheminOptimalUpdate(); // Call saturation update after adding a point
        } catch (error) {
            console.error("Erreur lors de l'ajout :", error);
        }
    };

    const fetchNeighborhoods = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/resources/allNeighborhoods");
            const roadsRes = await axios.get("http://localhost:5000/api/resources/allRoads");
            
            const formatted = res.data.map((n) => {
                // Find roads associated with this neighborhood
                const relatedRoads = roadsRes.data.filter(
                    road => road.attributes?.Cartier === n.attributes?.name
                );
                
                // Get all points associated with those roads
                const relatedPoints = [];
                relatedRoads.forEach(road => {
                    const roadPoints = points.filter(
                        point => point.route === road.attributes?.FID
                    );
                    relatedPoints.push(...roadPoints);
                });
                
                // Calculate actual distance if there are enough points
                let actualDistance = Infinity;
                if (relatedPoints.length >= 2) {
                    actualDistance = calculateActualAverageDistance(relatedPoints);
                }
                
                return {
                    name: n.attributes?.name || "N/A",
                    superficie: n.attributes?.superficie || 0,
                    population: n.attributes?.population || 0,
                    idealPoints: n.attributes?.ideal_pts || 0,
                    idealDistance: n.attributes?.ideal_dist || 0,
                    actualPoints: relatedPoints.length,
                    actualDistance: actualDistance
                };
            });
            
            setNeighborhoods(formatted);
        } catch (err) {
            console.error("Erreur de chargement des quartiers :", err);
        }
    };

    const calculateActualAverageDistance = (points) => {
        if (points.length < 2) return Infinity;
        
        const distances = [];
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                if (points[i].x && points[i].y && points[j].x && points[j].y) {
                    // Calculate Euclidean distance in kilometers
                    // Note: This is a simplification. For accurate geo distances, 
                    // you might want to use the Haversine formula
                    const distance = Math.sqrt(
                        Math.pow((points[i].x - points[j].x), 2) +
                        Math.pow((points[i].y - points[j].y), 2)
                    ) * 111.32; // Rough conversion from degrees to km at equator
                    
                    distances.push(distance);
                }
            }
        }
        
        if (distances.length === 0) return Infinity;
        return distances.reduce((sum, d) => sum + d, 0) / distances.length;
    };

    return (
        <div className="tableau-container" id="Info">
            <div className="list-btn" style={{ marginBottom: "20px" }}>
                <button onClick={() => setShowAddForm(true)}>Ajouter</button>
                <button onClick={handleDelete}>Supprimer</button>
            </div>

            {showAddForm && (
                <div className="modal-backdrop">
                    <div className="modal-form">
                        <h3>Ajouter un Point de Ramassage</h3>
                        <form onSubmit={handleAddSubmit}>
                            <input
                                type="text"
                                placeholder="Nom (amenity)"
                                value={newPoint.amenity}
                                onChange={(e) => setNewPoint({ ...newPoint, amenity: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Coordonnée X"
                                value={newPoint.x}
                                onChange={(e) => handleCoordinateChange(e, "x")}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Coordonnée Y"
                                value={newPoint.y}
                                onChange={(e) => handleCoordinateChange(e, "y")}
                                required
                            />
                            
                            {/* Display closest road information if available */}
                            {closestRoad && (
                                <div className="closest-road-info" style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f8ff", borderRadius: "4px" }}>
                                    <p><strong>Route la plus proche:</strong> {closestRoad.attributes.name || 'Sans nom'} (FID: {closestRoad.attributes.FID})</p>
                                    <p><strong>Quartier:</strong> {closestRoad.attributes.Cartier?.trim() || 'N/A'}</p>
                                </div>
                            )}
                            
                            <div style={{ marginTop: "10px" }}>
                                <button type="submit">Enregistrer</button>
                                <button type="button" onClick={() => setShowAddForm(false)} style={{ marginLeft: "10px" }}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="filters" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                    <label htmlFor="filterText">Filtrer par nom:</label>
                    <input
                        id="filterText"
                        type="text"
                        placeholder="Filtrer par nom..."
                        value={filterText}
                        onChange={handleFilterChange}
                        style={{ padding: "5px", width: "100%" }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label htmlFor="filterQuartier">Filtrer par quartier:</label>
                    <select
                        id="filterQuartier"
                        value={filterQuartier}
                        onChange={handleQuartierFilterChange}
                        style={{ padding: "5px", width: "100%" }}
                    >
                        <option value="all">Tous les quartiers</option>
                        {uniqueQuartiers.map((quartier, index) => (
                            <option key={index} value={quartier}>
                                {quartier}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <h2>Tableau des Points de Ramassage</h2>
            <table border="1" style={{ width: "100%", textAlign: "left" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Degré de saturation</th>
                        <th>L'état de saturation</th>
                        <th>Quartier</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {currentRows.map((point) => (
                    <tr
                        key={point.id}
                        onClick={() => handleRowSelect(point.id)}
                        onMouseEnter={() => setHoveredRow(point.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                            backgroundColor:
                                hoveredRow === point.id
                                    ? "#f1f1f1"
                                    : selectedIds.includes(point.id)
                                        ? "#f0f8ff"
                                        : "white",
                            cursor: "pointer",
                        }}
                    >
                        <td>{point.id}</td>
                        <td>
                            {editPoint === point.id ? (
                                <input
                                    name="nom"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                />
                            ) : (
                                point.nom
                            )}
                        </td>
                        <td>{point.degreDeSaturation.toFixed(2)}%</td>
                        <td>{point.typeDeDechet === "T" ? "Saturé" : "Non saturé"}</td>
                        <td>{point.quartier}</td>
                        <td>
                            {editPoint === point.id ? (
                                <button onClick={handleSave}>Enregistrer</button>
                            ) : (
                                <button onClick={() => handleEdit(point)}>Modifier</button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="pagination-controls" style={{ marginTop: "10px", textAlign: "center" }}>
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Précédent
                </button>
                <span style={{ margin: "0 10px" }}>
                    Page {currentPage} sur {totalPages || 1}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Suivant
                </button>
            </div>
            <h2>Tableau des Quartiers</h2>
            <table border="1" style={{ width: "100%", textAlign: "left" }}>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Superficie</th>
                        <th>Population</th>
                        <th>Nombre des Points Idéal</th>
                        <th>Distance Idéale entre les Points</th>
                        <th>Nombre des Points Actuels</th>
                        <th>Distance Actuelle Moyenne</th>
                    </tr>
                </thead>
                <tbody>
                    {neighborhoods
                        .sort((a, b) => a.name.localeCompare(b.name)) // Sort neighborhoods alphabetically by name
                        .map((neighborhood, idx) => (
                            <tr key={idx}>
                                <td>{neighborhood.name}</td>
                                <td>{neighborhood.superficie.toFixed(2)} km²</td>
                                <td>{neighborhood.population}</td>
                                <td>{neighborhood.idealPoints}</td>
                                <td>{neighborhood.idealDistance.toFixed(2)} km</td>
                                <td>{neighborhood.actualPoints}</td>
                                <td>
                                    {neighborhood.actualDistance === Infinity 
                                        ? "∞" 
                                        : `${neighborhood.actualDistance.toFixed(2)} km`}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default Tableau;