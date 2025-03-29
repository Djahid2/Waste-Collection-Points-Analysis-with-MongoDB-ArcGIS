import { Router } from "express";
import { getAllRoads, getAllCollectingPoints, getAllNeighborhoods, addRoad, addNeighborhood, addCollectingPoint } from "../controllers/resouceController.js";

const router = Router();

router.get("/allRoads", getAllRoads);

router.get("/allCollectingPoints", getAllCollectingPoints);

router.get("/allNeighborhoods", getAllNeighborhoods);

router.post("/addRoad", addRoad);

router.post("/addCollectingPoint", addCollectingPoint);

router.post("/addNeighborhood", addNeighborhood);
