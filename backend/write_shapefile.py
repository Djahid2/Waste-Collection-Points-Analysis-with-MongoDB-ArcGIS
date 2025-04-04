import os
import geopandas as gpd
from pymongo import MongoClient
from shapely.geometry import Point

# MongoDB connection URI
MONGODB_URI = "mongodb://localhost:27017/sig"

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client["sig"]
collecting_points = db["collectingpoints"]

# Fetch updated points from MongoDB
points = list(collecting_points.find())

# Convert points to GeoDataFrame
data = []
for point in points:
    if "geometry" in point and "x" in point["geometry"] and "y" in point["geometry"]:
        data.append({
            "id": point["attributes"]["id"],
            "amenity": point["attributes"]["amenity"],
            "route": point["attributes"]["route"],
            "dsatur": point["attributes"]["dsatur"],
            "esatur": point["attributes"]["esatur"],
            "geometry": Point(point["geometry"]["x"], point["geometry"]["y"])
        })

gdf = gpd.GeoDataFrame(data, crs="EPSG:4326")  # Set CRS to WGS84 (EPSG:4326)

# Ensure the output directory exists
output_dir = "../region files/shape"
os.makedirs(output_dir, exist_ok=True)

# Write to ESRI Shapefile
output_path = os.path.join(output_dir, "collecting points babz.shp")
gdf.to_file(output_path, driver="ESRI Shapefile")
print(f"Shapefile saved to {output_path}")