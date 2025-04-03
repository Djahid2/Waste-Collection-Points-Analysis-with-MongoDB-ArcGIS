import mongoose from 'mongoose';

const AttributesSchema = new mongoose.Schema({
    FID: Number,
    osm_id: Number,
    code: Number,
    fclass: String,
    name: String,
    ref: String,
    oneway: String,
    maxspeed: Number,
    layer: Number,
    bridge: String,
    tunnel: String,
    FID_1: Number,
    osm_id_1: Number,
    code_1: Number,
    fclass_1: String,
    name_1: String,
    ref_1: String,
    oneway_1: String,
    maxspeed_1: Number,
    layer_1: Number,
    bridge_1: String,
    tunnel_1: String,
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
