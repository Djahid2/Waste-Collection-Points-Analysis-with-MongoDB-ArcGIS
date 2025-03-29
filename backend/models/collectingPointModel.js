const mongoose = require('mongoose');
import frequency from '../constants/enums';

const CollectingPointSchema = new mongoose.Schema({
    name:string,
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
        enum: Object.values(frequency),
    },

});

CollectingPointSchema.pre('findByIdAndDelete', async function (next) {
    const collectingPointId = this.getQuery()._id;
    await Neighborhood.updateMany({ collectingPoints: collectingPointId }, { $pull: { collectingPoints: collectingPointId } });
    next();
});

CollectingPointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CollectingPoint', CollectingPointSchema);