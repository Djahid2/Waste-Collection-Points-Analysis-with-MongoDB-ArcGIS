import mongoose from 'mongoose';
import * as turf from '@turf/turf';
import { exec } from 'child_process';

// MongoDB connection URI
const MONGODB_URI = 'mongodb://localhost:27017/sig';

// MongoDB models
import Road from '../models/roadModel.js';
import CollectingPoint from '../models/collectingPointModel.js';

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

// Function to create a LineString from road coordinates
function createLineString(coords) {
    if (!coords || coords.length < 2) return null;
    return turf.lineString(coords);
}

// Calculate distance between two roads - use center points
function calculateRoadDistance(road1, road2) {
    try {
        // Get coordinates
        const coords1 = getRoadGeometry(road1);
        const coords2 = getRoadGeometry(road2);
        
        if (!coords1 || !coords2 || coords1.length === 0 || coords2.length === 0) {
            return Infinity;
        }
        
        // Create linestrings
        const line1 = createLineString(coords1);
        const line2 = createLineString(coords2);
        
        if (!line1 || !line2) {
            return Infinity;
        }
        
        // Calculate distance between centers of roads
        const center1 = turf.center(line1);
        const center2 = turf.center(line2);
        
        return turf.distance(center1, center2);
    } catch (error) {
        console.error('Error calculating road distance:', error);
        return Infinity;
    }
}
function areRoadsAdjacent(road1, road2) {
    try {
        const coords1 = getRoadGeometry(road1);
        const coords2 = getRoadGeometry(road2);
        
        if (!coords1 || !coords2 || coords1.length === 0 || coords2.length === 0) {
            return false;
        }
        
        // Get start and end points of both roads
        const road1Start = coords1[0];
        const road1End = coords1[coords1.length - 1];
        const road2Start = coords2[0];
        const road2End = coords2[coords2.length - 1];
        
        // Calculate distances between endpoints
        const distances = [
            turf.distance(turf.point(road1Start), turf.point(road2Start)),
            turf.distance(turf.point(road1Start), turf.point(road2End)),
            turf.distance(turf.point(road1End), turf.point(road2Start)),
            turf.distance(turf.point(road1End), turf.point(road2End))
        ];
        
        // Roads are considered adjacent if any of their endpoints are very close
        // Using 50 meters (0.05 km) as threshold for adjacency
        const minDistance = Math.min(...distances);
        return minDistance < 0.05;
    } catch (error) {
        console.error('Error checking road adjacency:', error);
        return false;
    }
}


// Modify the computeOptimalRoute function to ensure adjacency
function computeOptimalRoute(roads) {
    console.log('Computing optimal route with adjacency constraints...');
    
    if (roads.length <= 1) {
        return roads;
    }
    
    // Start with a random road
    const startIndex = Math.floor(Math.random() * roads.length);
    const route = [roads[startIndex]];
    let unvisited = roads.filter((_, i) => i !== startIndex);
    
    // Nearest neighbor algorithm with adjacency constraint
    while (unvisited.length > 0) {
        const currentRoad = route[route.length - 1];
        let minDistance = Infinity;
        let nextRoadIndex = -1;
        let adjacentRoadFound = false;
        
        // First priority: Find adjacent roads
        for (let i = 0; i < unvisited.length; i++) {
            if (areRoadsAdjacent(currentRoad, unvisited[i])) {
                const distance = calculateRoadDistance(currentRoad, unvisited[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nextRoadIndex = i;
                    adjacentRoadFound = true;
                }
            }
        }
        
        // If no adjacent roads, find the closest non-adjacent road
        if (!adjacentRoadFound) {
            for (let i = 0; i < unvisited.length; i++) {
                const distance = calculateRoadDistance(currentRoad, unvisited[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nextRoadIndex = i;
                }
            }
        }
        
        // Add the next road to the route
        if (nextRoadIndex !== -1) {
            const nextRoad = unvisited[nextRoadIndex];
            if (adjacentRoadFound) {
                console.log(`Adding adjacent road ${nextRoad.attributes?.FID || nextRoad._id} to route (distance: ${minDistance.toFixed(4)}km)`);
            } else {
                console.log(`Adding non-adjacent road ${nextRoad.attributes?.FID || nextRoad._id} to route (distance: ${minDistance.toFixed(4)}km) - will need intermediates`);
            }
            route.push(nextRoad);
            unvisited.splice(nextRoadIndex, 1);
        } else {
            console.warn('Could not find next road for route');
            break;
        }
    }
    
    console.log(`Created initial route with ${route.length} roads`);
    return route;
}
// Completely revise the findIntermediateRoads function to prioritize connectivity
function findIntermediateRoads(startRoad, endRoad, allRoads, maxIntermediates = 5) {
    console.log(`Finding connected path between ${startRoad.attributes?.FID || startRoad._id} and ${endRoad.attributes?.FID || endRoad._id}`);
    
    if (areRoadsAdjacent(startRoad, endRoad)) {
        console.log('Roads are already adjacent, no intermediates needed');
        return [];
    }
    
    // Start building a path
    const path = [];
    let currentRoad = startRoad;
    const visited = new Set([startRoad._id.toString()]);
    const targetId = endRoad._id.toString();
    let steps = 0;
    const maxSteps = 100; // Safety limit
    
    // Use a greedy approach to find a connected path
    while (!areRoadsAdjacent(currentRoad, endRoad) && steps < maxSteps) {
        steps++;
        
        // Find all roads adjacent to current road
        const adjacentRoads = allRoads.filter(road => 
            !visited.has(road._id.toString()) && 
            areRoadsAdjacent(currentRoad, road)
        );
        
        if (adjacentRoads.length === 0) {
            console.log('Path building stuck - no more adjacent roads');
            break;
        }
        
        // Find the adjacent road closest to our destination
        let bestRoad = adjacentRoads[0];
        let minDistToEnd = calculateRoadDistance(bestRoad, endRoad);
        
        for (let i = 1; i < adjacentRoads.length; i++) {
            const distToEnd = calculateRoadDistance(adjacentRoads[i], endRoad);
            if (distToEnd < minDistToEnd) {
                minDistToEnd = distToEnd;
                bestRoad = adjacentRoads[i];
            }
        }
        
        console.log(`Adding intermediate road ${bestRoad.attributes?.FID || bestRoad._id} (distance to end: ${minDistToEnd.toFixed(4)}km)`);
        path.push(bestRoad);
        visited.add(bestRoad._id.toString());
        currentRoad = bestRoad;
        
        // If we've reached the destination or found a road adjacent to it, we're done
        if (areRoadsAdjacent(currentRoad, endRoad)) {
            console.log('Found path to destination!');
            break;
        }
    }
    
    if (path.length > maxIntermediates) {
        console.log(`Path too long (${path.length}), truncating to ${maxIntermediates} roads`);
        // If we have too many intermediates, keep the ones closest to start and end
        const keptRoads = [];
        
        // Keep first few roads connected to start
        const startSegmentLength = Math.floor(maxIntermediates / 2);
        keptRoads.push(...path.slice(0, startSegmentLength));
        
        // Keep last few roads connected to end
        const endSegmentLength = maxIntermediates - startSegmentLength;
        if (endSegmentLength > 0) {
            keptRoads.push(...path.slice(path.length - endSegmentLength));
        }
        
        return keptRoads;
    }
    
    return path;
}

// Debug function to log road data
function logRoadData(roads) {
    console.log(`Examining ${roads.length} roads:`);
    for (let i = 0; i < Math.min(3, roads.length); i++) {
        const road = roads[i];
        console.log(`Road ${i+1} ID: ${road._id}`);
        console.log(`  FID: ${road.attributes?.FID || 'undefined'}`);
        console.log(`  Geometry type: ${typeof road.geometry}`);
        
        // Log first few keys of geometry
        if (road.geometry) {
            console.log(`  Geometry keys: ${Object.keys(road.geometry).join(', ')}`);
            
            // Try to log coordinates if they exist
            if (road.geometry.coordinates) {
                console.log(`  Coordinates type: ${typeof road.geometry.coordinates}`);
                if (Array.isArray(road.geometry.coordinates)) {
                    console.log(`  Coordinates length: ${road.geometry.coordinates.length}`);
                    if (road.geometry.coordinates.length > 0) {
                        console.log(`  First coordinate: ${JSON.stringify(road.geometry.coordinates[0])}`);
                    }
                }
            } else if (road.geometry.paths) {
                console.log(`  Paths type: ${typeof road.geometry.paths}`);
                if (Array.isArray(road.geometry.paths) && road.geometry.paths.length > 0) {
                    console.log(`  First path length: ${road.geometry.paths[0].length}`);
                }
            }
        }
        console.log('---');
    }
}

// Update the main function that builds the final route
async function updateOptimalRoutes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        
        // First, ensure all roads have the chemin_optimal attribute (initialized to false)
        console.log('Adding chemin_optimal attribute to all roads...');
        await Road.updateMany(
            { 'attributes.chemin_optimal': { $exists: false } },
            { $set: { 'attributes.chemin_optimal': false } }
        );
        
        // Reset all optimal path flags to false
        console.log('Resetting all chemin_optimal flags to false...');
        await Road.updateMany(
            {},
            { $set: { 'attributes.chemin_optimal': false } }
        );
        
        // Get all collecting points
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
        
        // Get all roads to use for finding connected paths
        const allRoads = await Road.find();
        const validAllRoads = allRoads.filter(road => getRoadGeometry(road) !== null);
        console.log(`Total valid roads for path finding: ${validAllRoads.length}`);
        
        // Debug: Log sample road data to understand the structure
        logRoadData(roadsWithPoints);
        
        // Get initial route through collection points
        const roughOptimalRoute = computeOptimalRoute(roadsWithPoints);

        // Build a fully connected route with no gaps
        const finalOptimalRoute = [];
        
        if (roughOptimalRoute.length > 0) {
            finalOptimalRoute.push(roughOptimalRoute[0]);
        }

        // For each adjacent pair in the rough route, ensure they're connected
        for (let i = 0; i < roughOptimalRoute.length - 1; i++) {
            const currentRoad = roughOptimalRoute[i];
            const nextRoad = roughOptimalRoute[i + 1];
            
            // Check if roads are adjacent
            if (!areRoadsAdjacent(currentRoad, nextRoad)) {
                console.log(`Roads ${currentRoad.attributes?.FID || currentRoad._id} and ${nextRoad.attributes?.FID || nextRoad._id} are not adjacent`);
                
                // Find intermediate roads to connect them
                const intermediates = findIntermediateRoads(currentRoad, nextRoad, validAllRoads);
                
                if (intermediates.length > 0) {
                    console.log(`Found ${intermediates.length} intermediate roads to connect non-adjacent segments`);
                    finalOptimalRoute.push(...intermediates);
                } else {
                    console.warn(`WARNING: Could not find connecting roads between ${currentRoad.attributes?.FID || currentRoad._id} and ${nextRoad.attributes?.FID || nextRoad._id}`);
                }
            }
            
            finalOptimalRoute.push(nextRoad);
        }

        console.log(`Final optimized route contains ${finalOptimalRoute.length} roads`);
        
        // Verify final route adjacency
        let adjacencyErrors = 0;
        for (let i = 0; i < finalOptimalRoute.length - 1; i++) {
            if (!areRoadsAdjacent(finalOptimalRoute[i], finalOptimalRoute[i + 1])) {
                console.error(`ADJACENCY ERROR: Roads at positions ${i} and ${i+1} are not adjacent`);
                adjacencyErrors++;
            }
        }
        
        if (adjacencyErrors > 0) {
            console.error(`Found ${adjacencyErrors} adjacency errors in final route`);
        } else {
            console.log('VERIFIED: All roads in final route are properly adjacent!');
        }
        
        // Update roads in optimal route to have chemin_optimal = true
        console.log('Updating roads in database...');
        for (const road of finalOptimalRoute) {
            await Road.updateOne(
                { _id: road._id },
                { $set: { 'attributes.chemin_optimal': true } }
            );
        }
        
        console.log('Optimal route calculated and database updated successfully!');
        
        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
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
        
        return finalOptimalRoute.map(road => road.attributes?.FID || road._id);
    } catch (error) {
        console.error('Error updating optimal routes:', error);
        mongoose.disconnect();
        throw error;
    }
}

updateOptimalRoutes();