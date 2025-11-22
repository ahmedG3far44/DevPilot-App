import { z } from "zod";


export const ProjectTypeSchema = z.enum([
  "static",
  "react",
  "express",
  "next",
  "nest",
]);

export const deploySchema = z.object({
  name: z.string(),
  repo: z.string(),
  type: ProjectTypeSchema,
  pkg: z.string().optional(),
  main_dir: z.string().optional(),
  envVars: z.string().optional(),
  port: z.number().optional(),
  run_script: z.string().optional(),
  typescript: z.boolean().optional(),
  build_script: z.string().optional(),
});

export type DeployConfig = z.infer<typeof deploySchema>;
