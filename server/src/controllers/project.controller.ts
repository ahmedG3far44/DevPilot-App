import { Response } from "express"
import { AuthRequest } from "../types"

import Project from "../models/Project"
import { streamRemoteCommand } from "../utils/ssh";

export const getProjectsList = async(req:AuthRequest, res:Response) =>{
    try{
        const user = req.user;

        if(!user)throw new Error("user not found !!")

        const projectsList = await Project.find({username:"ahmedG3far44"});

        
        res.status(200).json({data:projectsList, message:"getting projects list successfully", success:true})
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }

 export const getProjectById = async(req:AuthRequest, res:Response) =>{
    try{
        const projectId = req.params.id;

        if(!projectId) throw new Error("the project ID is required!!")

        const project = await Project.findById(projectId);

        res.status(200).json({data:project, message:"getting project by ID successfully", success:true})
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }
 export const updateProjectById = async(req:AuthRequest, res:Response) =>{
    try{
        const projectId = req.params.id;

        if(!projectId) throw new Error("the project ID is required!!")

            const updatedProjectInfo = {
                name: "Untitled",
                port: 3000,
                description: "lorem text",
                clone_url:"https://github.com/ahmedG3far44/repo/name.git",
                run_script: "npm run prod",
                build_script: "npm run build",
                main_directory: "./server",
                entry_file:"./src/index.js",
                typescript:false,
                type: "express",
                envVars: [{key:"NODE_ENV", value:"development"}],
            }

            const newProject = await Project.findByIdAndUpdate(projectId, updatedProjectInfo, { new: true, runValidators: true });

        res.status(200).json({data:newProject, message:"updatting project info by ID successfully", success:true})
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }
 export const deleteProjectById = async(req:AuthRequest, res:Response) =>{
    try{

        const user = req.user;
        const githubToken = req.cookies.access_token;
        const projectId = req.params.id as string;
    
        if (!githubToken) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: Missing GitHub token.",
          });
        }
    
        if (!user) {
          return res.status(403).json({
            success: false,
            message: "Forbidden: You do not have access to this resource.",
          });
        }
    
        const project = await Project.findById(projectId);
    
        if (!project) {
          return res.status(404).json({
            success: false,
            message: "Project not found. Please provide a valid project ID.",
          });
        }
    
    
        const allowedTypes = ["express", "next", "nest"];
        if (!allowedTypes.includes(project.type)) {
          return res.status(400).json({
            success: false,
            message: `Project type '${project.type}' does not support log streaming.`,
          });
        }
    
        const scriptPath = "/home/dev-pilot/scripts/delete_project.sh";
        const command = `sudo ${scriptPath} --project_name ${project.name} --type ${project.type}`;
    
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
    
        streamRemoteCommand(
          command,
          (chunk) => {
            res.write(chunk);
          },
          async () => {
            await Project.findByIdAndDelete(projectId);
            console.log("project was deleted success!")
            res.write("project was deleted success!");
            res.end();
          },
          (err) => {
            res.write(`[error] ${err.message}\n`);
            res.end();
          }
        );
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }
 export const getUserRepos = async(req:AuthRequest, res:Response) =>{
    try{

        const user = req.user;
        const github_token = req.cookies.access_token;
        
        if(!github_token) throw new Error("not authorized user!!")

        if(!user) throw new Error("your not allowed to do this action!!");

        const response = await fetch(`${user?.repos_url}`, {
            headers:{
                "Authorization": "Bearer " + github_token,
                "User-Agent": "DevPilot"
            }
        })

        const repos = await response.json();

        res.status(200).json({data:repos, message:"getting user repos success", success:true})
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }


export const streamProjectLogs = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const githubToken = req.cookies.access_token;
    const projectId = req.params.id as string;

    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing GitHub token.",
      });
    }

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found. Please provide a valid project ID.",
      });
    }


    const allowedTypes = ["express", "next", "nest"];
    if (!allowedTypes.includes(project.type)) {
      return res.status(400).json({
        success: false,
        message: `Project type '${project.type}' does not support log streaming.`,
      });
    }

    const scriptPath = "/home/dev-pilot/scripts/stream_logs.sh";
    const command = `sudo ${scriptPath} --project_name ${project.name} --type ${project.type}`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    streamRemoteCommand(
      command,
      (chunk) => {
        res.write(chunk);
      },
      (closeMessage) => {
        res.write(closeMessage);
        res.end();
      },
      (err) => {
        res.write(`[error] ${err.message}\n`);
        res.end();
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
      data: "[Error]: Internal server error",
    });
  }
};


 export const restartServer = async(req:AuthRequest, res:Response) =>{
    try{

        const user = req.user;
        const githubToken = req.cookies.access_token;
        const projectId = req.params.id as string;

    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing GitHub token.",
      });
    }

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found. Please provide a valid project ID.",
      });
    }


    const allowedTypes = ["express", "nest"];
    if (!allowedTypes.includes(project.type)) {
      return res.status(400).json({
        success: false,
        message: `Project type '${project.type}' does not support log streaming.`,
      });
    }

    const scriptPath = "/home/dev-pilot/scripts/restart_server.sh";
    const command = `sudo ${scriptPath} --project_name ${project.name} --type ${project.type}`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    streamRemoteCommand(
      command,
      (chunk) => {
        res.write(chunk);
      },
      (closeMessage) => {
        res.write(closeMessage);
        res.end();
      },
      (err) => {
        res.write(`[error] ${err.message}\n`);
        res.end();
      }
    );

      
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }
 export const startRunningServer = async(req:AuthRequest, res:Response) =>{
    try{

        const user = req.user;
        const githubToken = req.cookies.access_token;
        const projectId = req.params.id as string;

    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing GitHub token.",
      });
    }

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found. Please provide a valid project ID.",
      });
    }

    const allowedTypes = ["express", "next", "nest"];
    if (!allowedTypes.includes(project.type)) {
      return res.status(400).json({
        success: false,
        message: `Project type '${project.type}' does not support log streaming.`,
      });
    }

    const scriptPath = "/home/dev-pilot/scripts/start_server.sh";
    const command = `sudo ${scriptPath} --project_name ${project.name} --type ${project.type} --main_dir ${project.main_dir}`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    streamRemoteCommand(
      command,
      (chunk) => {
        res.write(chunk);
      },
      (closeMessage) => {
        res.write(closeMessage);
        res.end();
      },
      (err) => {
        res.write(`[error] ${err.message}\n`);
        res.end();
      }
    );
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }
 
 export const stopRunningServer = async(req:AuthRequest, res:Response) =>{
    try{

        const user = req.user;
    const githubToken = req.cookies.access_token;
    const projectId = req.params.id as string;

    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing GitHub token.",
      });
    }

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found. Please provide a valid project ID.",
      });
    }


    const allowedTypes = ["express", "nest"];
    if (!allowedTypes.includes(project.type)) {
      return res.status(400).json({
        success: false,
        message: `Project type '${project.type}' does not support log streaming.`,
      });
    }

    const scriptPath = "/home/dev-pilot/scripts/stop_server.sh";
    const command = `sudo ${scriptPath} --project_name ${project.name} --type ${project.type}`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    streamRemoteCommand(
      command,
      (chunk) => {
        res.write(chunk);
      },
      (closeMessage) => {
        res.write(closeMessage);
        res.end();
      },
      (err) => {
        res.write(`[error] ${err.message}\n`);
        res.end();
      }
    );
    }catch(error){
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
            data: "[Error]: Internal server error",
          });
    }
 }


