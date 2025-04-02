import pandas as pd
import math
import geopandas as gpd
from shapely.geometry import Point
from shapely.ops import nearest_points

def calculate_actual_average_distance(points_in_quartier):
    """
    Calculate the average distance between points de ramassage in a quartier.
    """
    if len(points_in_quartier) < 2:
        return float('inf')  # If only one point, return infinity
    
    distances = []
    for i, point in points_in_quartier.iterrows():
        p1 = Point(point["longitude_x"], point["latitude_x"])
        for j, other_point in points_in_quartier.iterrows():
            if i != j:
                p2 = Point(other_point["longitude_x"], other_point["latitude_x"])
                distances.append(p1.distance(p2))
    
    return sum(distances) / len(distances)

def calculate_saturation_and_etat(point, ideal_distance, actual_avg_distance):
    """
    Calculate the degree of saturation based on the difference between actual and ideal distances.
    """
    saturation_deviation = abs(actual_avg_distance - ideal_distance) / ideal_distance * 100
    
    degree_of_saturation = min(saturation_deviation, 100)  # Ensure it doesn't exceed 100%
    etat = "saturé" if degree_of_saturation > 50 else "non saturé"
    
    return degree_of_saturation, etat

def add_saturation_and_etat_to_points(point_ramassage_file, routes_file, quartiers_file):
    # Load the CSV files
    points = pd.read_csv(point_ramassage_file)
    routes = pd.read_csv(routes_file)
    quartiers = pd.read_csv(quartiers_file)
    
    # Merge points with routes
    points = points.merge(routes, how="left", left_on="route", right_on="id")
    
    # Merge with quartiers to get ideal_pts and ideal_dist
    points = points.merge(quartiers, how="left", left_on="Cartier", right_on="name")
    
    # Debugging: Print columns after merging to check if longitude and latitude have changed names
    print("Columns after merging with quartiers_info:", points.columns)

    saturation_results = []
    for quartier_name in points["Cartier"].unique():
        quartier_points = points[points["Cartier"] == quartier_name]
        ideal_distance = quartier_points["ideal_dist"].iloc[0]  # Ideal distance for this quartier
        actual_avg_distance = calculate_actual_average_distance(quartier_points)
        
        for _, point in quartier_points.iterrows():
            # Update the column names for longitude and latitude based on the merge output
            longitude_column = 'longitude_x'  # Adjust if it is 'longitude_x' or 'longitude_y'
            latitude_column = 'latitude_x'    # Adjust if it is 'latitude_x' or 'latitude_y'
            
            degree_of_saturation, etat = calculate_saturation_and_etat(point, ideal_distance, actual_avg_distance)
            
            saturation_results.append({
                "id": point["id_x"],
                "longitude": point[longitude_column],
                "latitude": point[latitude_column],
                "amenity": point["amenity"],
                "route": point["route"],
                "degre_de_saturation": degree_of_saturation,
                "etat": etat
            })
    
    return pd.DataFrame(saturation_results)

# Example usage
point_ramassage_file = "point_ramassage.csv"
routes_file = "routes_bab_ezzouar.csv"
quartiers_file = "quartiers_bab_ezzouar.csv"

result = add_saturation_and_etat_to_points(point_ramassage_file, routes_file, quartiers_file)
print(result)

# Save results
sature_points = result[result["etat"] == "saturé"]
non_sature_points = result[result["etat"] == "non saturé"]

sature_points.to_csv("point_ramassage_sature.csv", index=False)
non_sature_points.to_csv("point_ramassage_non_sature.csv", index=False)

# Convert to GeoDataFrame and save shapefiles
sature_points_gdf = gpd.GeoDataFrame(
    sature_points, geometry=gpd.points_from_xy(sature_points["longitude"], sature_points["latitude"])
)
non_sature_points_gdf = gpd.GeoDataFrame(
    non_sature_points, geometry=gpd.points_from_xy(non_sature_points["longitude"], non_sature_points["latitude"])
)

sature_points_gdf.to_file("region files/point_ramassage_sature_bab_ezzouar.shp", driver="ESRI Shapefile")
non_sature_points_gdf.to_file("region files/point_ramassage_non_sature_bab_ezzouar.shp", driver="ESRI Shapefile")

print("Shapefiles saved successfully!")
