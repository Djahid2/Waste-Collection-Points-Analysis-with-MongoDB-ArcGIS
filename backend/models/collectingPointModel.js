import mongoose from 'mongoose';
import {binStatus} from '../constants/enums.js';
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
    esatur: {
        type: String,
        enum: Object.values(binStatus),
    }
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