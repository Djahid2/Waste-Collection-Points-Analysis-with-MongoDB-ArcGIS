import os
import pymongo
import geopandas as gpd
from shapely.geometry import LineString
import sys

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["sig"]
roads_collection = db["roads"]

# Output directory
output_dir = "../region files/shape"
os.makedirs(output_dir, exist_ok=True)

# Generate timestamp for unique filename
output_shapefile = os.path.join(output_dir, f"chemin_optimal_babz.shp")

def create_optimal_route_shapefile():
    print("Creating optimal route shapefile...")
    
    # Query roads with chemin_optimal = true
    optimal_roads = list(roads_collection.find({"attributes.chemin_optimal": True}))
    
    if not optimal_roads:
        print("No optimal roads found in database")
        return
    
    # Create lists to store data for GeoDataFrame
    geometries = []
    attributes = []
    
    # Process each road
    for road in optimal_roads:
        try:
            # Extract coordinates for LineString from paths
            if "geometry" in road and "paths" in road["geometry"]:
                paths = road["geometry"]["paths"]
                if isinstance(paths, list) and len(paths) > 0:
                    coords = paths[0]  # Use the first path
                    line = LineString(coords)
                    
                    # Extract attributes
                    road_attrs = {
                        "FID": road["attributes"].get("FID", None),
                        "osm_id": road["attributes"].get("osm_id", None),
                        "code": road["attributes"].get("code", None),
                        "fclass": road["attributes"].get("fclass", None),
                        "name": road["attributes"].get("name", None),
                        "ref": road["attributes"].get("ref", None),
                        "oneway": road["attributes"].get("oneway", None),
                        "maxspeed": road["attributes"].get("maxspeed", None),
                        "layer": road["attributes"].get("layer", None),
                        "bridge": road["attributes"].get("bridge", None),
                        "tunnel": road["attributes"].get("tunnel", None),
                        "Cartier": road["attributes"].get("Cartier", None),
                        "chemin_opt": road["attributes"].get("chemin_optimal", False)
                    }
                    
                    # Add to lists
                    geometries.append(line)
                    attributes.append(road_attrs)
                else:
                    print(f"Skipping road with invalid paths: {road.get('_id')}")
            else:
                print(f"Skipping road with missing geometry or paths: {road.get('_id')}")
        
        except Exception as e:
            print(f"Error processing road {road.get('_id')}: {str(e)}")
    
    # Create GeoDataFrame
    if geometries:
        gdf = gpd.GeoDataFrame(attributes, geometry=geometries, crs="EPSG:4326")
        
        # Write to shapefile
        gdf.to_file(output_shapefile)
        print(f"Optimal route shapefile created: {output_shapefile}")
        print(f"Total roads in optimal route: {len(geometries)}")
    else:
        print("No valid road geometries found to create shapefile")
if __name__ == "__main__":
    try:
        create_optimal_route_shapefile()
    except Exception as e:
        print(f"Error creating shapefile: {str(e)}")
        sys.exit(1)
    finally:
        # Close MongoDB connection
        client.close()