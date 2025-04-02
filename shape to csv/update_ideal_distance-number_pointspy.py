import pandas as pd
import math
import geopandas as gpd
from shapely.wkt import loads

# Constants
SERVICE_CAPACITY = 500  # Number of people one point de ramassage can serve
DENSITY_FACTOR = 1  # Can be adjusted based on location
ACCESSIBILITY_FACTOR = 1  # Can be adjusted based on location

# Load quartiers data
quartiers = pd.read_csv("quartiers_bab_ezzouar.csv")

quartiers = quartiers.drop(columns=["ideal_points"], errors="ignore")

# Ensure population and area are numeric
quartiers["population"] = pd.to_numeric(quartiers["population"], errors="coerce")
quartiers["superficie"] = pd.to_numeric(quartiers["superficie"], errors="coerce")

# Convert geometry column from WKT to Shapely objects
quartiers["geometry"] = quartiers["geometry"].apply(loads)

# Calculate the ideal number of collection points
quartiers["ideal_pts"] = (quartiers["population"] / SERVICE_CAPACITY) * DENSITY_FACTOR * ACCESSIBILITY_FACTOR
quartiers["ideal_pts"] = quartiers["ideal_pts"].apply(lambda x: max(1, math.ceil(x)))  # At least 1 point per quartier

# Calculate ideal distance between points
quartiers["ideal_dist"] = (quartiers["superficie"] / quartiers["ideal_pts"]) ** 0.5  # Square root of area per point

# Convert to GeoDataFrame
quartiers_gdf = gpd.GeoDataFrame(quartiers, geometry="geometry")

# Set Coordinate Reference System (CRS) to WGS 84
quartiers_gdf.set_crs(epsg=4326, inplace=True)

# Save to shapefile in the correct folder
quartiers_gdf.to_csv("quartiers_bab_ezzouar.csv", index=False)
quartiers_gdf.to_file("region files/quartiers_bab_ezzouar.shp", driver="ESRI Shapefile")

print("Updated shapefile saved as 'region_files/quartiers_bab_ezzouar.shp'")
