import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Polygon

# Load existing quartiers data
quartiers_file = "quartiers_bab_ezzouar.csv"
quartiers = gpd.read_file(quartiers_file)

# Define the coordinates for Cité Smail Yefsah (Cité 324 lgts)
coords = [
    (3.188413646679244, 36.72072118464823),
    (3.188971546136708, 36.720445990559746),
    (3.189550903265613, 36.72010199656261),
    (3.191342768681813, 36.71840974787087),
    (3.192240216371826, 36.7173086491166),
    (3.19293619621306, 36.71642775874951),
    (3.193256935338564, 36.71598426106136),
    (3.1938077464538193, 36.71532195554804),
    (3.1942314474062976, 36.71472757391252),
    (3.1947398884357647, 36.7141841352789),
    (3.1917951674734373, 36.71338595281669),
    (3.1907359153287156, 36.71358974487194),
    (3.190418139685299, 36.713708623321196),
    (3.1901003640418826, 36.71415017023668),
    (3.1894859977979437, 36.71454076731578),
    (3.187727639093119, 36.71559367130391),
    (3.185672689932358, 36.71685034425384),
    (3.1848041031736867, 36.71732583676609),
    (3.185609134803675, 36.718073033338975),
    (3.1871980130572415, 36.719346647146835),
    (3.1880454147730193, 36.72007684285058),
    (3.18838437545933, 36.72055231539118),
    (3.188413646679244, 36.72072118464823)  # Close the polygon
]

# Create the polygon
geometry = Polygon(coords)

# Create a GeoDataFrame for the new quartier
yefsah = gpd.GeoDataFrame(
    {
        "name": ["Cité Smail Yefsah"],
        "geometry": [geometry]
    },
    crs="EPSG:4326"
)

# Convert to metric CRS (EPSG:3857) for accurate area calculation
yefsah = yefsah.to_crs(epsg=3857)

# Calculate area in km²
yefsah["superficie"] = yefsah["geometry"].area / 1e6  

# Convert back to geographic CRS (EPSG:4326)
yefsah = yefsah.to_crs(epsg=4326)

# Extract centroid for coordinates
yefsah["longitude"] = yefsah["geometry"].centroid.x
yefsah["latitude"] = yefsah["geometry"].centroid.y

# Approximate population using a density between 10,000 - 20,000 hab/km²
yefsah["population"] = (yefsah["superficie"] * np.random.randint(10000, 20000)).astype(int)

# Keep only necessary columns
yefsah = yefsah[["name", "geometry", "superficie", "longitude", "latitude", "population"]]

# Append the new quartier to the existing dataset
quartiers = pd.concat([quartiers, yefsah], ignore_index=True)

# Save updated data back to CSV
quartiers.to_csv(quartiers_file, index=False)

print(f"Cité Smail Yefsah added successfully to {quartiers_file}!")
