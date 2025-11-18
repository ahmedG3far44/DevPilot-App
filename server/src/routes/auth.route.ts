
import {  Router } from "express";
import { getUserData, githubCallback, logout } from "../controllers/auth.controller";

const router = Router();

router.get("/auth/github/callback", githubCallback)
router.get("/auth/me", getUserData)
router.post("/auth/logout", logout)

export default router;