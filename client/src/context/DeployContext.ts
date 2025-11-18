
import {createContext , useContext} from "react"



export interface DeployBodyType{
    name: string;
    repo:string;
    type: string;
    typescript: boolean;
    run_script:string;
    build_script?:string;
    main_dir:string;
    envVars: string;
    port?:number;
    pkg?:string;
    command? :string;
}

export interface DeployContextType {
    logs:string[]
    isDeploying:boolean;
    error:string | null;
    handleDeploy:(data:DeployBodyType)=> Promise<void>;
    
}

export const DeployContext = createContext<DeployContextType>({
    logs:[],
    isDeploying:false,
    error: null,
    handleDeploy:()=> Promise.resolve(),
})  


export const useDeploy = () => useContext(DeployContext)