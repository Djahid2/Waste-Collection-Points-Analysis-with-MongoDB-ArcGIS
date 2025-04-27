import {Router} from "express";
import {
    getDensity,
    getNearbyCollectionPoint,
    getNearestRoad,
    getLowDensityArea,
    getBinToPopulationRatio,
    getSuggestedBinLocation
} from "../controllers/analysisController.js";

const router = Router();

router.get("/getDensity", getDensity);

router.get("/nearbyCollectionPoint", getNearbyCollectionPoint);

router.get("/nearestRoad", getNearestRoad);

router.get("/lowDensityArea", getLowDensityArea);

router.get("/binToPopulationRatio", getBinToPopulationRatio);

router.get("/suggestedBinLocation", getSuggestedBinLocation); // amimir // xd

export default router;