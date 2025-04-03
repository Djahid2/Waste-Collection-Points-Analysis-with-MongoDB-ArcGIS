import mongoose from 'mongoose';

const GeometrySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Polygon'], // It's a polygon
        default: 'Polygon'
    },

});

const AttributesSchema = new mongoose.Schema({
    FID: Number,
    name: String,
    superficie: Number,
    longitude: Number,
    latitude: Number,
    population: Number,
    ideal_pts: Number,
    ideal_dist: Number
});

const NeighborhoodSchema = new mongoose.Schema({
    attributes: AttributesSchema,
    geometry: {
        rings: {
            type: [[[Number]]], // 3D array to store polygon coordinates
            required: true
        }
    }
});

const Neighborhood = mongoose.model('Neighborhood', NeighborhoodSchema);

export default Neighborhood;
