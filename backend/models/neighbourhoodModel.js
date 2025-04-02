import mongoose from 'mongoose';


const NeighborhoodSchema = new mongoose.Schema({
    name:String,
    osm_id: {
        type: String,
        required: true,
    },
    geometry: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true
        },
        coordinates: {
            type: [[[Number]]],
            required: true
        }
    },
    collectingPoints: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CollectingPoint'
        }
    ],
    roads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Road'
        }
    ],
    population: Number,
    area: Number,
    
});

NeighborhoodSchema.index({ geometry: '2dsphere' });
export default mongoose.model('Neighborhood', NeighborhoodSchema);