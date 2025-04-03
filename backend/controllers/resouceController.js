import Road from "../models/roadModel.js";
import CollectingPoint from "../models/collectingPointModel.js";
import Neighborhood from "../models/neighbourhoodModel.js";
import Commun from "../models/communModel.js";
import { binStatus, binFrequency, roadType } from "../constants/enums.js";


// Controller functions for handling requests related to roads, collecting points, and neighborhoods
//get all roads, collecting points, and neighborhoods
const getAllRoads = async (req, res) => {
    try {
        const roads = await Road.find({});
        res.status(200).json(roads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const getAllCollectingPoints = async (req, res) => {
    try {
        const collectingPoints = await CollectingPoint.find({});
        res.status(200).json(collectingPoints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const getAllNeighborhoods = async (req, res) => {
    try {
        const neighborhoods = await Neighborhood.find({});
        res.status(200).json(neighborhoods);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const getAllCommuns = async (req, res) => {
    try {
        const communs = await Commun.find({});
        res.status(200).json(communs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Add new road, collecting point, and neighborhood
const addRoad = async (req, res) => {
    try {
        const { osm_id, name, type, geometry } = req.body;
        if (!osm_id || !geometry) {
            return res.status(400).json({ message: "osm_id and geometry are required" });
        }
        if (!Object.values(roadType).includes(type)) {
            return res.status(400).json({ message: "Invalid road type" });
        }
        if (geometry.type !== 'LineString') {
            return res.status(400).json({ message: "Invalid geometry type" });
        }
        if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
            return res.status(400).json({ message: "Invalid coordinates" });
        }
        const road = new Road({ osm_id, name, type, geometry });
        await road.save();
        res.status(201).json(road);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const addCollectingPoint = async (req, res) => {
    try {
        const { name, road, location, capacity, frequency, status } = req.body;
        if (!road || !location || !capacity || !frequency || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!Object.values(binStatus).includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        if (!Object.values(binFrequency).includes(frequency)) {
            return res.status(400).json({ message: "Invalid frequency" });
        }
        if (location.type !== 'Point') {
            return res.status(400).json({ message: "Invalid location type" });
        }
        if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            return res.status(400).json({ message: "Invalid coordinates" });
        }
        const collectingPoint = new CollectingPoint({ name, road, location, capacity, frequency });
        await collectingPoint.save();
        res.status(201).json(collectingPoint);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });

    }
}

const addNeighborhood = async (req, res) => {
    try {
        const { name, osm_id, geometry, collectingPoints, roads, population, area } = req.body;
        if (!osm_id || !geometry) {
            return res.status(400).json({ message: "osm_id and geometry are required" });
        }
        if (geometry.type !== 'Polygon') {
            return res.status(400).json({ message: "Invalid geometry type" });
        }
        if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
            return res.status(400).json({ message: "Invalid coordinates" });
        }
        if (collectingPoints && !Array.isArray(collectingPoints)) {
            return res.status(400).json({ message: "Invalid collecting points" });
        }
        if (roads && !Array.isArray(roads)) {
            return res.status(400).json({ message: "Invalid roads" });
        }
        if (population && typeof population !== 'number') {
            return res.status(400).json({ message: "Invalid population" });
        }
        if (area && typeof area !== 'number') {
            return res.status(400).json({ message: "Invalid area" });
        }

        const neighborhood = new Neighborhood({ name, osm_id, geometry, population, area });
        await neighborhood.save();
        res.status(201).json(neighborhood);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Delete road, collecting point, and neighborhood by id
const deleteRoad = async (req, res) => {
    try {
        const { id } = req.params;
        const road = await Road.findByIdAndDelete(id);
        if (!road) {
            return res.status(404).json({ message: "Road not found" });
        }

        res.status(200).json({ message: "Road deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
const deleteCollectingPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const collectingPoint = await CollectingPoint.findByIdAndDelete(id);
        if (!collectingPoint) {
            return res.status(404).json({ message: "Collecting point not found" });
        }
        res.status(200).json({ message: "Collecting point deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const deleteNeighborhood = async (req, res) => {
    try {
        const { id } = req.params;
        const neighborhood = await Neighborhood.findByIdAndDelete(id);
        if (!neighborhood) {
            return res.status(404).json({ message: "Neighborhood not found" });
        }
        res.status(200).json({ message: "Neighborhood deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Update road, collecting point, and neighborhood by id
//it only update the provided fields, not all fields
const updateCollectingPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, road, location, capacity, frequency, status } = req.body;

        const updateFields = {};

        if (name) updateFields.name = name;
        if (road) updateFields.road = road;
        if (capacity) updateFields.capacity = capacity;
        if (status) {
            if (!Object.values(binStatus).includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }
            updateFields.status = status;
        }
        if (frequency) {
            if (!Object.values(binFrequency).includes(frequency)) {
                return res.status(400).json({ message: "Invalid frequency" });
            }
            updateFields.frequency = frequency;
        }
        if (location) {
            if (location.type !== 'Point') {
                return res.status(400).json({ message: "Invalid location type" });
            }
            if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
                return res.status(400).json({ message: "Invalid coordinates" });
            }
            updateFields.location = location;
        }

        // Update only the provided fields
        const collectingPoint = await CollectingPoint.findByIdAndUpdate(id, updateFields, { new: true });

        if (!collectingPoint) {
            return res.status(404).json({ message: "Collecting point not found" });
        }

        res.status(200).json(collectingPoint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateNeighborhood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, geometry, collectingPoints, roads, population, area } = req.body;

        // Initialize an empty object to store update fields
        const updateFields = {};

        if (name) updateFields.name = name;
        if (population) updateFields.population = population;
        if (area) updateFields.area = area;

        // Validate and update geometry if provided
        if (geometry) {
            if (geometry.type !== 'Polygon') {
                return res.status(400).json({ message: "Invalid geometry type, must be 'Polygon'" });
            }
            if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.every(coord => Array.isArray(coord))) {
                return res.status(400).json({ message: "Invalid geometry coordinates" });
            }
            updateFields.geometry = geometry;
        }

        // Validate and update collectingPoints if provided
        if (collectingPoints) {
            if (!Array.isArray(collectingPoints)) {
                return res.status(400).json({ message: "collectingPoints must be an array" });
            }
            updateFields.collectingPoints = collectingPoints;
        }

        // Validate and update roads if provided
        if (roads) {
            if (!Array.isArray(roads)) {
                return res.status(400).json({ message: "roads must be an array" });
            }
            updateFields.roads = roads;
        }

        // Update only the provided fields
        const neighborhood = await Neighborhood.findByIdAndUpdate(id, updateFields, { new: true });

        if (!neighborhood) {
            return res.status(404).json({ message: "Neighborhood not found" });
        }

        res.status(200).json(neighborhood);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateRoad = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, geometry } = req.body;

        // Initialize an object to store only fields to be updated
        const updateFields = {};

        if (name) updateFields.name = name;

        // Validate road type if provided
        if (type) {
            if (!roadType || !Object.values(roadType).includes(type)) {
                return res.status(400).json({ message: "Invalid road type" });
            }
            updateFields.type = type;
        }

        // Validate and update geometry if provided
        if (geometry) {
            if (geometry.type !== 'LineString') {
                return res.status(400).json({ message: "Invalid geometry type, must be 'LineString'" });
            }
            if (!Array.isArray(geometry.coordinates) || geometry.coordinates.some(coord => !Array.isArray(coord) || coord.length !== 2)) {
                return res.status(400).json({ message: "Invalid geometry coordinates, must be an array of [longitude, latitude] pairs" });
            }
            updateFields.geometry = geometry;
        }

        // Update only provided fields
        const road = await Road.findByIdAndUpdate(id, updateFields, { new: true });

        if (!road) {
            return res.status(404).json({ message: "Road not found" });
        }

        res.status(200).json(road);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Test function to check if the server is running
const test = async (req, res) => {
    // Test function to check if the server is running
    try {
        res.status(200).json({ message: "Server is running" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export {
    test,
    getAllRoads,
    getAllCollectingPoints,
    getAllNeighborhoods,
    getAllCommuns,
    addRoad,
    addCollectingPoint,
    addNeighborhood,
    deleteRoad,
    deleteCollectingPoint,
    deleteNeighborhood,
    updateCollectingPoint,
    updateNeighborhood,
    updateRoad
}