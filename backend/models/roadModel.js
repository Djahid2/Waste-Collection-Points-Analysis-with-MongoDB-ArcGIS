import mongoose from 'mongoose';
import {
    roadType,
    isOneway,
    isBridge,
    isTunnel
} from '../constants/enums.js';

const AttributesSchema = new mongoose.Schema({
    FID: Number,
    osm_id: Number,
    code: Number,
    fclass: {
        type: String,
        enum: Object.values(roadType),
        required: true
    },
    name: String,
    ref: String,
    oneway: {
        type: String,
        enum: Object.values(isOneway),
        required: true
    },
    maxspeed: Number,
    layer: Number,
    bridge: {
        type: String,
        enum: Object.values(isBridge),
        required: true
    },
    tunnel: {
        type: String,
        enum: Object.values(isTunnel),
        required: true
    },
    FID_1: Number,
    osm_id_1: Number,
    code_1: Number,
    fclass_1: {
        type: String,
        enum: Object.values(roadType),
        required: true
    },
    name_1: String,
    ref_1: String,
    oneway_1: {
        type: String,
        enum: Object.values(isOneway),
        required: true
    },
    maxspeed_1: Number,
    layer_1: Number,
    bridge_1: {
        type: String,
        enum: Object.values(isBridge),
        required: true
    },
    tunnel_1: {
        type: String,
        enum: Object.values(isTunnel),
        required: true
    },
    Cartier: String
});

const RoadSchema = new mongoose.Schema({
    attributes: AttributesSchema,
    geometry: {
        paths: {
            type: [[[Number]]], // 3D array to handle paths
            required: true
        }
    }
});

const Road = mongoose.model('Road', RoadSchema);

export default Road;
