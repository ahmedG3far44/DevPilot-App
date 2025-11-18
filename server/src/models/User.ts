import {Document, model, Schema} from "mongoose"


export interface IUser extends Document{
    _id:string;
    githubId:string;
    name:string;
    username:string;
    avatar_url:string;
    bio:string
    repos_url:string;
    location:string;
    isAdmin:boolean;
    blocked:boolean;
    createdAt?:Date;
    updatedAt?:Date;
}



const userSchema = new Schema<IUser>({
    githubId:{
        type:String, required:true,
        unique:true
    },
    name:{
        type:String, required:true,
        unique:true
    },
    username:{
        type:String, required:true,
        unique:true
    },
    avatar_url:{
        type:String, required:true
    },
    repos_url:{
        type:String, required:true
    },
    location:{
        type:String, required:true
    },
    bio:{
        type:String, required:true
    },
    isAdmin:{
        type:Boolean, required:true , default:false
    },
    blocked:{
        type:Boolean, required:true, default:false
    }
}, {
    timestamps:true
})



const User = model<IUser>("users", userSchema);


export default User;

