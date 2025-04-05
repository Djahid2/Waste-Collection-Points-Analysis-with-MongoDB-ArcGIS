import Road from "../models/roadModel.js";
import CollectingPoint from "../models/collectingPointModel.js";
import Neighborhood from "../models/neighbourhoodModel.js";
import Commun from "../models/communModel.js";
import {
    binFrequency,
    roadType,
    binStatus,
    isOneway,
    isBridge,
    isTunnel
} from "../constants/enums.js";


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
        const {
            FID,
            osm_id,
            code,
            name,
            type,
            ref,
            oneway,
            maxspeed,
            layer,
            bridge,
            tunnel,
            geometry,
            Cartier
        } = req.body;

        // Validate required fields
        if (!osm_id || !geometry || !geometry.paths||!Cartier) {
            return res.status(400).json({ message: "osm_id, Cartier and geometry with coordinates are required" });
        }

        // Validate road type
        if (!Object.values(roadType).includes(type)) {
            return res.status(400).json({ message: "Invalid road type" });
        }

        // Validate geometry type and structure
        if (!Array.isArray(geometry.paths) || geometry.paths.length === 0) {
            return res.status(400).json({ message: "Invalid coordinates" });
        }

        // Validate enums for oneway, bridge, and tunnel
        if (oneway && !Object.values(isOneway).includes(oneway)) {
            return res.status(400).json({ message: "Invalid oneway value" });
        }
        if (bridge && !Object.values(isBridge).includes(bridge)) {
            return res.status(400).json({ message: "Invalid bridge value" });
        }
        if (tunnel && !Object.values(isTunnel).includes(tunnel)) {
            return res.status(400).json({ message: "Invalid tunnel value" });
        }

        // Prepare the road data to match the model
        const roadData = {
            attributes: {
                FID: FID||null, // Default to null
                osm_id: osm_id, // Default to null
                code: code || null, // Default to null
                fclass: type, // Assuming `type` maps to `fclass`
                name: name || null, // Default to null if not provided
                ref: ref || null, // Default to null if not provided
                oneway: oneway || isOneway.NO, // Default to "no" if not provided
                maxspeed: maxspeed || 0, // Default to null if not provided
                layer: layer || 0, // Default to 0 if not provided
                bridge: bridge || isBridge.NO, // Default to "no" if not provided
                tunnel: tunnel || isTunnel.NO, // Default to "no" if not provided
                FID_1: FID||null, // Default to null
                osm_id_1: osm_id, // Default to null
                code_1: code || null, // Default to null
                fclass_1: type, // Default to null if not provided
                name_1: name || null, // Default to null
                ref_1: ref || null, // Default to null
                oneway_1: oneway || isOneway.NO, // Default to "no"
                maxspeed_1: 0, // Default to null
                layer_1: layer || 0, // Default to 0
                bridge_1: bridge || isBridge.NO, // Default to "no"
                tunnel_1: tunnel || isTunnel.NO, // Default to "no"
                Cartier: Cartier
            },
            geometry: {
                paths: [geometry.paths] // Wrap coordinates in a 3D array
            }
        };

        // Create and save the road
        const road = new Road(roadData);
        await road.save();

        res.status(201).json(road);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const addCollectingPoint = async (req, res) => {
    try {
        const { FID, id, amenity, route, dsatur, esatur, x, y } = req.body;

        // Validate geometry coordinates
        if (typeof x !== 'number' || typeof y !== 'number') {
            return res.status(400).json({ message: "Geometry (x and y) must be numbers and are required" });
        }

        // Validate bin status if provided
        if (esatur && !Object.values(binStatus).includes(esatur)) {
            return res.status(400).json({ message: "Invalid bin status (esatur)" });
        }

        // Prepare data for the model
        const collectingPointData = {
            attributes: {
                FID: FID,
                id: id,
                amenity: amenity,
                route: route,
                dsatur: dsatur,
                esatur: esatur || binStatus.PARTIALLY_FULL // Default to SATURATED if not provided
            },
            geometry: { x, y }
        };

        // Save to DB
        const collectingPoint = new CollectingPoint(collectingPointData);
        await collectingPoint.save();

        res.status(201).json(collectingPoint);
    } catch (error) {
        console.error("Error adding collecting point:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const addNeighborhood = async (req, res) => {
    try {
        const {
            FID,
            name,
            superficie,
            longitude,
            latitude,
            population,
            ideal_pts,
            ideal_dist,
            geometry
        } = req.body;

        // Validate required fields
        if (!geometry || !geometry.rings) {
            return res.status(400).json({ message: "Geometry with rings is required" });
        }
        if (!Array.isArray(geometry.rings) || geometry.rings.length === 0) {
            return res.status(400).json({ message: "Invalid geometry rings" });
        }

        // Prepare the neighborhood data to match the model
        const neighborhoodData = {
            attributes: {
                FID: FID,
                name: name || null, // Default to null if not provided
                superficie: superficie,
                longitude: longitude,
                latitude: latitude,
                population: population,
                ideal_pts: ideal_pts || 0, 
                ideal_dist: ideal_dist 
            },
            geometry: {
                rings: geometry.rings // 3D array for polygon coordinates
            }
        };

        // Create and save the neighborhood
        const neighborhood = new Neighborhood(neighborhoodData);
        await neighborhood.save();

        res.status(201).json(neighborhood);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

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
const updateRoad = async (req, res) => {
    try {
        const { id } = req.params;
        const { FID, osm_id, code, name, type, ref, oneway, maxspeed, layer, bridge, tunnel, geometry, Cartier } = req.body;

        const updateFields = {};

        if (FID) updateFields["attributes.FID"] = FID;
        if (osm_id) updateFields["attributes.osm_id"] = osm_id;
        if (code) updateFields["attributes.code"] = code;
        if (name) updateFields["attributes.name"] = name;
        if (type) {
            if (!Object.values(roadType).includes(type)) {
                return res.status(400).json({ message: "Invalid road type" });
            }
            updateFields["attributes.fclass"] = type;
        }
        if (ref) updateFields["attributes.ref"] = ref;
        if (oneway) {
            if (!Object.values(isOneway).includes(oneway)) {
                return res.status(400).json({ message: "Invalid oneway value" });
            }
            updateFields["attributes.oneway"] = oneway;
        }
        if (maxspeed) updateFields["attributes.maxspeed"] = maxspeed;
        if (layer) updateFields["attributes.layer"] = layer;
        if (bridge) {
            if (!Object.values(isBridge).includes(bridge)) {
                return res.status(400).json({ message: "Invalid bridge value" });
            }
            updateFields["attributes.bridge"] = bridge;
        }
        if (tunnel) {
            if (!Object.values(isTunnel).includes(tunnel)) {
                return res.status(400).json({ message: "Invalid tunnel value" });
            }
            updateFields["attributes.tunnel"] = tunnel;
        }
        if (Cartier) updateFields["attributes.Cartier"] = Cartier;

        if (geometry) {
            if (!Array.isArray(geometry.paths) || geometry.paths.length === 0) {
                return res.status(400).json({ message: "Invalid geometry paths" });
            }
            updateFields["geometry.paths"] = geometry.paths;
        }

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

const updateCollectingPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const { FID, id: pointId, amenity, route, dsatur, esatur, x, y } = req.body;

        const updateFields = {};

        if (FID) updateFields["attributes.FID"] = FID;
        if (pointId) updateFields["attributes.id"] = pointId;
        if (amenity) updateFields["attributes.amenity"] = amenity;
        if (route) updateFields["attributes.route"] = route;
        if (dsatur) updateFields["attributes.dsatur"] = dsatur;
        if (esatur) {
            if (!Object.values(binStatus).includes(esatur)) {
                return res.status(400).json({ message: "Invalid bin status (esatur)" });
            }
            updateFields["attributes.esatur"] = esatur;
        }
        if (x && y) {
            updateFields["geometry.x"] = x;
            updateFields["geometry.y"] = y;
        }

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
        const { FID, name, superficie, longitude, latitude, population, ideal_pts, ideal_dist, geometry } = req.body;

        const updateFields = {};

        if (FID) updateFields["attributes.FID"] = FID;
        if (name) updateFields["attributes.name"] = name;
        if (superficie) updateFields["attributes.superficie"] = superficie;
        if (longitude) updateFields["attributes.longitude"] = longitude;
        if (latitude) updateFields["attributes.latitude"] = latitude;
        if (population) updateFields["attributes.population"] = population;
        if (ideal_pts) updateFields["attributes.ideal_pts"] = ideal_pts;
        if (ideal_dist) updateFields["attributes.ideal_dist"] = ideal_dist;

        if (geometry) {
            if (!Array.isArray(geometry.rings) || geometry.rings.length === 0) {
                return res.status(400).json({ message: "Invalid geometry rings" });
            }
            updateFields["geometry.rings"] = geometry.rings;
        }

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