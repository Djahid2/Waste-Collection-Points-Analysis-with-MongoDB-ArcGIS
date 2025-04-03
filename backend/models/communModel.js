import mongoose from 'mongoose';

const GeometrySchema = new mongoose.Schema({
    rings: {
        type: [[[Number]]], // Array of arrays of coordinate pairs [longitude, latitude]
        required: true
    }
});

const AttributesSchema = new mongoose.Schema({
    FID: Number,
    osm_id: String,
    name: String
});

const CommunSchema = new mongoose.Schema({
    attributes: { type: AttributesSchema, required: true },
    geometry: { type: GeometrySchema, required: true }
});

const Commun = mongoose.model('Commun', CommunSchema);

export default Commun;
