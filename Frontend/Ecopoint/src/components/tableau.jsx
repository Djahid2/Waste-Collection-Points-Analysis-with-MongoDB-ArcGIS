import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/tableau.css";
import trash from "../assets/1.svg";

const Tableau = () => {
    const [points, setPoints] = useState([]);
    const [editPoint, setEditPoint] = useState(null);
    const [formData, setFormData] = useState({ nom: "", adresse: "", typeDeDechet: "" });
    const [selectedIds, setSelectedIds] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPoint, setNewPoint] = useState({
        FID: 1,
        id: "",
        route: 3,
        dsatur: 2,
        amenity: "",
        esatur: "",
        x: "",
        y: ""
    });
    const rowsPerPage = 10;

    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/resources/allCollectingPoints");
            const formatted = res.data.map((p) => ({
                id: p._id,
                nom: p.attributes?.amenity || "N/A",
                adresse: `X: ${p.geometry?.x}, Y: ${p.geometry?.y}`,
                typeDeDechet: p.attributes?.esatur || "N/A",
            }));
            setPoints(formatted);
        } catch (err) {
            console.error("Erreur de chargement :", err);
        }
    };

   
    const handleFilterChange = (e) => setFilterText(e.target.value.toLowerCase());


    const filteredRows = points.filter((p) =>
        p.nom.toLowerCase().includes(filterText)
    );

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

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/resources/addCollectingPoint", {
                FID: 1,
                id: `CP${Date.now()}`,
                route: 3,
                dsatur: 2,
                amenity: newPoint.amenity,
                esatur: newPoint.esatur,
                x: parseFloat(newPoint.x),
                y: parseFloat(newPoint.y),
            });
            setShowAddForm(false);
            setNewPoint({ amenity: "", esatur: "", x: "", y: "" });
            fetchPoints();
        } catch (error) {
            console.error("Erreur lors de l’ajout :", error);
        }
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
                                type="text"
                                placeholder="État de saturation (esatur)"
                                value={newPoint.esatur}
                                onChange={(e) => setNewPoint({ ...newPoint, esatur: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Coordonnée X"
                                value={newPoint.x}
                                onChange={(e) => setNewPoint({ ...newPoint, x: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Coordonnée Y"
                                value={newPoint.y}
                                onChange={(e) => setNewPoint({ ...newPoint, y: e.target.value })}
                                required
                            />
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

            <input
                type="text"
                placeholder="Filtrer par nom..."
                value={filterText}
                onChange={handleFilterChange}
                style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
            />

            <h2>Tableau des Points de Ramassage</h2>
            <table border="1" style={{ width: "100%", textAlign: "left" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Adresse</th>
                        <th>L’état de saturation</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    {currentRows.map((point) => (
        <tr
            key={point.id} // Déplacez la clé ici
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
            <td>{point.adresse}</td>
            <td>{point.typeDeDechet}</td>
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
                    Page {currentPage} sur {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Suivant
                </button>
            </div>
        </div>
    );
};

export default Tableau;

