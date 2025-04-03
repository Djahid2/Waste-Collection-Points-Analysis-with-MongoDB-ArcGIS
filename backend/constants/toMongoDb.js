const neighborhoods ={
    "displayFieldName": "",
    "fieldAliases": {
        "FID": "FID",
        "name": "name",
        "superficie": "superficie",
        "longitude": "longitude",
        "latitude": "latitude",
        "population": "population",
        "ideal_pts": "ideal_pts",
        "ideal_dist": "ideal_dist"
    },
    "geometryType": "esriGeometryPolygon",
    "spatialReference": {
        "wkid": 4326,
        "latestWkid": 4326
    },
    "fields": [
        {
            "name": "FID",
            "type": "esriFieldTypeOID",
            "alias": "FID"
        },
        {
            "name": "name",
            "type": "esriFieldTypeString",
            "alias": "name",
            "length": 108
        },
        {
            "name": "superficie",
            "type": "esriFieldTypeDouble",
            "alias": "superficie"
        },
        {
            "name": "longitude",
            "type": "esriFieldTypeDouble",
            "alias": "longitude"
        },
        {
            "name": "latitude",
            "type": "esriFieldTypeDouble",
            "alias": "latitude"
        },
        {
            "name": "population",
            "type": "esriFieldTypeDouble",
            "alias": "population"
        },
        {
            "name": "ideal_pts",
            "type": "esriFieldTypeDouble",
            "alias": "ideal_pts"
        },
        {
            "name": "ideal_dist",
            "type": "esriFieldTypeDouble",
            "alias": "ideal_dist"
        }
    ],
    "features": []
};

const roads = {
    "displayFieldName" : "",
  "fieldAliases" : {
    "FID" : "FID",
    "osm_id" : "osm_id",
    "code" : "code",
    "fclass" : "fclass",
    "name" : "name",
    "ref" : "ref",
    "oneway" : "oneway",
    "maxspeed" : "maxspeed",
    "layer" : "layer",
    "bridge" : "bridge",
    "tunnel" : "tunnel",
    "FID_1" : "FID_1",
    "osm_id_1" : "osm_id_1",
    "code_1" : "code_1",
    "fclass_1" : "fclass_1",
    "name_1" : "name_1",
    "ref_1" : "ref_1",
    "oneway_1" : "oneway_1",
    "maxspeed_1" : "maxspeed_1",
    "layer_1" : "layer_1",
    "bridge_1" : "bridge_1",
    "tunnel_1" : "tunnel_1",
    "Cartier" : "Cartier"
  },
  "geometryType" : "esriGeometryPolyline",
  "spatialReference" : {
    "wkid" : 4326,
    "latestWkid" : 4326
  },
  "fields" : [
    {
      "name" : "FID",
      "type" : "esriFieldTypeOID",
      "alias" : "FID"
    },
    {
      "name" : "osm_id",
      "type" : "esriFieldTypeDouble",
      "alias" : "osm_id"
    },
    {
      "name" : "code",
      "type" : "esriFieldTypeDouble",
      "alias" : "code"
    },
    {
      "name" : "fclass",
      "type" : "esriFieldTypeString",
      "alias" : "fclass",
      "length" : 80
    },
    {
      "name" : "name",
      "type" : "esriFieldTypeString",
      "alias" : "name",
      "length" : 80
    },
    {
      "name" : "ref",
      "type" : "esriFieldTypeString",
      "alias" : "ref",
      "length" : 80
    },
    {
      "name" : "oneway",
      "type" : "esriFieldTypeString",
      "alias" : "oneway",
      "length" : 80
    },
    {
      "name" : "maxspeed",
      "type" : "esriFieldTypeDouble",
      "alias" : "maxspeed"
    },
    {
      "name" : "layer",
      "type" : "esriFieldTypeDouble",
      "alias" : "layer"
    },
    {
      "name" : "bridge",
      "type" : "esriFieldTypeString",
      "alias" : "bridge",
      "length" : 80
    },
    {
      "name" : "tunnel",
      "type" : "esriFieldTypeString",
      "alias" : "tunnel",
      "length" : 80
    },
    {
      "name" : "FID_1",
      "type" : "esriFieldTypeDouble",
      "alias" : "FID_1"
    },
    {
      "name" : "osm_id_1",
      "type" : "esriFieldTypeDouble",
      "alias" : "osm_id_1"
    },
    {
      "name" : "code_1",
      "type" : "esriFieldTypeDouble",
      "alias" : "code_1"
    },
    {
      "name" : "fclass_1",
      "type" : "esriFieldTypeString",
      "alias" : "fclass_1",
      "length" : 80
    },
    {
      "name" : "name_1",
      "type" : "esriFieldTypeString",
      "alias" : "name_1",
      "length" : 80
    },
    {
      "name" : "ref_1",
      "type" : "esriFieldTypeString",
      "alias" : "ref_1",
      "length" : 80
    },
    {
      "name" : "oneway_1",
      "type" : "esriFieldTypeString",
      "alias" : "oneway_1",
      "length" : 80
    },
    {
      "name" : "maxspeed_1",
      "type" : "esriFieldTypeDouble",
      "alias" : "maxspeed_1"
    },
    {
      "name" : "layer_1",
      "type" : "esriFieldTypeDouble",
      "alias" : "layer_1"
    },
    {
      "name" : "bridge_1",
      "type" : "esriFieldTypeString",
      "alias" : "bridge_1",
      "length" : 80
    },
    {
      "name" : "tunnel_1",
      "type" : "esriFieldTypeString",
      "alias" : "tunnel_1",
      "length" : 80
    },
    {
      "name" : "Cartier",
      "type" : "esriFieldTypeString",
      "alias" : "Cartier",
      "length" : 108
    }
  ],
  "features" : []
};

const communs = {
    "displayFieldName": "",
    "fieldAliases": {
        "FID": "FID",
        "osm_id": "osm_id",
        "name": "name"
    },
    "geometryType": "esriGeometryPolygon",
    "spatialReference": {
        "wkid": 4326,
        "latestWkid": 4326
    },
    "fields": [
        {
            "name": "FID",
            "type": "esriFieldTypeOID",
            "alias": "FID"
        },
        {
            "name": "osm_id",
            "type": "esriFieldTypeString",
            "alias": "osm_id",
            "length": 80
        },
        {
            "name": "name",
            "type": "esriFieldTypeString",
            "alias": "name",
            "length": 80
        }
    ],
    "features": []
};

const collectingPoint = {
    "displayFieldName": "",
    "fieldAliases": {
        "FID": "FID",
        "id": "id",
        "amenity": "amenity",
        "route": "route",
        "dsatur": "dsatur",
        "esatur": "esatur"
    },
    "geometryType": "esriGeometryPoint",
    "spatialReference": {
        "wkid": 4326,
        "latestWkid": 4326
    },
    "fields": [
        {
            "name": "FID",
            "type": "esriFieldTypeOID",
            "alias": "FID"
        },
        {
            "name": "id",
            "type": "esriFieldTypeString",
            "alias": "id",
            "length": 254
        },
        {
            "name": "amenity",
            "type": "esriFieldTypeString",
            "alias": "amenity",
            "length": 100
        },
        {
            "name": "route",
            "type": "esriFieldTypeInteger",
            "alias": "route"
        },
        {
            "name": "dsatur",
            "type": "esriFieldTypeDouble",
            "alias": "dsatur"
        },
        {
            "name": "esatur",
            "type": "esriFieldTypeString",
            "alias": "esatur",
            "length": 1
        }
    ],
    "features": []
};
