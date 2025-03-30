import Road from "../models/Road.js";
import CollectingPoint from "../models/CollectingPoint.js";
import Neighborhood from "../models/Neighborhood.js";
import { roadType,frequency } from "../constants/enums.js";

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
try{
    const{name,road,location,capacity,frequency} = req.body;
    if(!road || !location || !capacity || !frequency){
        return res.status(400).json({message: "All fields are required"});
    }
    if(!Object.values(frequency).includes(frequency)){
        return res.status(400).json({message: "Invalid frequency"});
    }
    if(location.type !== 'Point'){
        return res.status(400).json({message: "Invalid location type"});
    }
    if(!Array.isArray(location.coordinates) || location.coordinates.length !== 2){
        return res.status(400).json({message: "Invalid coordinates"});
    }
    const collectingPoint = new CollectingPoint({name,road,location,capacity,frequency});
    await collectingPoint.save();
    res.status(201).json(collectingPoint);
}
catch(error){
    console.error(error);
    res.status(500).json({ message: "Server error" });
    
}}

const addNeighborhood = async (req, res) => {
    try {
        const { name, osm_id, geometry,collectingPoints,roads, population, area } = req.body;
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

const test = async (req, res) => {
    // Test function to check if the server is running
    try {
        res.status(200).json({ message: "Server is running" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
export default {
    test,
    getAllRoads,
    getAllCollectingPoints,
    getAllNeighborhoods,
    addRoad,
    addCollectingPoint,
    addNeighborhood,
    deleteRoad,
    deleteCollectingPoint,
    deleteNeighborhood
}