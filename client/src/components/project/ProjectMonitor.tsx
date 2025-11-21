import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Server,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Globe,
  Terminal,
  Zap,
  Database,
  Play,
  Square,
  Trash2,
  Settings,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../ui/error";
import Spinner from "../ui/spinner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export interface EnvVariable {
  key: string;
  value: string;
  visible?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface TrafficData {
  time: string;
  requests: number;
  responseTime: number;
}

export interface ProjectData {
  id: string;
  name: string;
  clone_url: string;
  run_script: string;
  build_script: string;
  port: number | string;
  main_dir: string;
  type: "static" | "server";
  typescript: boolean;
  envVars: Record<string, string>;
  status: "active" | "inactive" | "deploying" | "error";
  url?: string;
  username?: string;
  pkg?: string;
  params?: {
    name: string;
    repo: string;
    type: string;
    pkg: string;
    main_dir: string;
    envVars: string;
    run_script: string;
    typescript: boolean;
    build_script: string;
  };
}

const generateMockTrafficData = (): TrafficData[] => {
  const data: TrafficData[] = [];
  const now = new Date();
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000);
    data.push({
      time: `${time.getHours()}:${time
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      requests: Math.floor(Math.random() * 300) + 200,
      responseTime: Math.floor(Math.random() * 50) + 30,
    });
  }
  return data;
};

const generateMockLogs = (): LogEntry[] => {
  const messages = [
    "Server started successfully",
    "Database connection established",
    "GET /api/users - 200 OK (45ms)",
    "POST /api/auth/login - 200 OK (123ms)",
    "Cache cleared successfully",
    "WebSocket connection established",
  ];
  const levels: Array<"info" | "warn" | "error" | "debug"> = [
    "info",
    "warn",
    "error",
    "debug",
  ];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `log_${i}`,
    timestamp: new Date(Date.now() - (20 - i) * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
  }));
};

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

const ProjectMonitor: React.FC = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(generateMockLogs());
  const [trafficData, setTrafficData] = useState<TrafficData[]>(
    generateMockTrafficData()
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);

  const [showEnvModal, setShowEnvModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

  const [redeploying, setRedeploying] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingEnv, setUpdatingEnv] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/project/${projectId}`, {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      const result = await response.json();
      const projectData = result.data;

      setProject(projectData);

      if (projectData.envVars) {
        const envArray = Object.entries(projectData.envVars).map(
          ([key, value]) => ({
            key,
            value: value as string,
            visible: false,
          })
        );
        setEnvVars(envArray);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (project?.type !== "server") return;

    try {
      const response = await fetch(`${BASE_URL}/project/${projectId}/logs`, {
        credentials: "include",
        method: "GET",
      });

      if (response.ok) {
        const result = await response.json();
        setLogs(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const handleRedeploy = async () => {
    try {
      setRedeploying(true);
      const response = await fetch(
        `${BASE_URL}/project/${projectId}/redeploy`,
        {
          credentials: "include",
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to redeploy project");
      }

      alert("Project redeployment initiated successfully!");
      await fetchProjectData();
    } catch (err) {
      alert(`Redeploy failed: ${(err as Error).message}`);
    } finally {
      setRedeploying(false);
    }
  };

  const handleRestart = async () => {
    if (project?.type !== "server") return;

    try {
      setRestarting(true);
      const response = await fetch(`${BASE_URL}/project/${projectId}/restart`, {
        credentials: "include",
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to restart server");
      }

      alert("Server restarted successfully!");
      await fetchProjectData();
    } catch (err) {
      alert(`Restart failed: ${(err as Error).message}`);
    } finally {
      setRestarting(false);
    }
  };

  const handleStop = async () => {
    if (project?.type !== "server") return;

    try {
      setStopping(true);
      const response = await fetch(`${BASE_URL}/project/${projectId}/stop`, {
        credentials: "include",
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to stop server");
      }

      alert("Server stopped successfully!");
      await fetchProjectData();
    } catch (err) {
      alert(`Stop failed: ${(err as Error).message}`);
    } finally {
      setStopping(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`${BASE_URL}/project/${projectId}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      alert("Project deleted successfully!");

      window.location.href = "/";
    } catch (err) {
      alert(`Delete failed: ${(err as Error).message}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateEnvVars = async () => {
    if (!newEnvKey || !newEnvValue) {
      alert("Please provide both key and value");
      return;
    }

    try {
      setUpdatingEnv(true);

      const updatedEnvVars = {
        ...project?.envVars,
        [newEnvKey]: newEnvValue,
      };

      const response = await fetch(`${BASE_URL}/project/${projectId}/env`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ envVars: updatedEnvVars }),
      });

      if (!response.ok) {
        throw new Error("Failed to update environment variables");
      }

      alert("Environment variables updated successfully!");
      setShowEnvModal(false);
      setNewEnvKey("");
      setNewEnvValue("");
      await fetchProjectData();
    } catch (err) {
      alert(`Update failed: ${(err as Error).message}`);
    } finally {
      setUpdatingEnv(false);
    }
  };

  const handleDeleteEnvVar = async (key: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the environment variable "${key}"?`
      )
    ) {
      return;
    }

    try {
      const updatedEnvVars = { ...project?.envVars };
      delete updatedEnvVars[key];

      const response = await fetch(`${BASE_URL}/project/${projectId}/env`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ envVars: updatedEnvVars }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete environment variable");
      }

      await fetchProjectData();
    } catch (err) {
      alert(`Delete failed: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchProjectData();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, project?.type]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!autoRefresh || !project) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const newTraffic: TrafficData = {
        time: timeStr,
        requests: Math.floor(Math.random() * 300) + 400,
        responseTime: Math.floor(Math.random() * 40) + 60,
      };
      setTrafficData((prev) => [...prev.slice(-9), newTraffic]);

      if (project.type === "server") {
        const messages = [
          "GET /api/health - 200 OK",
          "POST /api/data - 201 Created",
          "Database query executed",
          "Cache hit for session data",
        ];
        const levels: Array<"info" | "warn" | "error" | "debug"> = [
          "info",
          "warn",
          "error",
          "debug",
        ];

        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
          level: levels[Math.floor(Math.random() * levels.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
        };

        setLogs((prev) => [...prev.slice(-50), newLog]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, project]);

  const toggleEnvVisibility = (key: string) => {
    setEnvVars((prev) =>
      prev.map((env) =>
        env.key === key ? { ...env, visible: !env.visible } : env
      )
    );
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-50 border-green-600";
      case "inactive":
        return "bg-card  border-muted";
      case "deploying":
        return "bg-blue-800 text-blue-50 border-blue-600";
      case "error":
        return "bg-red-800 text-red-50 border-red-600";
      default:
        return "bg-blue-800 text-white  border-blue-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="text-green-600" size={20} />;
      case "inactive":
        return <AlertCircle className="" size={20} />;
      case "deploying":
        return <Loader2 className="text-blue-600 animate-spin" size={20} />;
      case "error":
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Server className="" size={20} />;
    }
  };

  const getLogLevelStyle = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-600 bg-blue-50";
      case "warn":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "debug":
        return " ";
      default:
        return " ";
    }
  };

  // Loading state
  if (loading) {
    return <Spinner size="3xl" />;
  }

  // Error state
  if (error || !project) {
    return (
      <ErrorMessage
        message={error || "Something went wrong, reload the page !!"}
      />
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className=" rounded-xl shadow-lg my-14">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 my-4">
                {getStatusIcon(project.status)}
                <h1 className="text-3xl font-bold ">{project.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
                <Badge className="px-3 py-1 rounded-full text-sm font-semibold bg-card text-primary border border-muted ">
                  {project.type}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-sm ">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>Port: {project.port || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={16} />
                  <span>Package: {project.pkg || "N/A"}</span>
                </div>
                {project.url && (
                  <Link
                    to={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-800"
                  >
                    <Globe size={16} />
                    <span>Visit Site</span>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={"default"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 min-w-30 font-medium transition ${
                  autoRefresh
                    ? " cursor-pointer  text-primary bg-green-600"
                    : "  cursor-pointer text-primary bg-secondary "
                }`}
              >
                <RefreshCw
                  size={16}
                  className={autoRefresh ? "animate-spin" : ""}
                />
                {autoRefresh ? "Live" : "Paused"}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={"outline"}
              onClick={handleRedeploy}
              disabled={redeploying || project.status === "deploying"}
              className="flex items-center gap-2 hover:opacity-65 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {redeploying ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Redeploy
            </Button>

            {project.type === "server" && (
              <>
                <Button
                  onClick={handleRestart}
                  disabled={restarting || project.status !== "active"}
                  className="flex items-center gap-2 px-4 py-2  rounded-lg hover:opacity-65 duration-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {restarting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Play size={16} />
                  )}
                  Restart
                </Button>

                <Button
                  variant={"destructive"}
                  onClick={handleStop}
                  disabled={stopping || project.status === "inactive"}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-65 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {stopping ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Square size={16} />
                  )}
                  Stop
                </Button>
              </>
            )}

            <Button
              onClick={() => setShowEnvModal(true)}
              variant={"outline"}
              className="flex items-center gap-2 cursor-pointer hover:opacity-65 transition duration-300"
            >
              <Settings size={16} />
              Manage Env
            </Button>

            <Button
              onClick={() => setShowDeleteModal(true)}
              variant={"destructive"}
              className="flex items-center gap-2 cursor-pointer hover:opacity-65 transition duration-300"
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>

        {/* Metrics (only for server-type) */}
        {project.type === "server" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className=" rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium ">Requests/min</span>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <div className="text-2xl font-bold ">
                {trafficData[trafficData.length - 1]?.requests || 0}
              </div>
              <div className="text-sm text-green-600 mt-1">
                ↑ 12% from last hour
              </div>
            </div>

            <div className=" rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium ">Avg Response</span>
                <Activity className="text-orange-500" size={20} />
              </div>
              <div className="text-2xl font-bold ">
                {trafficData[trafficData.length - 1]?.responseTime || 0}ms
              </div>
              <div className="text-sm text-orange-600 mt-1">
                ↓ 8% from last hour
              </div>
            </div>

            <div className=" rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium ">CPU Usage</span>
                <Zap className="text-blue-500" size={20} />
              </div>
              <div className="text-2xl font-bold ">23.4%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "23.4%" }}
                />
              </div>
            </div>

            <div className=" rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium ">Memory</span>
                <Database className="text-purple-500" size={20} />
              </div>
              <div className="text-2xl font-bold ">456 MB</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: "44.5%" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Traffic Charts (only for server-type) */}
        {project.type === "server" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className=" rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold  mb-4">Request Traffic</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className=" rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold  mb-4">Response Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Project Info & Environment Variables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-muted rounded-md">
          {/* Project Configuration */}
          <div className=" rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="text-muted" size={20} />
              <h2 className="text-lg font-bold ">Project Configuration</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-sm font-medium ">Clone URL</span>
                <span className="text-sm  truncate ml-4 max-w-xs">
                  {project.clone_url}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-sm font-medium ">Main Directory</span>
                <span className="text-sm ">{project.main_dir}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-sm font-medium ">Build Script</span>
                <span className="text-sm   font-mono px-2 py-1 rounded">
                  {project.build_script || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-sm font-medium ">Run Script</span>
                <span className="text-sm   font-mono px-2 py-1 rounded">
                  {project.run_script || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-sm font-medium ">TypeScript</span>
                <span className="text-sm ">
                  {project.typescript ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium ">Type</span>
                <span className="text-sm  capitalize">{project.type}</span>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className=" rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="text-primary" size={20} />
                <h2 className="text-lg font-bold ">Environment Variables</h2>
              </div>
              <button
                onClick={() => setShowEnvModal(true)}
                className="p-2 text-primary hover:bg-muted rounded-lg cursor-pointer transition"
                title="Add Variable"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {envVars.length === 0 ? (
                <div className="text-center py-8 ">
                  <Terminal size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No environment variables configured</p>
                </div>
              ) : (
                envVars.map((env) => (
                  <div
                    key={env.key}
                    className="flex items-center justify-between p-3 rounded-lg  hover:bg-muted cursor-pointer transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium ">{env.key}</div>
                      <div className="text-sm  font-mono truncate">
                        {env.visible
                          ? env.value
                          : "•".repeat(Math.min(env.value.length, 20))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => toggleEnvVisibility(env.key)}
                        className="p-2  hover:opacity-65  cursor-pointerrounded-lg transition"
                        title={env.visible ? "Hide" : "Show"}
                      >
                        {env.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        variant={"default"}
                        onClick={() => copyToClipboard(env.value, env.key)}
                        className="p-2  hover:opacity-65 cursor-pointer rounded-lg transition"
                        title="Copy"
                      >
                        {copiedKey === env.key ? (
                          <CheckCircle2 size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                      <Button
                        variant={"destructive"}
                        onClick={() => handleDeleteEnvVar(env.key)}
                        className="hover:opacity-65  cursor-pointer duration-300 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {project.type === "server" && (
          <div className=" rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="" size={20} />
                <h2 className="text-lg font-bold ">Live Logs</h2>
              </div>
              <div className="flex items-center gap-2 text-sm ">
                <Activity
                  size={16}
                  className={autoRefresh ? "text-green-500" : ""}
                />
                <span>{autoRefresh ? "Streaming" : "Paused"}</span>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-center py-8 ">
                  <Terminal size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No logs available</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-3 mb-2 hover:bg-gray-800 p-2 rounded transition"
                  >
                    <span className=" shrink-0">{log.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${getLogLevelStyle(
                        log.level
                      )}`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                    <span className="">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Environment Variable Modal */}
        {showEnvModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className=" rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold ">Add Environment Variable</h3>
                <Button
                  variant={"default"}
                  onClick={() => {
                    setShowEnvModal(false);
                    setNewEnvKey("");
                    setNewEnvValue("");
                  }}
                  className="p-2  hover: hover:bg-muted cursor-pointer rounded-lg transition"
                >
                  <X size={20} />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium  mb-2">Key</label>
                  <input
                    type="text"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    placeholder="API_KEY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Value
                  </label>
                  <input
                    type="text"
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                    placeholder="your-secret-value"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant={"default"}
                    onClick={() => {
                      setShowEnvModal(false);
                      setNewEnvKey("");
                      setNewEnvValue("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100  rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={"secondary"}
                    onClick={handleUpdateEnvVars}
                    disabled={updatingEnv || !newEnvKey || !newEnvValue}
                    className="flex-1 px-4 py-2 bg-purple-600  rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {updatingEnv ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Variable"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className=" rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold ">Delete Project</h3>
              </div>
              <p className=" mb-6">
                Are you sure you want to delete <strong>{project.name}</strong>?
                This action cannot be undone. All data, deployments, and
                configurations will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-100  rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600  rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMonitor;
