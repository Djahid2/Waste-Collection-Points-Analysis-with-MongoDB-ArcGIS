import mongodb from './config.js';
import resouceRoutes from './routes/resourcesRoute.js';
import analysisRoutes from './routes/analysisRoute.js';
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();


const PORT = process.env.PORT || 5000;
const app = express();
const cors = require('cors');

// Connect to MongoDB
mongodb();


app.use(express.json());
app.use(cors());


app.use('/api/resources', resouceRoutes);
app.use('/api/analysis', analysisRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});