 import { Router } from "express";
import { deleteProjectById, getProjectById, getProjectsList, getUserRepos, restartServer, startRunningServer, stopRunningServer, streamProjectLogs, updateProjectById } from "../controllers/project.controller";
import { authMiddleware } from "../middlewares/auth";


 const router = Router();

 
 router.use(authMiddleware)

 router.get("/user/repos", getUserRepos);
 router.get("/", getProjectsList);
 router.get("/:id", getProjectById);
 router.put("/:id", updateProjectById);


 router.get("/:id/logs", streamProjectLogs);
 router.post("/:id/start", startRunningServer);
 router.post("/:id/restart", restartServer);
 router.post("/:id/stop", stopRunningServer);
 router.delete("/:id/delete", deleteProjectById);


 export default router;