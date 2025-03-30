import pandas as pd
import geopandas as gpd
from shapely.wkt import loads

# Load quartiers CSV (ensure it has a geometry column)
quartiers = pd.read_csv("quartiers_bab_ezzouar.csv")

# Convert quartiers to GeoDataFrame
quartiers["geometry"] = quartiers["geometry"].apply(loads)
quartiers_gdf = gpd.GeoDataFrame(quartiers, geometry="geometry", crs="EPSG:4326")

# Load routes CSV
routes = pd.read_csv("routes_bab_ezzouar.csv")

# Convert the geometry column (LINESTRING) to real geometries
routes["geometry"] = routes["geometry"].apply(loads)
routes_gdf = gpd.GeoDataFrame(routes, geometry="geometry", crs="EPSG:4326")

# Function to find the quartier a route belongs to
def find_quartier(route_geom):
    for _, quartier in quartiers_gdf.iterrows():
        if route_geom.intersects(quartier.geometry):  # Check intersection
            return quartier["name"]
    return " "

# Assign quartier names to each route
routes_gdf["Cartier"] = routes_gdf["geometry"].apply(find_quartier)

# Save updated routes to a new CSV file
routes_gdf.to_csv("routes_updated.csv", index=False)
routes_gdf.to_file("routes_bab_ezzouar.shp", driver="ESRI Shapefile")


print("Routes updated with Cartier names successfully!")

