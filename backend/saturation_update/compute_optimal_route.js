import RoadModel from "../models/road.model.js";
import { getRoadGeometry, getAllRoadsWithCollectingPoints, getCollectingPoints } from "../utils/utils.js";
import * as turf from "@turf/turf";

// A. Helper to check geometry connection
function areRoadsConnected(roadA, roadB, tolerance = 0.001) {
    const coordsA = getRoadGeometry(roadA);
    const coordsB = getRoadGeometry(roadB);

    if (!coordsA || !coordsB) return false;

    const endpointsA = [coordsA[0], coordsA[coordsA.length - 1]];
    const endpointsB = [coordsB[0], coordsB[coordsB.length - 1]];

    for (const a of endpointsA) {
        for (const b of endpointsB) {
            const dist = turf.distance(turf.point(a), turf.point(b));
            if (dist <= tolerance) return true;
        }
    }
    return false;
}

// B. Distance between centers of roads
function calculateRoadDistance(roadA, roadB) {
    const centerA = turf.center(turf.lineString(getRoadGeometry(roadA))).geometry.coordinates;
    const centerB = turf.center(turf.lineString(getRoadGeometry(roadB))).geometry.coordinates;
    return turf.distance(turf.point(centerA), turf.point(centerB));
}

// C. Build geometry-connected graph
function buildRoadGraph(roads) {
    const graph = new Map();

    for (let i = 0; i < roads.length; i++) {
        const roadA = roads[i];
        graph.set(roadA._id.toString(), []);

        for (let j = 0; j < roads.length; j++) {
            if (i === j) continue;
            const roadB = roads[j];

            if (areRoadsConnected(roadA, roadB)) {
                const distance = calculateRoadDistance(roadA, roadB);
                graph.get(roadA._id.toString()).push({
                    roadId: roadB._id.toString(),
                    distance,
                });
            }
        }
    }

    return graph;
}

// D. Dijkstra for shortest road path
function dijkstra(graph, startId) {
    const distances = new Map();
    const prev = new Map();
    const visited = new Set();

    graph.forEach((_, node) => distances.set(node, Infinity));
    distances.set(startId, 0);

    while (visited.size < graph.size) {
        let currNode = null;
        let currDistance = Infinity;

        for (const [node, dist] of distances.entries()) {
            if (!visited.has(node) && dist < currDistance) {
                currDistance = dist;
                currNode = node;
            }
        }

        if (!currNode) break;

        visited.add(currNode);
        const neighbors = graph.get(currNode) || [];

        for (const neighbor of neighbors) {
            const alt = distances.get(currNode) + neighbor.distance;
            if (alt < distances.get(neighbor.roadId)) {
                distances.set(neighbor.roadId, alt);
                prev.set(neighbor.roadId, currNode);
            }
        }
    }

    return { distances, prev };
}

// E. Build path from Dijkstra result
function buildPath(prevMap, startId, endId) {
    const path = [];
    let curr = endId;
    while (curr && curr !== startId) {
        path.unshift(curr);
        curr = prevMap.get(curr);
    }
    if (curr === startId) {
        path.unshift(startId);
    }
    return path;
}

// F. Connect all target roads into an optimal path
function buildConnectedOptimalRoute(roadGraph, roadMap, roadIds) {
    if (roadIds.length === 0) return [];

    let visited = new Set();
    let finalPath = [];
    let current = roadIds[0];
    visited.add(current);

    while (visited.size < roadIds.length) {
        const remaining = roadIds.filter(r => !visited.has(r));
        let nearest = null;
        let nearestPath = null;
        let minDistance = Infinity;

        const { distances, prev } = dijkstra(roadGraph, current);

        for (const target of remaining) {
            if (distances.get(target) < minDistance) {
                minDistance = distances.get(target);
                nearest = target;
                nearestPath = buildPath(prev, current, target);
            }
        }

        if (nearestPath) {
            for (const roadId of nearestPath) {
                if (!visited.has(roadId)) {
                    finalPath.push(roadMap.get(roadId));
                    visited.add(roadId);
                }
            }
            current = nearest;
        } else {
            break;
        }
    }

    return finalPath;
}

// G. MAIN FUNCTION
export async function computeOptimalRoute() {
    const roads = await RoadModel.find().lean();
    const roadMap = new Map(roads.map(r => [r._id.toString(), r]));

    const roadsWithPoints = await getAllRoadsWithCollectingPoints();
    const roadIdsWithPoints = roadsWithPoints.map(r => r._id.toString());

    const roadGraph = buildRoadGraph(roads);

    const chemin_optimal = buildConnectedOptimalRoute(roadGraph, roadMap, roadIdsWithPoints);

    return chemin_optimal;
}
