 import { Router } from "express";
import { deleteProjectById, getProjectById, getProjectsList, getUserRepos, restartServer, startRunningServer, stopRunningServer, streamProjectLogs, updateProjectById } from "../controllers/project.controller";

import { redeployProject } from "../controllers/project.controller";


import { authMiddleware } from "../middlewares/auth";


 const router = Router();

 
//  router.use(authMiddleware)

 router.get("/user/repos", authMiddleware, getUserRepos);
 router.get("/",authMiddleware , getProjectsList);
 router.get("/:id", authMiddleware, getProjectById);
 router.put("/:id", authMiddleware, updateProjectById);


 router.get("/:id/redeploy", redeployProject);
 router.get("/:id/logs", streamProjectLogs);
 router.post("/:id/start", startRunningServer);
 router.post("/:id/restart", restartServer);
 router.post("/:id/stop", stopRunningServer);
 router.delete("/:id/delete", deleteProjectById);


 export default router;