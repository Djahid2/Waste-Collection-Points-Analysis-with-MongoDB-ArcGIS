import mongoose from 'mongoose';
const GeometrySchema = new mongoose.Schema({
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    }
});

const AttributesSchema = new mongoose.Schema({
    FID: Number,
    id: String,
    amenity: String,
    route: Number,
    dsatur: Number,
    esatur: String
});

const CollectingPointSchema = new mongoose.Schema({
    attributes: AttributesSchema,
    geometry: {
        type:GeometrySchema,
        required: true
    }
});

const CollectingPoint = mongoose.model('CollectingPoints', CollectingPointSchema);

export default CollectingPoint;