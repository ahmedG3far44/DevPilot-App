import { Router } from "express";

import authRouter from "./auth.route"
import projectRouter from "./project.route"
import deployRouter from "./deployment.route"


const router = Router()



router.use("/auth", authRouter)
router.use("/project", projectRouter)
router.use("/deploy", deployRouter)

export default router;