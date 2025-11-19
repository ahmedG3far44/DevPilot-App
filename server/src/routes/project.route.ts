 import { Router } from "express";
import { deleteProjectById, getProjectById, getProjectsList, getUserRepos, updateProjectById } from "../controllers/project.controller";
import { authMiddleware } from "../middlewares/auth";


 const router = Router();

 
 router.use(authMiddleware)

 router.get("/user/repos", getUserRepos);
 router.get("/", getProjectsList);
 router.get("/:id", getProjectById);
 router.put("/:id", updateProjectById);
 router.delete("/:id", deleteProjectById);


 export default router;