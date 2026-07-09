import express from "express";
import { verifyJWT, requireAdmin } from "../middlewares/authMiddleware.js";
import { 
    createApplication, 
    getApplications, 
    getApplicationById, 
    overrideApplicationDecision 
} from "../controllers/applicationController.js";

const applicationsRouter = express.Router();

// Get list of applications (paginated)
applicationsRouter.get("/", verifyJWT, getApplications);

// Get single application by ID
applicationsRouter.get("/:id", verifyJWT, getApplicationById);

// Submit a new application (Calls ML model)
applicationsRouter.post("/", verifyJWT, createApplication);

// Override an application's decision (Admin only)
applicationsRouter.patch("/:id/override", verifyJWT, requireAdmin, overrideApplicationDecision);

export default applicationsRouter;