import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Settings,
  GitBranch,
  Server,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "@/components/ui/spinner";
import ErrorMessage from "@/components/ui/error";
import { useDeploy } from "@/context/deploy/DeployContext";
import { useProject } from "@/context/projects/ProjectsContext";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export interface IProject {
  _id: string;
  name: string;
  port: number;
  description: string;
  clone_url: string;
  run_script?: string;
  build_script?: string;
  main_directory: string;
  envVars: string;
  entry_file: string;
  typescript: boolean;
  type: "react" | "nest" | "express" | "next" | "static";
  status?: "pending" | "canceled" | "active";
  signal?: string;
  params?: Record<string, any>;
  command?: string;
  userId?: string;
  url: string;
}

interface ProjectsPageProps {
  projects?: IProject[];
  onActionClick?: (action: string, projectId: string) => void;
  onDeployNew?: () => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onActionClick }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);
  const [error, setErrors] = useState<string | null>(null);

  const getDeployedProjectsList = async () => {
    try {
      setLoading(true);
      setErrors(null);
      const response = await fetch(`${BASE_URL}/project`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const projects = await response.json();
      setProjects(projects.data);
    } catch (error) {
      setErrors(`${(error as Error).message}, ${(error as Error).name}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDeployedProjectsList();
  }, []);

  const getStatusBadge = (status?: IProject["status"]) => {
    const statusConfig = {
      active: {
        variant: "default" as const,
        label: "Active",
        className: "bg-green-700 text-zinc-100 border border-green-600",
      },
      pending: {
        variant: "secondary" as const,
        label: "Pending",
        className: "bg-zinc-700 text-gray-200 border border-gray-600",
      },
      canceled: {
        variant: "destructive" as const,
        label: "Canceled",
        className: "bg-rose-600 text-rose-200 border border-rose-600",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={config.className} variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) return <Spinner size="2xl" />;

  if (error) return <ErrorMessage message={error} />;

  const getTypeBadge = (type: IProject["type"]) => {
    const typeColors: Record<IProject["type"], string> = {
      react: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      nest: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      express:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      next: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      static: "bg-gray-100  dark:bg-gray-900 dark:",
    };

    return (
      <Badge variant="outline" className={typeColors[type]}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const {
    deleteProject,
    restartServer,
    stopServer,
    deleting,
    restarting,
    stopping,
  } = useProject();
  const handleAction = async (action: string, projectId: string) => {
    if (onActionClick) {
      onActionClick(action, projectId);
    } else {
      console.log(`Action: ${action} on project ${projectId}`);
      // TODO: Implement API calls here
      // Example:
      switch (action) {
        case "restart":
          await restartServer(projectId);
          break;
        case "stop":
          console.log("await api.stopProject(projectId);");
          await stopServer(projectId);
          break;
        case "settings":
          navigate(`/project/${projectId}`);
          break;
        case "delete":
          await deleteProject(projectId);
          break;
      }
    }
  };

  const activeCount = projects.filter((p) => p.status === "active").length;
  const issueCount = projects.filter(
    (p) => p.status === "canceled" || p.status === "pending"
  ).length;

  return (
    <div className="container mx-auto my-20 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Deployed Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your deployed applications
          </p>
        </div>

        <Button
          onClick={() => navigate("/user")}
          className="cursor-pointer hover:opacity-65 duration-300 text-sm "
          variant={"outline"}
        >
          <Server className="h-4 w-4" />
          Deploy New Project
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3  rounded-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all environments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Needs Attention
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending or stopped
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none">
        <CardHeader className="mx-0 px-0">
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            A comprehensive view of all your deployed applications
          </CardDescription>
        </CardHeader>
        <CardContent className="mx-0 px-0  rounded-md">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className=" border-b-muted bg-accent ">
                  <TableHead className="w-[250px]">Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Tech</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No projects deployed yet. Deploy your first project to get
                      started.
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow
                      className="border border-t border-b border-r-0 border-l-0 border-muted"
                      key={project._id}
                    >
                      {/* Project Name & Description */}
                      <TableCell className="">
                        <div className="flex flex-col">
                          <Link
                            to={`/project/${project._id}`}
                            className="font-medium hover:underline hover:opacity-70 duration-300"
                          >
                            {project.name}
                          </Link>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                        </div>
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell>{getTypeBadge(project.type)}</TableCell>

                      {/* Status Badge */}
                      <TableCell>{getStatusBadge(project.status)}</TableCell>

                      {/* Port Number */}
                      <TableCell className="font-mono text-sm">
                        {project.port}
                      </TableCell>

                      {/* Technology Indicators */}
                      <TableCell>
                        <div className="flex gap-2">
                          {project.typescript && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-600 text-white"
                            >
                              TS
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          <span className="text-sm truncate max-w-[150px]">
                            {project.url.replace(/https?:\/\//, "")}
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </TableCell>

                      {/* Actions Dropdown */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => window.open(project.url, "_blank")}
                              className="cursor-pointer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Live
                            </DropdownMenuItem>

                            <>
                              {project.type === "express" ||
                                project.type === "nest" ||
                                (project.type === "next" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleAction("restart", project._id)
                                      }
                                      className="cursor-pointer"
                                      disabled={project.status === "pending"}
                                    >
                                      <Play className="mr-2 h-4 w-4" />
                                      Restart
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleAction("stop", project._id)
                                      }
                                      className="cursor-pointer"
                                      disabled={project.status !== "active"}
                                    >
                                      <Pause className="mr-2 h-4 w-4" />
                                      Stop
                                    </DropdownMenuItem>
                                  </>
                                ))}
                            </>

                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("settings", project._id)
                              }
                              className="cursor-pointer"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                window.open(project.clone_url, "_blank")
                              }
                              className="cursor-pointer"
                            >
                              <GitBranch className="mr-2 h-4 w-4" />
                              View Repository
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => deleteProject(project._id)}
                              className="cursor-pointer text-secondary focus:text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                            >
                              {deleting ? (
                                <div className="flex items-center gap-2 text-primary hover:text-destructive">
                                  <Loader2 className="animate-spin" size={10} />{" "}
                                  Deleting....
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-primary hover:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Project
                                </div>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsPage;
