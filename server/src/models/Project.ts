import { Schema, Document, model } from "mongoose";



export interface IProject extends Document {
  _id: string;
  name: string;
  port: number;
  clone_url: string;
  run_script?: string;
  build_script?: string;
  main_dir: string;
  envVars:string;
  typescript: boolean;
  type: "react" | "nest" | "express" | "next" | "static";
  status?: "pending" | "failed" | "active";
  signal?: string;
  params?: Record<string, any>;
  command?: string;
  username?: string;
  url:string;
  pkg:PackageManagerType
}

export enum ProjectType {
  REACT = "react",
  NEST = "nest",
  EXPRESS = "express",
  NEXT = "next",
  STATIC = "static"
}
export enum PackageManagerType {
  NPM = "npm",
  PNPM = "pnpm",
  YARN = "yarn",
  BUN = "bun",
}


const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    clone_url: { type: String, required: true },
    run_script: { type: String },
    build_script: { type: String },
    port: { type: Number, required: true, default: 3000 },
    main_dir: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(ProjectType),
      required: true,
    },
    typescript: {
      type: Boolean,
      required: true,
      default: false,
    },
    envVars: { type: String },
    status: { type: String },
    params: { type: Schema.Types.Mixed },  
    username: { type: String, required:true }  ,
    url:{type:String, required:true} ,  
    command:{type:String},
    pkg:{type:String, enum:Object.values(PackageManagerType), default:PackageManagerType.NPM, required:true}
  },
  { timestamps: true }
);



projectSchema.pre<IProject>("save", async function (next) {
 
  if (!this.isNew || this.port) return next();

  const Project = model<IProject>("Project");
  const lastProject = await Project.findOne().sort({ port: -1 }).exec();

  const lastPort = lastProject ? lastProject.port : 3000;
  this.port = lastPort + 1;

  next();
});


const Project = model<IProject>("Project", projectSchema);

export default Project;


// sudo  bash /home/dev-pilot/scripts/deploy_server.sh \
//   --project-name "deit-ai-planner" \
//   --project-type express \
//   --port 6004 \
//   --clone-url "https://github.com/ahmedG3far44/deit-ai-planner.git" \ 
//   --env-vars "PORT=5555  GEMINI_API_KEY=AIzaSyCc7PU_RahGiT61Vx4VzjkQ3h3o2yujSv8" \
//   --package-manager npm \ 
//   --typescript true;

