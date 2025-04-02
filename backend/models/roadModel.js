import mongoose from 'mongoose';
import {roadType} from '../constants/enums.js';
import CollectingPoint from './collectingPointModel.js';
import Neighborhood from './neighbourhoodModel.js';

const RoadSchema = new mongoose.Schema({
    osm_id: {
        type: String,
        required: true,
    },
    name: String,
    type: {
        type: String,
        enum: Object.values(roadType),
    },
    geometry: {
        type: {
            type: String,
            enum: ['LineString'],
            required: true
        },
        coordinates: {
            type: [[Number]],
            required: true
        }
    }
});

RoadSchema.pre('findByIdAndDelete', async function (next) {
    const roadId = this.getQuery()._id;
    await CollectingPoint.deleteMany({ road: roadId });
    await Neighborhood.updateMany({ roads: roadId }
        , { $pull: { roads: roadId } });

    next();
});

RoadSchema.index({ geometry: '2dsphere' });

export default mongoose.model('Road', RoadSchema);