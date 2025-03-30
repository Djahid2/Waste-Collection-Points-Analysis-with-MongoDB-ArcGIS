import osmnx as ox
import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Polygon

# Télécharger la limite administrative de Bab Ezzouar
boundary = ox.geocode_to_gdf("Bab Ezzouar, Algérie").to_crs(epsg=3857)

# Télécharger les polygones des zones résidentielles (quartiers)
quartiers = ox.features_from_place("Bab Ezzouar, Algérie", {"landuse": "residential"})

# Garder seulement les colonnes utiles et transformer en métrique pour les calculs
quartiers = quartiers[["name", "geometry"]].dropna().to_crs(epsg=3857)

# **Découper les quartiers qui dépassent Bab Ezzouar**
quartiers["geometry"] = quartiers["geometry"].intersection(boundary.iloc[0].geometry)

# Filtrer les géométries vides (certaines pourraient être complètement hors de la limite)
quartiers = quartiers[~quartiers["geometry"].is_empty]

# Calculer la superficie (en km²)
quartiers["superficie"] = quartiers["geometry"].area / 1e6  # Convertir m² en km²

# Calculer centroïde en métrique
quartiers["centroid"] = quartiers["geometry"].centroid

# Revenir au CRS d'origine (EPSG:4326)
quartiers = quartiers.to_crs(epsg=4326)

# Extraire longitude et latitude à partir du centroïde
quartiers["longitude"] = quartiers["centroid"].x
quartiers["latitude"] = quartiers["centroid"].y

# Supprimer la colonne centroid (inutile maintenant)
quartiers = quartiers.drop(columns=["centroid"])

# Générer une population approximative (densité entre 10,000 et 20,000 hab/km²)
quartiers["population"] = (quartiers["superficie"] * np.random.randint(10000, 20000)).astype(int)

# Télécharger les polygones des bâtiments de l’USTHB
usthb_buildings = ox.features_from_place("USTHB, Bab Ezzouar, Algérie", {"building": True})

# Fusionner tous les bâtiments en un seul polygone (convexe) pour simplifier
usthb_polygon = usthb_buildings.unary_union

# Vérifier si c'est un seul polygone, sinon prendre l'enveloppe convexe
if usthb_polygon.geom_type != "Polygon":
    usthb_polygon = usthb_polygon.convex_hull

# Ajouter USTHB avec le polygone
usthb = gpd.GeoDataFrame(
    {
        "name": ["USTHB"],
        "geometry": [usthb_polygon],
        "superficie": [1.5],  # Convertir m² en km²
        "population": [15000],
        "longitude": [usthb_polygon.centroid.x],
        "latitude": [usthb_polygon.centroid.y]
    }, 
    crs="EPSG:4326"
)

# Concaténer les données
quartiers = pd.concat([quartiers, usthb], ignore_index=True)

# Sauvegarder en CSV
quartiers.to_csv("quartiers_bab_ezzouar.csv", index=False)

# Sauvegarder en Shapefile
quartiers.to_file("quartiers_bab_ezzouar.shp", driver="ESRI Shapefile")

print("Fichiers CSV et Shapefile créés avec succès avec la géométrie de l’USTHB et découpage des quartiers !")
