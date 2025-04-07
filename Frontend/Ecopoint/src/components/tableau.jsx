import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/tableau.css";

const Tableau = () => {
    const [points, setPoints] = useState([]);
    const [editPoint, setEditPoint] = useState(null);
    const [formData, setFormData] = useState({ nom: "", adresse: "", typeDeDechet: "" });
    const [selectedIds, setSelectedIds] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Load from backend
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
            await axios.put(`http://localhost:5000/api/resources/updateCollectingPoint/${editPoint}`, {
                attributes: {
                    amenity: formData.nom,
                    esatur: formData.typeDeDechet,
                }
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
            await axios.delete("http://localhost:5000/api/resources/deleteCollectingPoint", {
                data: { ids: selectedIds }
            });
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
    };

    const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <div className="tableau-container" id="Info">
            <div className="list-btn" style={{ marginBottom: "20px" }}>
                <button onClick={() => alert("Formulaire d’ajout à implémenter...")}>Ajouter</button>
                <button onClick={handleDelete}>Supprimer</button>
            </div>
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
                        <th>Type de Déchet</th>
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
                                    <input name="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} />
                                ) : (
                                    point.nom
                                )}
                            </td>
                            <td>{point.adresse}</td>
                            <td>
                                {editPoint === point.id ? (
                                    <input name="typeDeDechet" value={formData.typeDeDechet} onChange={(e) => setFormData({ ...formData, typeDeDechet: e.target.value })} />
                                ) : (
                                    point.typeDeDechet
                                )}
                            </td>
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
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>Précédent</button>
                <span style={{ margin: "0 10px" }}>Page {currentPage} sur {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Suivant</button>
            </div>
        </div>
    );
};

export default Tableau;
