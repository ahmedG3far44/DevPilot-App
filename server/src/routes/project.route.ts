 import { Router } from "express";
import { deleteProjectById, getProjectById, getProjectsList, getUserRepos, updateProjectById } from "../controllers/project.controller";
import { authMiddleware } from "../middlewares/auth";


 const router = Router();



 router.get("/user/repos", authMiddleware, getUserRepos);
 router.get("/", getProjectsList);
 router.get("/:id", getProjectById);
 router.put("/:id", updateProjectById);
 router.delete("/:id", deleteProjectById);


 export default router;