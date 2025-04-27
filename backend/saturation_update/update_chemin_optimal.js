import mongoose from 'mongoose';
import * as turf from '@turf/turf';
import { exec } from 'child_process';

// MongoDB connection URI
const MONGODB_URI = 'mongodb://localhost:27017/sig';

// MongoDB models
import Road from '../models/roadModel.js';
import CollectingPoint from '../models/collectingPointModel.js';
import e from 'express';

// Helper function to get road geometry in the right format
function getRoadGeometry(road) {
    try {
        // Check if geometry exists in expected format
        if (road.geometry && road.geometry.coordinates && Array.isArray(road.geometry.coordinates)) {
            return road.geometry.coordinates;
        }
        
        // If road has paths format (common in ESRI data)
        if (road.geometry && road.geometry.paths && Array.isArray(road.geometry.paths) && road.geometry.paths.length > 0) {
            return road.geometry.paths[0];
        }
        
        // If the geometry is stored in a different format
        if (road.geometry && typeof road.geometry === 'object') {
            for (const key in road.geometry) {
                if (Array.isArray(road.geometry[key]) && road.geometry[key].length > 0) {
                    return road.geometry[key];
                }
            }
        }
        
        console.warn(`Could not find valid coordinates for road ${road._id}`);
        return null;
    } catch (error) {
        console.error(`Error extracting geometry for road ${road._id}:`, error);
        return null;
    }
}

// Get endpoints of a road geometry
function getRoadEndpoints(road) {
    const coords = getRoadGeometry(road);
    if (!coords || coords.length === 0) return null;
    
    // Return first and last points
    return {
        start: coords[0],
        end: coords[coords.length - 1]
    };
}

// Create a spatial index for roads to quickly find potential neighbors
function createSpatialIndex(roads) {
    const index = {};
    
    // Helper to get grid cell key from coordinates
    function getCellKey(lon, lat, precision = 3) {
        // Round to specified precision to create grid cells
        const roundedLon = Math.round(lon * Math.pow(10, precision)) / Math.pow(10, precision);
        const roundedLat = Math.round(lat * Math.pow(10, precision)) / Math.pow(10, precision);
        return `${roundedLon}:${roundedLat}`;
    }
    
    // Add a road to all relevant grid cells
    function addRoadToIndex(road) {
        const coords = getRoadGeometry(road);
        if (!coords) return;
        
        // Add road to cells for each point in its geometry
        const addedCells = new Set(); // Track cells we've already added this road to
        
        for (const point of coords) {
            const cellKey = getCellKey(point[0], point[1]);
            
            if (!addedCells.has(cellKey)) {
                if (!index[cellKey]) {
                    index[cellKey] = [];
                }
                index[cellKey].push(road);
                addedCells.add(cellKey);
            }
        }
    }
    
    // Add all roads to the index
    for (const road of roads) {
        addRoadToIndex(road);
    }
    
    return {
        // Get potential neighbor roads based on shared or nearby grid cells
        getPotentialNeighbors(road) {
            const coords = getRoadGeometry(road);
            if (!coords) return [];
            
            const neighborSet = new Set();
            const id = road._id.toString();
            
            // Check each point's cell and adjacent cells
            for (const point of coords) {
                const cellKey = getCellKey(point[0], point[1]);
                
                // Add roads from this cell
                if (index[cellKey]) {
                    for (const neighbor of index[cellKey]) {
                        const neighborId = neighbor._id.toString();
                        if (neighborId !== id) {
                            neighborSet.add(neighbor);
                        }
                    }
                }
            }
            
            return Array.from(neighborSet);
        }
    };
}

// Faster check if two roads share a point (are adjacent)
function areRoadsAdjacent(road1, road2) {
    try {
        const coords1 = getRoadGeometry(road1);
        const coords2 = getRoadGeometry(road2);
        
        if (!coords1 || !coords2 || coords1.length === 0 || coords2.length === 0) {
            return false;
        }
        
        // Create point sets for fast lookups
        const pointSet = new Set();
        
        // Generate string keys for all points in first road
        for (const point of coords1) {
            // Use sufficient precision for comparing floating point coordinates
            const key = `${point[0].toFixed(6)},${point[1].toFixed(6)}`;
            pointSet.add(key);
        }
        
        // Check if any point from second road exists in the set
        for (const point of coords2) {
            const key = `${point[0].toFixed(6)},${point[1].toFixed(6)}`;
            if (pointSet.has(key)) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking road adjacency:', error);
        return false;
    }
}

// Calculate road length in kilometers
function calculateRoadLength(road) {
    try {
        const coords = getRoadGeometry(road);
        if (!coords || coords.length < 2) return 0;
        
        const line = turf.lineString(coords);
        return turf.length(line, { units: 'kilometers' });
    } catch (error) {
        console.error(`Error calculating road length: ${error}`);
        return 0;
    }
}

// Priority Queue implementation for Dijkstra's algorithm
class PriorityQueue {
    constructor() {
        this.elements = [];
        this.elementMap = new Map();
    }
    
    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elementMap.set(element, this.elements.length - 1);
        this._bubbleUp(this.elements.length - 1);
    }
    
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        
        const result = this.elements[0];
        const end = this.elements.pop();
        this.elementMap.delete(result.element);
        
        if (this.elements.length > 0) {
            this.elements[0] = end;
            this.elementMap.set(end.element, 0);
            this._sinkDown(0);
        }
        
        return result;
    }
    
    updatePriority(element, newPriority) {
        if (!this.elementMap.has(element)) {
            this.enqueue(element, newPriority);
            return;
        }
        
        const index = this.elementMap.get(element);
        const oldPriority = this.elements[index].priority;
        this.elements[index].priority = newPriority;
        
        if (newPriority < oldPriority) {
            this._bubbleUp(index);
        } else {
            this._sinkDown(index);
        }
    }
    
    isEmpty() {
        return this.elements.length === 0;
    }
    
    _bubbleUp(index) {
        const element = this.elements[index];
        
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.elements[parentIndex];
            
            if (element.priority >= parent.priority) {
                break;
            }
            
            // Swap elements
            this.elements[parentIndex] = element;
            this.elements[index] = parent;
            this.elementMap.set(element.element, parentIndex);
            this.elementMap.set(parent.element, index);
            
            index = parentIndex;
        }
    }
    
    _sinkDown(index) {
        const length = this.elements.length;
        const element = this.elements[index];
        
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let swapIndex = null;
            
            if (leftChildIndex < length) {
                const leftChild = this.elements[leftChildIndex];
                if (leftChild.priority < element.priority) {
                    swapIndex = leftChildIndex;
                }
            }
            
            if (rightChildIndex < length) {
                const rightChild = this.elements[rightChildIndex];
                if (
                    (swapIndex === null && rightChild.priority < element.priority) ||
                    (swapIndex !== null && rightChild.priority < this.elements[swapIndex].priority)
                ) {
                    swapIndex = rightChildIndex;
                }
            }
            
            if (swapIndex === null) {
                break;
            }
            
            // Swap elements
            this.elements[index] = this.elements[swapIndex];
            this.elements[swapIndex] = element;
            this.elementMap.set(this.elements[index].element, index); 
            this.elementMap.set(element.element, swapIndex);
            
            index = swapIndex;
        }
    }
}

// Graph structure with optimized adjacency lookup
class RoadNetwork {
    constructor(roads) {
        this.roads = new Map(); // Map of roadId -> road object
        this.adjacencyList = new Map(); // Map of roadId -> Set of adjacent roadIds
        this.roadLengths = new Map(); // Cache of road lengths
        
        // Build the road network
        for (const road of roads) {
            const roadId = road._id.toString();
            this.roads.set(roadId, road);
            this.adjacencyList.set(roadId, new Set());
            this.roadLengths.set(roadId, calculateRoadLength(road));
        }
    }
    
    // Build adjacency list using spatial index for efficiency
    async buildAdjacencyList() {
        console.log('Building road network adjacency list...');
        
        // Create spatial index for faster neighbor lookup
        const spatialIndex = createSpatialIndex(Array.from(this.roads.values()));
        const roadIds = Array.from(this.roads.keys());
        
        // Process roads in batches to avoid memory issues with large datasets
        const batchSize = 100;
        
        for (let i = 0; i < roadIds.length; i += batchSize) {
            const batch = roadIds.slice(i, i + batchSize);
            
            // Process each road in the batch
            for (const roadId of batch) {
                const road = this.roads.get(roadId);
                
                // Get potential neighbors (much smaller subset than checking all roads)
                const potentialNeighbors = spatialIndex.getPotentialNeighbors(road);
                
                for (const neighbor of potentialNeighbors) {
                    const neighborId = neighbor._id.toString();
                    
                    // Skip if already known to be adjacent
                    if (this.adjacencyList.get(roadId).has(neighborId)) {
                        continue;
                    }
                    
                    // Check if roads are adjacent
                    if (areRoadsAdjacent(road, neighbor)) {
                        this.adjacencyList.get(roadId).add(neighborId);
                        this.adjacencyList.get(neighborId).add(roadId);
                    }
                }
            }
            
            // Log progress
            console.log(`Processed adjacency for ${Math.min(i + batchSize, roadIds.length)}/${roadIds.length} roads`);
        }
        
        console.log('Adjacency list built successfully');
    }
    
    // Get all roads adjacent to the given road
    getAdjacentRoads(roadId) {
        if (!this.adjacencyList.has(roadId)) {
            return [];
        }
        
        return Array.from(this.adjacencyList.get(roadId))
            .map(id => this.roads.get(id));
    }
    
    // Get the length of a road (with caching)
    getRoadLength(roadId) {
        return this.roadLengths.get(roadId) || 0;
    }
    
    // Find shortest path between two roads using Dijkstra's algorithm
    findShortestPath(startRoadId, endRoadId) {
        // If roads are the same, return empty path
        if (startRoadId === endRoadId) {
            return { path: [], distance: 0 };
        }
        
        // If roads are adjacent, no intermediate roads needed
        if (this.adjacencyList.get(startRoadId).has(endRoadId)) {
            return { 
                path: [], 
                distance: (this.roadLengths.get(startRoadId) + this.roadLengths.get(endRoadId)) / 2 
            };
        }
        
        const distances = new Map();
        const previous = new Map();
        const unvisited = new PriorityQueue();
        
        // Initialize distances
        for (const roadId of this.roads.keys()) {
            distances.set(roadId, roadId === startRoadId ? 0 : Infinity);
            previous.set(roadId, null);
        }
        
        unvisited.enqueue(startRoadId, 0);
        
        while (!unvisited.isEmpty()) {
            const current = unvisited.dequeue().element;
            
            // If we've reached the destination
            if (current === endRoadId) {
                break;
            }
            
            // If current road is unreachable
            if (distances.get(current) === Infinity) {
                break;
            }
            
            // Check all adjacent roads
            for (const neighborId of this.adjacencyList.get(current)) {
                const weight = this.roadLengths.get(neighborId);
                const alt = distances.get(current) + weight;
                
                if (alt < distances.get(neighborId)) {
                    distances.set(neighborId, alt);
                    previous.set(neighborId, current);
                    unvisited.updatePriority(neighborId, alt);
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = endRoadId;
        
        if (previous.get(endRoadId) === null && endRoadId !== startRoadId) {
            return { path: [], distance: Infinity }; // No path exists
        }
        
        while (current !== null && current !== startRoadId) {
            path.unshift(this.roads.get(current));
            current = previous.get(current);
        }
        
        return {
            path,
            distance: distances.get(endRoadId)
        };
    }
}

// Graph structure for collecting point roads
class CollectingPointGraph {
    constructor() {
        this.vertices = new Map(); // Map of roadId -> vertex object
        this.edges = new Map();    // Map of vertexId -> Map of neighborId -> {weight, connectingRoads}
    }
    
    // Add a vertex (road with collecting point)
    addVertex(road) {
        const id = road._id.toString();
        if (!this.vertices.has(id)) {
            this.vertices.set(id, {
                id,
                road,
                fid: road.attributes?.FID || 'unknown'
            });
            this.edges.set(id, new Map());
        }
        return id;
    }
    
    // Add an edge between two vertices with a weight (distance/time)
    addEdge(fromId, toId, weight, connectingRoads = []) {
        if (this.vertices.has(fromId) && this.vertices.has(toId)) {
            this.edges.get(fromId).set(toId, { weight, connectingRoads });
            this.edges.get(toId).set(fromId, { weight, connectingRoads }); // Undirected graph
        }
    }
    
    // Find optimal route through all vertices using nearest neighbor approach
    findOptimalRoute() {
        if (this.vertices.size <= 1) {
            return Array.from(this.vertices.values()).map(v => v.road);
        }
        
        // Start with a random vertex
        const vertexIds = Array.from(this.vertices.keys());
        const startId = vertexIds[0];
        const visited = new Set([startId]);
        const route = [this.vertices.get(startId).road];
        let currentId = startId;
        
        // Visit all vertices using nearest neighbor
        while (visited.size < this.vertices.size) {
            let minDistance = Infinity;
            let nextId = null;
            let nextConnectingRoads = [];
            
            // Find closest unvisited vertex
            for (const [neighborId, edge] of this.edges.get(currentId).entries()) {
                if (!visited.has(neighborId) && edge.weight < minDistance) {
                    minDistance = edge.weight;
                    nextId = neighborId;
                    nextConnectingRoads = edge.connectingRoads;
                }
            }
            
            if (nextId) {
                // Add connecting roads to route
                if (nextConnectingRoads.length > 0) {
                    route.push(...nextConnectingRoads);
                }
                
                // Add the vertex road
                route.push(this.vertices.get(nextId).road);
                visited.add(nextId);
                currentId = nextId;
            } else {
                // If we can't find an unvisited neighbor, try to find any unvisited vertex
                // through the shortest path in the graph
                
                let bestPath = { path: [], distance: Infinity };
                let bestUnvisitedId = null;
                
                // Find shortest path to any unvisited vertex
                for (const vertexId of vertexIds) {
                    if (!visited.has(vertexId)) {
                        // Find shortest path to this unvisited vertex
                        for (const [connectedId, edge] of this.edges.get(currentId).entries()) {
                            if (this.edges.get(connectedId).has(vertexId)) {
                                const connEdge = this.edges.get(connectedId).get(vertexId);
                                const totalDistance = edge.weight + connEdge.weight;
                                
                                if (totalDistance < bestPath.distance) {
                                    bestPath.distance = totalDistance;
                                    bestUnvisitedId = vertexId;
                                    
                                    // Combine connecting roads
                                    bestPath.path = [
                                        ...edge.connectingRoads,
                                        this.vertices.get(connectedId).road,
                                        ...connEdge.connectingRoads
                                    ];
                                }
                            }
                        }
                    }
                }
                
                if (bestUnvisitedId) {
                    // Add the path to the route
                    route.push(...bestPath.path);
                    
                    // Add the destination vertex
                    route.push(this.vertices.get(bestUnvisitedId).road);
                    visited.add(bestUnvisitedId);
                    currentId = bestUnvisitedId;
                } else {
                    // If we still couldn't find a path, we have disconnected components
                    console.warn('Warning: Graph has disconnected components. Some roads will not be visited.');
                    break;
                }
            }
        }
        
        return route;
    }
}

// Main function to update optimal routes
async function updateOptimalRoutes() {
    try {
        console.time('totalExecutionTime');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        
        // Create chemin_optimal attribute if it doesn't exist and reset all flags
        await Road.updateMany(
            { 'attributes.chemin_optimal': { $exists: false } },
            { $set: { 'attributes.chemin_optimal': false } }
        );
        
        await Road.updateMany({}, { $set: { 'attributes.chemin_optimal': false } });
        console.log('Reset all chemin_optimal flags');
        
        // Get all collecting points and their roads
        console.time('fetchData');
        const collectingPoints = await CollectingPoint.find();
        console.log(`Found ${collectingPoints.length} collecting points`);
        
        // Get unique road IDs that have collecting points
        const roadIdsWithPoints = [...new Set(collectingPoints
            .map(point => point.attributes?.route)
            .filter(id => id !== undefined && id !== null))];
            
        console.log(`Found ${roadIdsWithPoints.length} unique roads with collecting points`);
        
        // Get those roads from the database
        const roadsWithPoints = await Road.find({ 'attributes.FID': { $in: roadIdsWithPoints } });
        console.log(`Retrieved ${roadsWithPoints.length} roads with collecting points from database`);
        
        if (roadsWithPoints.length === 0) {
            console.warn('No roads with collecting points found in database');
            mongoose.disconnect();
            return [];
        }
        
        // Get all roads for path finding - use projection to limit data size
        const allRoads = await Road.find({}, { geometry: 1, attributes: { FID: 1 } });
        const validRoads = allRoads.filter(road => getRoadGeometry(road) !== null);
        console.log(`Total valid roads for path finding: ${validRoads.length}`);
        console.timeEnd('fetchData');
        
        // Build the road network
        console.time('buildNetwork');
        const roadNetwork = new RoadNetwork(validRoads);
        await roadNetwork.buildAdjacencyList();
        console.timeEnd('buildNetwork');
        
        // Create collecting point graph
        console.time('buildCollectingPointGraph');
        const collectingPointGraph = new CollectingPointGraph();
        
        // Add all collecting point roads as vertices
        for (const road of roadsWithPoints) {
            collectingPointGraph.addVertex(road);
        }
        
        console.log(`Added ${collectingPointGraph.vertices.size} vertices to the graph`);
        
        // Find paths between all pairs of vertices (collecting point roads)
        const vertexIds = Array.from(collectingPointGraph.vertices.keys());
        let edgesProcessed = 0;
        let edgesAdded = 0;
        const totalEdgesToProcess = (vertexIds.length * (vertexIds.length - 1)) / 2;
        
        console.log(`Finding connections between ${vertexIds.length} vertices (${totalEdgesToProcess} potential edges)...`);
        
        // Process in batches for better progress tracking
        const batchSize = 100;
        let currentBatch = 0;
        
        for (let i = 0; i < vertexIds.length; i++) {
            for (let j = i + 1; j < vertexIds.length; j++) {
                const road1 = collectingPointGraph.vertices.get(vertexIds[i]).road;
                const road2 = collectingPointGraph.vertices.get(vertexIds[j]).road;
                const road1Id = vertexIds[i];
                const road2Id = vertexIds[j];
                
                // Find shortest path between these two roads
                const pathResult = roadNetwork.findShortestPath(road1Id, road2Id);
                
                if (pathResult.distance < Infinity) {
                    collectingPointGraph.addEdge(road1Id, road2Id, pathResult.distance, pathResult.path);
                    edgesAdded++;
                }
                
                edgesProcessed++;
                
                // Log progress in batches
                if (edgesProcessed % batchSize === 0 || edgesProcessed === totalEdgesToProcess) {
                    currentBatch++;
                    console.log(`Processed ${edgesProcessed}/${totalEdgesToProcess} potential edges (${Math.round(edgesProcessed/totalEdgesToProcess*100)}%) - Found ${edgesAdded} valid connections`);
                }
            }
        }
        
        console.log(`Added ${edgesAdded} edges to the collecting point graph`);
        console.timeEnd('buildCollectingPointGraph');
        
        // Find optimal route through all vertices
        console.time('findOptimalRoute');
        console.log('Computing optimal route...');
        const optimalRoute = collectingPointGraph.findOptimalRoute();
        console.log(`Final optimized route contains ${optimalRoute.length} roads`);
        console.timeEnd('findOptimalRoute');
        
        // Verify adjacency in final route
        console.time('verifyRoute');
        let adjacencyErrors = 0;
        for (let i = 0; i < optimalRoute.length - 1; i++) {
            const road1Id = optimalRoute[i]._id.toString();
            const road2Id = optimalRoute[i + 1]._id.toString();
            
            if (!roadNetwork.adjacencyList.get(road1Id).has(road2Id)) {
                console.error(`ADJACENCY ERROR: Roads at positions ${i} and ${i+1} are not adjacent`);
                adjacencyErrors++;
            }
        }
        
        if (adjacencyErrors > 0) {
            console.error(`Found ${adjacencyErrors} adjacency errors in final route`);
        } else {
            console.log('VERIFIED: All roads in final route are properly adjacent!');
        }
        console.timeEnd('verifyRoute');
        
        // Update roads in optimal route to have chemin_optimal = true
        console.time('updateDatabase');
        console.log('Updating roads in database...');
        console.log(optimalRoute.map(road => road._id.toString()));
        const bulkOps = optimalRoute.map(road => ({
            updateOne: {
                filter: { _id: road._id },
                update: { $set: { 'attributes.chemin_optimal': true } }
            }
        }));
        
        // Use bulk operations for faster database updates
        if (bulkOps.length > 0) {
            await Road.bulkWrite(bulkOps);
        }
        console.timeEnd('updateDatabase');
        
        console.log('Optimal route calculated and database updated successfully!');
        
        // Call the Python script to generate the shapefile
        exec('python saturation_update/write_shapefile_roads.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
                return;
            }
            console.log(`Python script output: ${stdout}`);
        });
        
        console.timeEnd('totalExecutionTime');
        return optimalRoute.map(road => road.attributes?.FID || road._id);
    } catch (error) {
        console.error('Error updating optimal routes:', error);
        mongoose.disconnect();
        throw error;
    }
}

export default updateOptimalRoutes;
// Run the main function
//updateOptimalRoutes();