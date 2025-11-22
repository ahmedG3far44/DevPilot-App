type ProjectType = "static" | "react" | "express" | "next" | "nest";

interface DeployConfig {
  name: string;
  repo: string;
  type: ProjectType;
  pkg?: string;
  main_dir?: string;
  envVars?: string;
  port?: number;
  run_script?: string;
  typescript?: boolean;
  build_script?: string;
}

export function generateDeployCommand(config: DeployConfig): string {
  const {
    name,
    repo,
    type,
    pkg,
    main_dir,
    envVars,
    port,
    run_script,
    typescript,
  } = config;

  // ------------------------------------------------------
  // CLIENT PROJECTS → deploy_client.sh
  // ------------------------------------------------------
  if (type === "static" || type === "react") {
    const flags = {
      "--name": name,
      "--repo": repo,
      "--type": type,
      "--pkg": pkg,
      "--main_dir": main_dir,
      "--env": envVars,
    };

    return buildCommand("sudo bash /home/dev-pilot/scripts/deploy_client.sh", flags);
  }

  // ------------------------------------------------------
  // SERVER PROJECTS → deploy_server.sh
  // custom ordering:
  // 1. project-type
  // 2. port
  // 3. clone-url
  // 4. project-name
  // then the rest
  // ------------------------------------------------------

  const orderedFlags: Record<string, any> = {
    "--project-type": type,
    "--port": port,
    "--clone-url": repo,
    "--project-name": name,
  };

  const optionalFlags: Record<string, any> = {
    "--main-dir": main_dir,
    "--run-script": run_script,
    "--env-vars": envVars,
    "--package-manager": pkg,
    "--typescript": typescript,
  };

  return buildOrderedCommand("sudo bash /home/dev-pilot/scripts/deploy_server.sh", orderedFlags, optionalFlags);
}

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function buildCommand(script: string, flags: Record<string, any>): string {
  const parts: string[] = [];

  for (const key in flags) {
    const value = flags[key];
    if (value === undefined || value === "" || value === null) continue;
    parts.push(`${key} "${value}"`);
  }

  return `${script} ${parts.join(" \\\n")}`.trim();
}

function buildOrderedCommand(
  script: string,
  orderedFlags: Record<string, any>,
  optionalFlags: Record<string, any>
): string {
  const parts: string[] = [];

  // 1. Required flags in exact order
  for (const key of Object.keys(orderedFlags)) {
    const value = orderedFlags[key];
    if (value === undefined || value === "" || value === null) continue;
    parts.push(`${key} "${value}"`);
  }

  // 2. Remaining optional flags
  for (const key of Object.keys(optionalFlags)) {
    const value = optionalFlags[key];
    if (value === undefined || value === "" || value === null) continue;
    parts.push(`${key} "${value}"`);
  }

  return `${script} ${parts.join(" \\\n")}`.trim();
}
