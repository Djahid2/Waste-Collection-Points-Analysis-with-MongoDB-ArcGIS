import mongodb from './config.js';
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


const PORT = process.env.PORT || 5000;
const app = express();
const cors = require('cors');

// Connect to MongoDB
mongodb();


app.use(express.json());
app.use(cors());


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});