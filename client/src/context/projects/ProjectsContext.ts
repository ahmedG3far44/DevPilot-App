import type { ProjectData } from "@/components/project/ProjectMonitor";
import { createContext, useContext } from "react";

export interface ProjectContextType{
    projects:ProjectData[];
    project:ProjectData| null;
    logs:string[];
    setLogs:(log:string)=> void;
    getProjectsList:()=> void;
    startServer:(projectId:string)=>Promise<void>
    redeploy:(projectId:string)=>Promise<void>
    stopServer:(projectId:string)=>Promise<void>
    restartServer:(projectId:string)=>Promise<void>
    streamLogs:(projectId:string)=>Promise<void>
    deleteProject:(projectId:string)=>Promise<void>
    loading:boolean;
    stopping:boolean;
    restarting:boolean;
    redeploying:boolean;
    starting:boolean;
    deleting:boolean;
    error:string | null;

}


export const ProjectsContext = createContext<ProjectContextType>({
    projects:[],
    project:null,
    logs:[],
    setLogs:()=>{},
    getProjectsList:()=> Promise.resolve(),
    redeploy:()=> Promise.resolve(),
    startServer:()=>Promise.resolve(),
    stopServer:()=>Promise.resolve(),
    restartServer:()=>Promise.resolve(),
    streamLogs:()=>Promise.resolve(),
    deleteProject:()=>Promise.resolve(),
    loading:false,
    starting:false,
    restarting:false,
    redeploying:false,
    stopping:false,
    deleting:false,
    error:null
});


export const useProject = ()=> useContext(ProjectsContext);