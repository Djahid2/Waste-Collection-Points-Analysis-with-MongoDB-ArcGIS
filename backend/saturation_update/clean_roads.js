import mongoose from 'mongoose';

// MongoDB connection URI
const MONGODB_URI = 'mongodb://localhost:27017/sig';

// MongoDB Road model import
import Road from '../models/roadModel.js';

// List of allowed attributes based on the schema
const ALLOWED_ATTRIBUTES = [
    'FID', 
    'osm_id', 
    'code', 
    'fclass', 
    'name', 
    'ref', 
    'oneway', 
    'maxspeed', 
    'layer', 
    'bridge', 
    'tunnel', 
    'Cartier', 
    'chemin_optimal'
];

// Helper function to retain only allowed attributes
function cleanAttributes(attributes) {
    if (!attributes || typeof attributes !== 'object') {
        return {}; // Return empty object if attributes is not valid
    }
    
    const cleanedAttributes = {};
    
    // Copy only allowed attributes to the cleaned object
    for (const key of ALLOWED_ATTRIBUTES) {
        if (key in attributes) {
            cleanedAttributes[key] = attributes[key];
        }
    }
    
    return cleanedAttributes;
}

// Main function to clean all road documents
async function cleanRoads() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        
        // Get total roads count for progress tracking
        const totalRoads = await Road.countDocuments();
        console.log(`Found ${totalRoads} roads in the database`);
        
        // Get all roads
        console.log('Fetching all roads...');
        const roads = await Road.find();
        
        // Counter for modified documents
        let modifiedCount = 0;
        let processedCount = 0;
        
        // Process each road
        for (const road of roads) {
            // Clean the attributes
            const originalAttributes = road.attributes || {};
            const cleanedAttributes = cleanAttributes(originalAttributes);
            
            // Check if attributes were modified
            const hasChanges = JSON.stringify(originalAttributes) !== JSON.stringify(cleanedAttributes);
            
            // Update the document if attributes changed
            if (hasChanges) {
                road.attributes = cleanedAttributes;
                await road.save();
                modifiedCount++;
            }
            
            // Update progress
            processedCount++;
            if (processedCount % 100 === 0 || processedCount === totalRoads) {
                console.log(`Processed ${processedCount}/${totalRoads} roads (${modifiedCount} modified)`);
            }
        }
        
        console.log(`Cleaning complete. Modified ${modifiedCount} out of ${totalRoads} road documents.`);
        
        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
        return { total: totalRoads, modified: modifiedCount };
    } catch (error) {
        console.error('Error cleaning roads:', error);
        mongoose.disconnect();
        throw error;
    }
}

// Execute the function
cleanRoads().then(result => {
    console.log(`Road cleanup completed. Processed ${result.total} roads, modified ${result.modified} documents.`);
}).catch(err => {
    console.error('Failed to clean roads:', err);
});

export default cleanRoads;