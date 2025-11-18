
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
    loading:boolean;
    error:string | null;
    deploy:(data:DeployBodyType)=> Promise<void>;
    
}

export const DeployContext = createContext<DeployContextType>({
    logs:[],
    loading:false,
    error: null,
    deploy:()=> Promise.resolve(),
})  


export const useDeploy = () => useContext(DeployContext)