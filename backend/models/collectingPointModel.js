import mongoose from 'mongoose';
import { binStatus, binFrequency } from '../constants/enums.js';


const CollectingPointSchema = new mongoose.Schema({
    name: String,
    road:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'road'
    },
    location:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    capacity: Number,
    frequency: {
        type: String,
        enum: Object.values(binFrequency),
    },
    status: {
        type: String,
        enum: Object.values(binStatus),
    },

});

CollectingPointSchema.pre('findByIdAndDelete', async function (next) {
    const collectingPointId = this.getQuery()._id;
    await Neighborhood.updateMany({ collectingPoints: collectingPointId }, { $pull: { collectingPoints: collectingPointId } });
    next();
});

CollectingPointSchema.index({ location: '2dsphere' });

export default mongoose.model('CollectingPoint', CollectingPointSchema);