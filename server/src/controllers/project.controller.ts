import { Response } from "express"
import { AuthRequest } from "../types"

import Project from "../models/Project"

export const getProjectsList = async(req:AuthRequest, res:Response) =>{
    try{
        const user = req.user;

        if(!user)throw new Error("user not found !!")

        const projectsList = await Project.find({username:"ahmedG3far44"});

        
        res.status(200).json({data:projectsList, message:"getting projects list successfully", success:true})
    }catch(error){
        res.status(500).json({data:"[Error]:internal server error", message:(error as Error).message, success:false})
    }
 }

 export const getProjectById = async(req:AuthRequest, res:Response) =>{
    try{
        const projectId = req.params.id;

        if(!projectId) throw new Error("the project ID is required!!")

        const project = await Project.findById(projectId);

        res.status(200).json({data:project, message:"getting project by ID successfully", success:true})
    }catch(error){
        res.status(500).json({data:"[Error]:internal server error", message:(error as Error).message, success:false})
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
        res.status(500).json({data:"[Error]:internal server error", message:(error as Error).message, success:false})
    }
 }
 export const deleteProjectById = async(req:AuthRequest, res:Response) =>{
    try{

        const projectId = req.params.id;

        if(!projectId) throw new Error("the project ID is required!!")

        const deletedProject = await Project.findByIdAndDelete(projectId);

        res.status(200).json({data:deletedProject, message:"deleted project by ID successfully", success:true})
    }catch(error){
        res.status(500).json({data:"[Error]:internal server error", message:(error as Error).message, success:false})
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
        res.status(500).json({data:"[Error]:internal server error", message:(error as Error).message, success:false})
    }
 }