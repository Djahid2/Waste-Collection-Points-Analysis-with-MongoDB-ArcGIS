import React, { useState } from "react";
import "../css/tableau.css"; // Assuming you have a CSS file for styling
const Tableau = () => {
    const [pointsDeRamassage, setPointsDeRamassage] = useState([
        { id: 1, nom: "Point A", adresse: "123 Rue Principale", typeDeDechet: "Plastique" },
        { id: 2, nom: "Point B", adresse: "456 Avenue Centrale", typeDeDechet: "Papier" },
        { id: 3, nom: "Point C", adresse: "789 Boulevard Sud", typeDeDechet: "Verre" },
    ]);

    const [editPoint, setEditPoint] = useState(null);
    const [formData, setFormData] = useState({ nom: "", adresse: "", typeDeDechet: "" });
    const [selectedPointIds, setSelectedPointIds] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Number of rows per page
    const [filterText, setFilterText] = useState("");

    const handleFilterChange = (e) => {
        setFilterText(e.target.value.toLowerCase());
    };

    const filteredRows = pointsDeRamassage.filter((point) =>
        point.nom.toLowerCase().includes(filterText)
    );

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

    const handleEdit = (point) => {
        setEditPoint(point.id);
        setFormData({ nom: point.nom, adresse: point.adresse, typeDeDechet: point.typeDeDechet });
    };

    const handleSave = () => {
        setPointsDeRamassage((prev) =>
            prev.map((point) =>
                point.id === editPoint ? { ...point, ...formData } : point
            )
        );
        setEditPoint(null);
        setFormData({ nom: "", adresse: "", typeDeDechet: "" });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRowSelect = (id) => {
        setSelectedPointIds((prev) =>
            prev.includes(id) ? prev.filter((pointId) => pointId !== id) : [...prev, id]
        );
    };

    const handleDelete = () => {
        if (selectedPointIds.length > 0) {
            setPointsDeRamassage((prev) =>
                prev.filter((point) => !selectedPointIds.includes(point.id))
            );
            setSelectedPointIds([]);
        } else {
            alert("Veuillez sélectionner au moins une ligne à supprimer.");
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <div  className="tableau-container" id="Info">
        <div>
            <div className="list-btn" style={{ marginBottom: "20px"}}>
                <button onClick={() => alert("Ajouter un point de ramassage")}>Ajouter</button>
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
                                backgroundColor: hoveredRow === point.id
                                ? "#f1f1f1" // Effet hover
                                : selectedPointIds.includes(point.id)
                                ? "#f0f8ff" // Si sélectionné
                                : point.id % 2 === 0
                                ? "#f2f2f2" // Alternance pour les lignes paires
                                : "white", // Alternance pour les lignes impaires
                              cursor: "pointer",
                            }}
                        >
                            <td>{point.id}</td>
                            <td>
                                {editPoint === point.id ? (
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    point.nom
                                )}
                            </td>
                            <td>
                                {editPoint === point.id ? (
                                    <input
                                        type="text"
                                        name="adresse"
                                        value={formData.adresse}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    point.adresse
                                )}
                            </td>
                            <td>
                                {editPoint === point.id ? (
                                    <input
                                        type="text"
                                        name="typeDeDechet"
                                        value={formData.typeDeDechet}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    point.typeDeDechet
                                )}
                            </td>
                            <td>
                                {editPoint === point.id ? (
                                    <button onClick={handleSave}>Save</button>
                                ) : (
                                    <button onClick={() => handleEdit(point)}>Edit</button>
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
        </div>
    );
};

export default Tableau;