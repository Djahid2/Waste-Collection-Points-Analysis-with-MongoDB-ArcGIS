import {Router} from "express";

const router = Router();

router.get("/getDensity", getDensity);

router.get("/nearbyCollectionPoint", getNearbyCollectionPoint);

router.get("/nearestRoad", getNearestRoad);

router.get("/lowDensityArea", getLowDensityArea);

router.get("/binToPopulationRatio", getBinToPopulationRatio);