import type { IUser, RepositoryCardData } from "@/types/repository";
import { createContext, useContext } from "react";





export interface AuthContextType{ 
    user: IUser | null;
    loading:boolean;
    error:string | null;
    isAuthenticated:boolean;
    isAdmin:boolean
    logout:()=>Promise<void>;
    repos:RepositoryCardData[]
}

export const AuthContext = createContext<AuthContextType>({
    user:null,
    loading:false,
    isAdmin:false,
    isAuthenticated:false,
    error:null,
    logout:()=> Promise.resolve(),
    repos:[]
})


export const useAuth = ()=> useContext(AuthContext);