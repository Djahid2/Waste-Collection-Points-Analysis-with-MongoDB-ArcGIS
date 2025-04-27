import mongoose from 'mongoose';
import * as turf from '@turf/turf';
import { exec } from 'child_process';

// MongoDB connection URI
const MONGODB_URI = 'mongodb://localhost:27017/sig';

// MongoDB models
import Road from '../models/roadModel.js';
import CollectingPoint from '../models/collectingPointModel.js';
import Neighborhood from '../models/neighbourhoodModel.js';

// Helper function to calculate average distance
function calculateActualAverageDistance(points) {
    if (points.length < 2) return Infinity; // If only one point, return infinity

    const distances = [];
    for (let i = 0; i < points.length; i++) {
        const p1 = turf.point([points[i].longitude, points[i].latitude]);
        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                const p2 = turf.point([points[j].longitude, points[j].latitude]);
                distances.push(turf.distance(p1, p2));
            }
        }
    }

    return distances.reduce((sum, d) => sum + d, 0) / distances.length;
}

// Helper function to calculate saturation and state
function calculateSaturationAndEtat(idealNbrOfPoints, actualNbrOfPoints, idealDistance, actualAvgDistance) {
    // Calculate deviations
    const pointsDeviation = Math.abs(actualNbrOfPoints - idealNbrOfPoints) / idealNbrOfPoints * 100;
    const distanceDeviation = Math.abs(actualAvgDistance - idealDistance) / idealDistance * 100;

    // Combine deviations using weights
    const weightPoints = 0.6; // Weight for number of points
    const weightDistance = 0.4; // Weight for distance
    const degreeOfSaturation = Math.min(((weightPoints * pointsDeviation + weightDistance * distanceDeviation) / (weightPoints + weightDistance)), 100);

    // Determine saturation state
    const etat = degreeOfSaturation > 50 ? "T" : "F";

    return { degreeOfSaturation, etat };
}

// Function to refresh saturation data and update MongoDB
async function refreshSaturationData() {
    try {
        console.log('Refreshing saturation data...');

        // Fetch data from MongoDB collections
        const points = await CollectingPoint.find();
        const roads = await Road.find();
        const neighborhoods = await Neighborhood.find();

        const updatedPoints = [];
        for (const point of points) {
            const road = roads.find(r => r.attributes.FID === point.attributes.route);

            // Skip roads with empty Cartier values
            if (road && (!road.attributes.Cartier || road.attributes.Cartier.trim() === "")) {
                console.warn(`Skipping road with empty Cartier for route: ${point.attributes.route}`);
                continue;
            }

            const neighborhood = road && road.attributes.Cartier
                ? neighborhoods.find(n => n.attributes.name === road.attributes.Cartier)
                : null;

            if (!neighborhood) continue;

            const idealNbrOfPoints = neighborhood.attributes.ideal_pts || 0;
            const idealDistance = neighborhood.attributes.ideal_dist || 0;

            // Filter points in the same neighborhood
            const neighborhoodPoints = points.filter(p =>
                p.attributes.route === point.attributes.route &&
                typeof p.geometry.x === 'number' &&
                typeof p.geometry.y === 'number'
            );

            const actualNbrOfPoints = neighborhoodPoints.length;
            const actualAvgDistance = calculateActualAverageDistance(
                neighborhoodPoints.map(p => ({
                    longitude: p.geometry.x,
                    latitude: p.geometry.y,
                }))
            );

            const { degreeOfSaturation, etat } = calculateSaturationAndEtat(
                idealNbrOfPoints,
                actualNbrOfPoints,
                idealDistance,
                actualAvgDistance
            );

            // Update the point in the database
            await CollectingPoint.updateOne(
                { _id: point._id },
                {
                    $set: {
                        'attributes.dsatur': degreeOfSaturation,
                        'attributes.esatur': etat,
                    },
                }
            );

            // Add the updated point to the list for shapefile generation
            updatedPoints.push({
                id: point.attributes.id,
                longitude: point.geometry.x,
                latitude: point.geometry.y,
                amenity: point.attributes.amenity,
                route: point.attributes.route,
                dsatur: degreeOfSaturation,
                esatur: etat,
            });
        }

        console.log('Saturation data refreshed and database updated successfully!');
        return updatedPoints;
    } catch (error) {
        console.error('Error refreshing saturation data:', error);
        throw error;
    }
}

// Main execution
async function updateSaturationAndGenerateShapefile() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const updatedPoints = await refreshSaturationData();

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');

        // Call the Python script to generate the shapefile
        exec('python saturation_update/write_shapefile.py', (error, stdout, stderr) => {
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
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
};

export default updateSaturationAndGenerateShapefile;
updateSaturationAndGenerateShapefile();