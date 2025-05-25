# README

## Project Title
Waste Collection Points Analysis with MongoDB & ArcGIS

## Description
This project focuses on analyzing the spatial distribution of urban waste collection points using GIS and NoSQL technologies. By integrating shapefiles with MongoDB (in JSON format), it enables geospatial queries to identify underserved zones based on collection point density. The data is visualized using mapping SDKs like Leaflet or Mapbox, and generated from real-world urban routing and zone boundaries.

## Features
- Backend API built with Express.
- Database seeding using `seed.js`.
- Frontend developed with Vite for fast builds and hot module replacement.

## Installation

### Backend
1. Clone the repository:
    ```bash
    git clone https://github.com/ShunIV/sig-project
    ```
2. Navigate to the backend directory:
    ```bash
    cd ./backend/
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Seed the database:
    ```bash
    node ./models/seed.js
    ```
5. Start the backend server:
    ```bash
    npm run dev
    ```

### Frontend
1. Navigate to the frontend directory:
    ```bash
    cd ./Frontend/Ecopoint/
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

## Usage
1. Start the backend server.
2. Start the frontend development server.
3. Access the application in your browser at the provided URL.

## Contributing
Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).

## Some picture 
![image](https://github.com/user-attachments/assets/07635f7d-75e6-4419-8333-1dbc94cd1fc9)
![image](https://github.com/user-attachments/assets/c182b4a7-4186-4b46-9b66-c8fe9ac3eaaa)

