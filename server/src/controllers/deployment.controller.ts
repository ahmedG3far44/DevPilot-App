import { Request, Response } from 'express';
import {  validateUpdateDeployment, ValidationError } from '../utils/validators';
import { AuthRequest, UpdateDeploymentDTO } from '../types';
import { deploySchema } from '../utils/schema';
import { generateDeployCommand } from '../utils/generateCommand';
import { Client } from 'ssh2';

import Deployment from '../models/Deployment';
import dotenv from 'dotenv'
import Project from '../models/Project';

dotenv.config()



const HOST = process.env.EC2_HOST as string;
const PASSWORD = process.env.EC2_SSH_PASSWORD as string;
const SSH_PORT  = process.env.EC2_SSH_PORT as string;
const USERNAME = process.env.EC2_USER as string;
const DOMAIN = process.env.DOMAIN as string;


export interface DeployRequest {
  name: string;
  repo: string;
  type: "express" | "nest" | "react" | "next" | "static";
  typescript: boolean;
  run_script: string;
  main_dir: string;
  port?: number;
  envVars: string; 
}




export const createDeployment = async (req: AuthRequest, res: Response) => {
  const parse = deploySchema.safeParse(req.body);
  const user = req.user;

  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }

  const data = parse.data;
  const command = generateDeployCommand(data);

  // prepare streaming response
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.flushHeaders();

  try {
    // const conn = new Client();

    // conn
    //   .on("ready", () => {
    //     res.write("Connected to server...\n");

    //     conn.exec(`${command};`, (err, stream) => {
    //       if (err) {
    //         res.write("ERR: " + err.message + "\n");
    //         res.end();
    //         conn.end();
    //         return;
    //       }

    //       stream
    //         .on("data", (chunk: Buffer) => {
    //           res.write(chunk.toString());
    //         })
    //         .stderr.on("data", (chunk: Buffer) => {
    //           res.write("ERR: " + chunk.toString());
    //         });

    //       stream.on("close", async (code: number, signal: string) => {
    //         res.write(`Command finished (exit=${code}, signal=${signal})\n`);
            
    //         try {

    //           // _id:string;
    //           // name: string;
    //           // port: number;
    //           // description: string;
    //           // clone_url:string;
    //           // run_script?: string;
    //           // build_script?: string;
    //           // main_directory: string;
    //           // typescript:boolean;
    //           // type: "react" | "nest" | "express" | "next" |"static";
    //           // envVars: "string";
    //           // status
    //           // signal
    //           // params data
    //           // comand
    //           // userId

    //           const project = {
    //               ...data,
    //               userId: user?.id,
    //               command,
    //               params: data,
    //               exitCode: code,
    //               signal,
    //               status: code === 0 ? "success" : "failed",
    //               url: `https://${data.name}.${DOMAIN}`
    //           }

    //           console.log(project)

    //           await Project.create(project);

    //           console.log("project info saved on db success!!")
    //         } catch (dbErr) {
    //           console.error("DB save error:", dbErr);
    //           res.write("Warning: failed to save deployment log to database\n");
    //         }

    //         res.end();
    //         conn.end();
    //       });
    //     });
    //   })
    //   .on("error", (err) => {
    //     res.write("SSH error: " + err.message + "\n");
    //     res.end();
    //   })
    //   .connect({
    //     host: HOST,
    //     username: USERNAME,
    //     password: PASSWORD,
    //     port: Number(SSH_PORT),
    //     tryKeyboard: false,
    //   });

    console.log(command)
    res.status(200).json(command)

  } catch (err: any) {
    console.error("[Deploy Error]", err);
    res.write(`Failed to start deployment: ${err.message}\n`);
    res.end();
  }
};


export const getDeployments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const deployments = await Deployment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    const total = await Deployment.countDocuments({ userId });

    res.status(200).json({
      deployments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch deployments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDeploymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const { id } = req.params;
    const deployment = await Deployment.findOne({ _id: id, userId });

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    res.status(200).json({ deployment });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateDeployment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const { id } = req.params;
    const validatedData: UpdateDeploymentDTO = validateUpdateDeployment(req.body);

    const deployment = await Deployment.findOne({ _id: id, userId });

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    Object.assign(deployment, validatedData);
    await deployment.save();

    res.status(200).json({
      message: 'Deployment updated successfully',
      deployment
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ 
      error: 'Failed to update deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const redeployProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const { id } = req.params;
    const deployment = await Deployment.findOne({ _id: id, userId });

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Update status to redeploying
    deployment.status = 'redeploying';
    await deployment.save();

    // Execute redeployment asynchronously
    // sshManager.executeDeployment({
    //   clone_url: deployment.clone_url,
    //   project_name: deployment.project_name,
    //   package_manager: deployment.package_manager,
    //   entry_file: deployment.entry_file,
    //   main_directory: deployment.main_directory,
    //   build_script: deployment.build_script,
    //   run_script: deployment.run_script,
    //   envVars: deployment.envVars,
    //   port: deployment.port
    // })
    //   .then(async () => {
    //     await Deployment.findByIdAndUpdate(deployment._id, {
    //       status: 'deployed',
    //       last_deployed_at: new Date(),
    //       error_message: undefined
    //     });
    //   })
    //   .catch(async (error) => {
    //     await Deployment.findByIdAndUpdate(deployment._id, {
    //       status: 'failed',
    //       error_message: error.message
    //     });
    //   });

    res.status(200).json({
      message: 'Redeployment initiated successfully',
      deployment
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to redeploy project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteDeployment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const { id } = req.params;
    const deployment = await Deployment.findOne({ _id: id, userId });

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Delete from EC2
    try {
    //   await sshManager.deleteDeployment(deployment.project_name);
    } catch (sshError) {
      console.error('SSH deletion error:', sshError);
      // Continue with DB deletion even if SSH fails
    }

    // Delete from database
    await Deployment.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Deployment deleted successfully',
      project_name: deployment.project_name
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
