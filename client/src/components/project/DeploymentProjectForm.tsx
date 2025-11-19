import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDeploy, type DeployBodyType } from "@/context/DeployContext";
import DeploymentLogs from "./DeploymentLogs";
import ErrorMessage from "../ui/error";
import { Button } from "../ui/button";

interface EnvVar {
  id: string;
  key: string;
  value: string;
  isVisible: boolean;
}

type ProjectType = "nextjs" | "react" | "static" | "express" | "nestjs";

interface ProjectFormData {
  projectType: ProjectType;
  packageManager: string;
  runScript: string;
  buildScript: string;
  mainDirectory: string;
  envVars: EnvVar[];
  typescript: boolean;
}

interface PackageManager {
  value: string;
  label: string;
  runCmd: string;
  buildCmd: string;
  installCmd: string;
}

interface ProjectTypeConfig {
  image: string;
  value: ProjectType;
  label: string;
  description: string;
  requiresRunScript: boolean;
  requiresBuildScript: boolean;
  defaultRunScript: string;
  defaultBuildScript: string;
}

const PACKAGE_MANAGERS: PackageManager[] = [
  {
    value: "npm",
    label: "npm",
    runCmd: "npm start",
    buildCmd: "npm run build",
    installCmd: "npm install",
  },
  {
    value: "yarn",
    label: "Yarn",
    runCmd: "yarn start",
    buildCmd: "yarn build",
    installCmd: "yarn install",
  },
  {
    value: "pnpm",
    label: "pnpm",
    runCmd: "pnpm start",
    buildCmd: "pnpm build",
    installCmd: "pnpm install",
  },
  {
    value: "bun",
    label: "Bun",
    runCmd: "bun start",
    buildCmd: "bun run build",
    installCmd: "bun install",
  },
];

const PROJECT_TYPES: ProjectTypeConfig[] = [
  {
    image: "/images/nextjs.png",
    value: "nextjs",
    label: "Next.js",
    description: "React framework with SSR/SSG",
    requiresRunScript: true,
    requiresBuildScript: true,
    defaultRunScript: "npm start",
    defaultBuildScript: "npm run build",
  },
  {
    image: "/images/reactjs.png",
    value: "react",
    label: "React",
    description: "Client-side React application",
    requiresRunScript: false,
    requiresBuildScript: true,
    defaultRunScript: "",
    defaultBuildScript: "npm run build",
  },
  {
    image: "/images/static.png",
    value: "static",
    label: "Static Site",
    description: "HTML/CSS/JS static files",
    requiresRunScript: false,
    requiresBuildScript: false,
    defaultRunScript: "",
    defaultBuildScript: "",
  },
  {
    image: "/images/expressjs.png",
    value: "express",
    label: "Express.js",
    description: "Node.js web framework",
    requiresRunScript: true,
    requiresBuildScript: false,
    defaultRunScript: "npm start",
    defaultBuildScript: "",
  },
  {
    image: "/images/nestjs.png",
    value: "nestjs",
    label: "NestJS",
    description: "Progressive Node.js framework",
    requiresRunScript: true,
    requiresBuildScript: true,
    defaultRunScript: "npm run start:prod",
    defaultBuildScript: "npm run build",
  },
];

const DeploymentProjectForm: React.FC = () => {
  const { repos } = useAuth();
  const { repoName } = useParams();
  const { handleDeploy, isDeploying, logs, error } = useDeploy();

  const navigate = useNavigate();

  const deployedProject = repos.find(
    (repo) =>
      repo.name.toLowerCase().trim() === repoName?.toLocaleLowerCase().trim()
  );

  if (!deployedProject) return <Navigate to={"/"} />;

  if (error) return <ErrorMessage message={error} />;

  const [formData, setFormData] = useState<ProjectFormData>({
    projectType: "nextjs",
    packageManager: "npm",
    runScript: "npm start",
    buildScript: "npm run build",
    mainDirectory: "./",
    envVars: [],
    typescript: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentProjectType = PROJECT_TYPES.find(
    (pt) => pt.value === formData.projectType
  )!;

  useEffect(() => {
    const pm = PACKAGE_MANAGERS.find(
      (p) => p.value === formData.packageManager
    );
    if (!pm) return;

    const projectType = PROJECT_TYPES.find(
      (pt) => pt.value === formData.projectType
    );
    if (!projectType) return;

    const runScript = projectType.requiresRunScript
      ? formData.projectType === "nestjs"
        ? `${formData.packageManager} run start:prod`
        : pm.runCmd
      : "";

    const buildScript = projectType.requiresBuildScript ? pm.buildCmd : "";

    setFormData((prev) => ({
      ...prev,
      runScript,
      buildScript,
    }));
  }, [formData.packageManager, formData.projectType]);

  const handleInputChange = (
    field: keyof ProjectFormData,
    value: string | ProjectType | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const canAddEnvVar = () => {
    if (formData.envVars.length === 0) return true;
    const lastEnvVar = formData.envVars[formData.envVars.length - 1];
    return lastEnvVar.key.trim() !== "" && lastEnvVar.value.trim() !== "";
  };

  const addEnvVar = () => {
    if (!canAddEnvVar()) return;

    const newEnvVar: EnvVar = {
      id: Date.now().toString(),
      key: "",
      value: "",
      isVisible: false,
    };
    setFormData((prev) => ({
      ...prev,
      envVars: [...prev.envVars, newEnvVar],
    }));
  };

  const updateEnvVar = (
    id: string,
    field: keyof EnvVar,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      envVars: prev.envVars.map((env) =>
        env.id === id ? { ...env, [field]: value } : env
      ),
    }));
  };

  const removeEnvVar = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      envVars: prev.envVars.filter((env) => env.id !== id),
    }));
  };

  const toggleEnvVisibility = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      envVars: prev.envVars.map((env) =>
        env.id === id ? { ...env, isVisible: !env.isVisible } : env
      ),
    }));
  };

  const validateEnvKey = (key: string): boolean => {
    return /^[A-Z_][A-Z0-9_]*$/i.test(key);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentProjectType.requiresRunScript && !formData.runScript.trim()) {
      newErrors.runScript = "Run script is required for this project type";
    }

    if (
      currentProjectType.requiresBuildScript &&
      !formData.buildScript.trim()
    ) {
      newErrors.buildScript = "Build script is required for this project type";
    }

    if (!formData.mainDirectory.trim()) {
      newErrors.mainDirectory = "Main directory is required";
    }

    if (
      formData.mainDirectory &&
      !/^\.\/[\w\-\/]*$|^\.\/$/.test(formData.mainDirectory)
    ) {
      newErrors.mainDirectory =
        "Directory must start with ./ and contain valid characters";
    }

    formData.envVars.forEach((env, index) => {
      if (env.key.trim() && !validateEnvKey(env.key)) {
        newErrors[`envKey_${index}`] =
          "Invalid key format. Use only letters, numbers, and underscores";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getEnvVarsString = (): string => {
    return formData.envVars
      .filter((env) => env.key.trim() && env.value.trim())
      .map((env) => `${env.key}=${env.value}`)
      .join(" ");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const envVarsString = getEnvVarsString();

      const deployPayload: DeployBodyType = {
        name: deployedProject?.name,
        repo: deployedProject?.clone_url,
        type: formData.projectType,
        typescript: formData.typescript,
        run_script: formData.runScript,
        build_script: formData.buildScript,
        main_dir: formData.mainDirectory,
        pkg: formData.packageManager,
        envVars: envVarsString,
      };

      console.log("Deploy Payload:", deployPayload);
      console.log("Environment Variables:", envVarsString);

      await handleDeploy(deployPayload).then(() => {
        setIsSubmitted(true);
      });

      if (isSubmitted) {
        return navigate(`/project/${deployedProject.id}`);
      }
    } catch (error) {
      console.error("Deployment error:", error);
      setErrors({ submit: "Failed to deploy project. Please try again." });
    }
  };

  if (!isDeploying)
    return (
      <DeploymentLogs
        logs={logs}
        isDeploying={isDeploying}
        projectName={deployedProject.name}
      />
    );

  return (
    <div className="min-h-screen    py-4 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        <div className=" rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold  mb-2">
              Deploy New Project
            </h1>
            <p className="text-sm sm:text-base ">
              Configure your deployment settings
            </p>
          </div>

          {isSubmitted && (
            <div className="mb-6 p-3 sm:p-4 bg-green-500 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2
                className="text-green-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <span className="text-sm sm:text-base text-green-800 font-medium">
                Project configured successfully!
              </span>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <span className="text-sm sm:text-base text-red-800 font-medium">
                {errors.submit}
              </span>
            </div>
          )}

          {/* Repository Information */}
          <div className="mb-6  p-4 sm:p-5 rounded-lg border border-muted text-primary ">
            <h2 className="text-base sm:text-lg font-semibold  mb-4 flex items-center gap-2">
              <Info size={18} className="flex-shrink-0" />
              Repository Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium  mb-1">
                  Project Name
                </label>
                <p className="text-sm sm:text-base  font-medium break-words">
                  {deployedProject.name}
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium  mb-1">
                  Clone URL
                </label>
                <p className="text-xs sm:text-sm  font-mono break-all">
                  {deployedProject.clone_url}
                </p>
              </div>
              {deployedProject.description && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium  mb-1">
                    Description
                  </label>
                  <p className="text-sm sm:text-base  break-words">
                    {deployedProject.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {/* Project Type Selection */}
            <div>
              <label className="block text-sm sm:text-base font-semibold  mb-3">
                Project Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {PROJECT_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    onClick={() => handleInputChange("projectType", type.value)}
                    className={`p-3 h-[100px] sm:p-4 rounded-lg border-2 text-left transition-all flex items-center justify-center flex-col ${
                      formData.projectType === type.value
                        ? "border-blue-500 bg-card shadow-md text-primary duration-300 hover:bg-muted cursor-pointer"
                        : " hover:bg-muted cursor-pointer duration-300  hover:shadow-sm text-primary bg-card"
                    }`}
                  >
                    <div className="flex justify-center items-center gap-2 font-semibold text-sm sm:text-base ">
                      <img
                        src={type.image}
                        width={20}
                        height={20}
                        alt={type.value}
                      />
                      <span>{type.label}</span>
                    </div>
                    <div className="text-xs sm:text-sm  mt-1 leading-snug">
                      {type.description}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Package Manager - Hide for static sites */}
            {formData.projectType !== "static" && (
              <>
                <div>
                  <label className="block text-sm sm:text-base font-semibold  mb-2">
                    Package Manager <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.packageManager}
                    onChange={(e) =>
                      handleInputChange("packageManager", e.target.value)
                    }
                    className="w-full px-3 sm:px-4 py-2 appearance-none rounded-lg bg-card border border-muted hover:bg-card transition  text-sm sm:text-base cursor-pointer"
                  >
                    {PACKAGE_MANAGERS.map((pm) => (
                      <option
                        className="cursor-pointer hover:bg-card border border-muted p-2 duration-300"
                        key={pm.value}
                        value={pm.value}
                      >
                        {pm.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TypeScript Checkbox */}
                <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border ">
                  <input
                    type="checkbox"
                    id="typescript"
                    checked={formData.typescript}
                    onChange={(e) =>
                      handleInputChange("typescript", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="typescript"
                    className="text-sm sm:text-base font-medium text-muted-foreground  cursor-pointer select-none"
                  >
                    This project uses TypeScript
                  </label>
                </div>
              </>
            )}

            {/* Build Script */}
            {currentProjectType.requiresBuildScript && (
              <div>
                <label className="block text-sm sm:text-base font-semibold  mb-2">
                  Build Script <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.buildScript}
                  onChange={(e) =>
                    handleInputChange("buildScript", e.target.value)
                  }
                  className={`w-full px-3 sm:px-4 py-2.5 rounded-lg border text-sm sm:text-base ${
                    errors.buildScript
                      ? "border-red-300 bg-card"
                      : "border-muted"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="npm run build"
                />
                {errors.buildScript && (
                  <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {errors.buildScript}
                  </p>
                )}
              </div>
            )}

            {/* Run Script */}
            {currentProjectType.requiresRunScript && (
              <div>
                <label className="block text-sm sm:text-base font-semibold  mb-2">
                  Run Script <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.runScript}
                  onChange={(e) =>
                    handleInputChange("runScript", e.target.value)
                  }
                  className={`w-full px-3 sm:px-4 py-2.5 rounded-lg border text-sm sm:text-base ${
                    errors.runScript ? "border-red-300 bg-card" : "border-muted"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="npm start"
                />
                {errors.runScript && (
                  <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {errors.runScript}
                  </p>
                )}
              </div>
            )}

            {/* Main Directory */}
            <div>
              <label className="block text-sm sm:text-base font-semibold  mb-2">
                Main Directory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mainDirectory}
                onChange={(e) =>
                  handleInputChange("mainDirectory", e.target.value)
                }
                className={`w-full px-3 sm:px-4 py-2.5 rounded-lg border text-sm sm:text-base ${
                  errors.mainDirectory
                    ? "border-red-300 bg-card"
                    : "border-muted"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                placeholder="./"
              />
              <p className="mt-1.5 text-xs sm:text-sm ">
                Root directory of your project (e.g., ./ or ./app)
              </p>
              {errors.mainDirectory && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errors.mainDirectory}
                </p>
              )}
            </div>

            {/* Environment Variables */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <label className="block text-sm sm:text-base font-semibold ">
                  Environment Variables
                </label>
                <Button
                  onClick={addEnvVar}
                  disabled={!canAddEnvVar()}
                  variant={"default"}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition ${
                    canAddEnvVar()
                      ? " border hover:opacity-65 duration-300 cursor-pointer"
                      : "  border  cursor-not-allowed"
                  }`}
                  title={
                    !canAddEnvVar()
                      ? "Fill in the current environment variable before adding a new one"
                      : ""
                  }
                >
                  <Plus size={16} />
                  Add Variable
                </Button>
              </div>

              {formData.envVars.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg ">
                  <p className=" text-sm sm:text-base font-medium">
                    No environment variables added yet
                  </p>
                  <p className=" text-xs sm:text-sm mt-1">
                    Click "Add Variable" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.envVars.map((env, index) => (
                    <div key={env.id}>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={env.key}
                          onChange={(e) =>
                            updateEnvVar(env.id, "key", e.target.value)
                          }
                          className="flex-1 px-3 sm:px-4 py-2.5 rounded-lg border  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base font-mono border-muted"
                          placeholder="KEY"
                        />
                        <div className="flex-1 relative">
                          <input
                            type={env.isVisible ? "text" : "password"}
                            value={env.value}
                            onChange={(e) =>
                              updateEnvVar(env.id, "value", e.target.value)
                            }
                            className="w-full px-3 sm:px-4 py-2.5 pr-10 rounded-lg border  border-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base font-mono"
                            placeholder="value"
                          />
                          <Button
                            onClick={() => toggleEnvVisibility(env.id)}
                            variant={"outline"}
                            className="border border-muted absolute right-2 top-1/2 -translate-y-1/2 p-1.5  hover:opacity-65 transition duration-300 "
                            aria-label={
                              env.isVisible ? "Hide value" : "Show value"
                            }
                          >
                            {env.isVisible ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                        <Button
                          onClick={() => removeEnvVar(env.id)}
                          variant={"destructive"}
                          className="text-sm"
                          title="Remove variable"
                          aria-label="Remove environment variable"
                        >
                          <Trash2 size={18} className="mx-auto sm:mx-0" />
                        </Button>
                      </div>
                      {errors[`envKey_${index}`] && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={12} className="flex-shrink-0" />
                          {errors[`envKey_${index}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.envVars.length > 0 && !canAddEnvVar() && (
                <p className="mt-2 text-xs sm:text-sm text-amber-600 flex items-center gap-1 bg-card my-2 p-3 rounded-lg border border-amber-200">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  Fill in both key and value to add another environment variable
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                variant={"default"}
                onClick={handleSubmit}
                disabled={isDeploying}
                className={`w-full py-2  transition shadow-sm font-semibold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer duration-300 ${
                  isDeploying
                    ? " cursor-not-allowed"
                    : " hover:bg-accent hover:text-primary cursor-pointer hover:shadow-xl "
                } `}
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Deploying...
                  </>
                ) : (
                  "Deploy Project"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentProjectForm;
