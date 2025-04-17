import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Import to handle __dirname in ES modules
import Road from './roadModel.js';
import CollectingPoint from './collectingPointModel.js';
import Neighborhood from './neighbourhoodModel.js';
import Commun from './communModel.js';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI; // Replace with your .env value if needed
const basePath = process.env.BASE_DATA_PATH || '../region files/'; // Replace with your database name

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to JSON files
const dataFiles = {
    roads: path.join(__dirname, basePath + 'roads.json'),
    collectingPoints: path.join(__dirname, basePath + 'collecting Points babz.json'),
    neighborhoods: path.join(__dirname, basePath + 'quartiers babz.json'),
    communes: path.join(__dirname, basePath + 'commun_babz.json'),
};

console.log('Data file paths:', dataFiles);

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Clear existing data in all collections
        await Road.deleteMany({});
        console.log('Cleared existing Road data');
        await CollectingPoint.deleteMany({});
        console.log('Cleared existing CollectingPoint data');
        await Neighborhood.deleteMany({});
        console.log('Cleared existing Neighborhood data');
        await Commun.deleteMany({});
        console.log('Cleared existing Commun data');

        // Insert data into Road collection
        const roadData = JSON.parse(fs.readFileSync(dataFiles.roads, 'utf-8'));
        await Road.insertMany(roadData);
        console.log('Seeded Road data successfully');

        // Insert data into CollectingPoint collection
        const collectingPointData = JSON.parse(fs.readFileSync(dataFiles.collectingPoints, 'utf-8'));
        await CollectingPoint.insertMany(collectingPointData);
        console.log('Seeded CollectingPoint data successfully');

        // Insert data into Neighborhood collection
        const neighborhoodData = JSON.parse(fs.readFileSync(dataFiles.neighborhoods, 'utf-8'));
        await Neighborhood.insertMany(neighborhoodData);
        console.log('Seeded Neighborhood data successfully');

        // Insert data into Commun collection
        const communData = JSON.parse(fs.readFileSync(dataFiles.communes, 'utf-8'));
        await Commun.insertMany(communData);
        console.log('Seeded Commun data successfully');

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding database:', error);
        mongoose.disconnect();
    }
};

// Run the seeder
seedDatabase();