import { Router } from "express";
import {
    getAllRoads, getAllCollectingPoints, getAllNeighborhoods, addRoad, addNeighborhood, addCollectingPoint,
    deleteRoad, deleteCollectingPoint, deleteNeighborhood
} from "../controllers/resouceController.js";

const router = Router();

router.get("/allRoads", getAllRoads);

router.get("/allCollectingPoints", getAllCollectingPoints);

router.get("/allNeighborhoods", getAllNeighborhoods);

router.post("/addRoad", addRoad);

router.post("/addCollectingPoint", addCollectingPoint);

router.post("/addNeighborhood", addNeighborhood);

router.delete("/deleteRoad/:id", deleteRoad);

router.delete("/deleteCollectingPoint/:id", deleteCollectingPoint);

router.delete("/deleteNeighborhood/:id", deleteNeighborhood);