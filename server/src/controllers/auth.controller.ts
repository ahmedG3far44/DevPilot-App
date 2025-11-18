import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import User from "../models/User";


export const githubCallback = async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;

      if (!code) {
        return res.status(400).json({ error: "Missing GitHub code" });
      }
  
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
  
      const tokenData = await tokenResponse.json();
      const access_token = tokenData.access_token;


      if (!access_token) {
        return res.status(400).json({ error: "Failed to retrieve GitHub access token" });
      }

      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "User-Agent": "node-fetch",
        },
      });
      const githubUser = await userResponse.json();

      const user = await User.findOne({name:githubUser.name})

     
      const {id, name, login, avatar_url,repos_url,location, bio } = githubUser;
      if(!user){
        await User.create({
          githubId: id,
          name,
          username:login,
          avatar_url,
          repos_url,
          location,
          bio
        })
      }

  
      // Create your own JWT to store in cookie
      const jwtToken = jwt.sign(
        {
          id,
          name,
          username:login,
          avatar_url,
          repos_url,
          location,
          bio
        },
        process.env.JWT_SECRET || "supersecret",
        { expiresIn: "7d" }
      );
  
      // Send JWT as HttpOnly cookie
      res.cookie("session", jwtToken, {
        httpOnly: true,
        secure: false, //process.env.NODE_ENV === "production"
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
  
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: false, //process.env.NODE_ENV === "production"
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
  
      // You can redirect or send JSON response
      return res.redirect(`${process.env.CLIENT_URL}/user`);
      // or:
      // res.json({ message: "Login successful", user: githubUser });
    } catch (error) {
      console.error("GitHub auth error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

export const getUserData = async (req: Request, res: Response) => {
    try {
     
      const token = req.cookies.access_token;
    
      if (!token) return res.status(401).json({ authenticated: false });
    

        const userRes = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${token}` }
        });
    
        
        const data = await userRes.json()

        
        
        const user = await User.findOne({username:data.login})


        return res.json({
          authenticated: true,
          user
        });
    } catch (error) {
      console.error("GitHub auth error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }


export const logout = async (req: Request, res: Response) => {
    try {
      res.clearCookie("access_token", { path: "/" });
      res.clearCookie("session", { path: "/" });
      res.json({ success: true });
    } catch (error) {
      console.error("GitHub auth error:", error);
      res.status(500).json({ error: "Internal Server Error" })
  };
}