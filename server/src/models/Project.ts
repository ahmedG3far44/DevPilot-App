import { Schema, Document, model } from "mongoose";


export interface IEnv {
    _id?:string;
  key: string;
  value: string;
}

export interface IProject extends Document {
  _id: string;
  name: string;
  port: number;
  description: string;
  clone_url: string;
  run_script?: string;
  build_script?: string;
  main_directory: string;
  envVars:string;
  entry_file: string;
  typescript: boolean;
  type: "react" | "nest" | "express" | "next" | "static";
  status?: string;
  signal?: string;
  params?: Record<string, any>;
  command?: string;
  userId?: string;
  url:string
}

export enum ProjectType {
  REACT = "react",
  NEST = "nest",
  EXPRESS = "express",
  NEXT = "next",
  STATIC = "static"
}

// const envSchema = new Schema<IEnv>({
//   key: { type: String, required: true },
//   value: { type: String, required: true },
// });

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    clone_url: { type: String, required: true },
    run_script: { type: String },
    build_script: { type: String },
    port: { type: Number, required: true, default: 3000 },
    main_directory: { type: String, required: true },
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
    signal: { type: String },
    params: { type: Schema.Types.Mixed },  
    userId: { type: Schema.Types.ObjectId, ref: "User" }  ,
    url:{type:String, required:true}          
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