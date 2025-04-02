import { Router } from "express";
import {
    getAllRoads, getAllCollectingPoints, getAllNeighborhoods, 
    addRoad, addNeighborhood, addCollectingPoint,
    deleteRoad, deleteCollectingPoint, deleteNeighborhood,
    updateRoad, updateCollectingPoint, updateNeighborhood,test
} from "../controllers/resouceController.js";

const router = Router();

//end points for roads, collecting points and neighborhoods
// get all roads, collecting points and neighborhoods
router.get("/allRoads", getAllRoads);

router.get("/allCollectingPoints", getAllCollectingPoints);

router.get("/allNeighborhoods", getAllNeighborhoods);

// add new roads, collecting points and neighborhoods
router.post("/addRoad", addRoad);

router.post("/addCollectingPoint", addCollectingPoint);

router.post("/addNeighborhood", addNeighborhood);

// delete roads, collecting points and neighborhoods by id
router.delete("/deleteRoad/:id", deleteRoad);

router.delete("/deleteCollectingPoint/:id", deleteCollectingPoint);

router.delete("/deleteNeighborhood/:id", deleteNeighborhood);

// update roads, collecting points and neighborhoods by id
router.patch("/updateRoad/:id", updateRoad);

router.patch("/updateCollectingPoint/:id", updateCollectingPoint);

router.patch("/updateNeighborhood/:id", updateNeighborhood);

// test endpoint to check if the server is running
router.get("/test", test);

export default router;