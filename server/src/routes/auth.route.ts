
import {  Router } from "express";
import { getUserData, githubCallback, logout } from "../controllers/auth.controller";

const router = Router();

router.get("/github/callback", githubCallback)
router.get("/me", getUserData)
router.post("/logout", logout)

export default router;