import osmnx as ox
import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Polygon

# Function to normalize names (remove special characters)
def normalize_name(name):
    return name.replace("é", "e").replace("è", "e").replace("ê", "e").replace("à", "a").replace("â", "a").replace("ô", "o")

# 1. Load administrative boundary of Bab Ezzouar
boundary = ox.geocode_to_gdf("Bab Ezzouar, Algérie").to_crs(epsg=3857)

# 2. Load quartiers (residential areas)
quartiers = ox.features_from_place("Bab Ezzouar, Algérie", {"landuse": "residential"})

# 3. Keep only relevant columns, normalize names, and transform CRS
quartiers = quartiers[["name", "geometry"]].dropna().to_crs(epsg=3857)
quartiers["name"] = quartiers["name"].apply(normalize_name)

# 4. Clip quartiers to Bab Ezzouar boundary
quartiers["geometry"] = quartiers["geometry"].intersection(boundary.iloc[0].geometry)

# Remove empty geometries
quartiers = quartiers[~quartiers["geometry"].is_empty]

# 5. Calculate area (km²) and centroid
quartiers["superficie"] = quartiers["geometry"].area / 1e6  
quartiers["centroid"] = quartiers["geometry"].centroid

# Convert back to geographic CRS (EPSG:4326)
quartiers = quartiers.to_crs(epsg=4326)

# Extract longitude and latitude from centroid
quartiers["longitude"] = quartiers["centroid"].x
quartiers["latitude"] = quartiers["centroid"].y
quartiers = quartiers.drop(columns=["centroid"])

# 6. Approximate population (keep under 7 km² total)
quartiers["population"] = (quartiers["superficie"] * np.random.randint(10000, 18000)).astype(int)

# 7. Load USTHB buildings and create a single polygon
usthb_buildings = ox.features_from_place("USTHB, Bab Ezzouar, Algérie", {"building": True})
usthb_polygon = usthb_buildings.unary_union

# Ensure USTHB is a single polygon
if usthb_polygon.geom_type != "Polygon":
    usthb_polygon = usthb_polygon.convex_hull

usthb = gpd.GeoDataFrame({
    "name": ["USTHB"],
    "geometry": [usthb_polygon],
    "superficie": [1.5],  
    "population": [15000],  # Keep fixed
    "longitude": [usthb_polygon.centroid.x],
    "latitude": [usthb_polygon.centroid.y]
}, crs="EPSG:4326")

# 8. Define "Cité Smail Yefsah"
coords_smail_yefsah = [
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
    (3.188413646679244, 36.72072118464823)
]

cite_smail_yefsah = Polygon(coords_smail_yefsah)

# 9. Define "Cité Universitaire CUB3"
coords_cub3 = [
    (3.186686429019489, 36.724231273728456),
    (3.1876101824013694, 36.72395292380469),
    (3.1890409583161614, 36.723474159575964),
    (3.1903675515856067, 36.72310673383353),
    (3.1903536605573075, 36.72267806825497),
    (3.1898813655951432, 36.72264466564188),
    (3.1898396925102466, 36.722594561695),
    (3.1896799456848086, 36.72223826601902),
    (3.189457689232025, 36.72228837019834),
    (3.189409070608613, 36.72224940025761),
    (3.188471426198434, 36.72083533570198),
    (3.1883394614295937, 36.72086873910193),
    (3.186992031601753, 36.72152010250441),
    (3.1858807493378363, 36.722026714659876),
    (3.18583907625294, 36.72214362468278),
    (3.1858668583059937, 36.72226053454446),
    (3.186271934566693, 36.72322346204528),
    (3.1865851570627113, 36.72399755452679),
    (3.186686429019489, 36.724231273728456)
]

cite_cub3 = Polygon(coords_cub3)

# Convert to GeoDataFrame and adjust CRS
quartiers_custom = gpd.GeoDataFrame({
    "name": ["Cite Smail Yefsah", "Cite Universitaire CUB3"],
    "geometry": [cite_smail_yefsah, cite_cub3]
}, crs="EPSG:4326").to_crs(epsg=3857)

# 10. Check for intersections and adjust
for index, row in quartiers.iterrows():
    for i, custom_quartier in quartiers_custom.iterrows():
        if row["geometry"].intersects(custom_quartier.geometry):
            print(f"Adjusting {row['name']} due to overlap with {custom_quartier['name']}")
            quartiers.at[index, "geometry"] = row["geometry"].difference(custom_quartier.geometry)

# Convert to EPSG:3857 for correct area calculation
quartiers_custom = quartiers_custom.to_crs(epsg=3857)

# Calculate area in km²
quartiers_custom["superficie"] = quartiers_custom["geometry"].area / 1e6

# Convert back to EPSG:4326
quartiers_custom = quartiers_custom.to_crs(epsg=4326)

# Extract centroid coordinates
quartiers_custom["longitude"] = quartiers_custom["geometry"].centroid.x
quartiers_custom["latitude"] = quartiers_custom["geometry"].centroid.y

# Ensure non-zero population by applying a reasonable density
quartiers_custom["population"] = (quartiers_custom["superficie"] * np.random.randint(10000, 18000)).astype(int)

print(quartiers_custom[["name", "superficie", "population"]])


# Merge everything
quartiers = pd.concat([quartiers, quartiers_custom, usthb], ignore_index=True)

# Save
quartiers.to_csv("quartiers_bab_ezzouar.csv", index=False)
quartiers.to_file("quartiers_bab_ezzouar.shp", driver="ESRI Shapefile")

print("Updated with Cité Smail Yefsah & Cité Universitaire CUB3. Adjustments applied.")
