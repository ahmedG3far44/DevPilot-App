import { useEffect, useState, type FC, type PropsWithChildren } from "react";
import { ProjectsContext } from "./ProjectsContext";
import type { ProjectData } from "@/components/project/ProjectMonitor";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

const ProjectsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjectsList] = useState<ProjectData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [redeploying, setRedeploying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingEnv, setUpdatingEnv] = useState(false);

  const getProjectsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/project`, {
        credentials: "include",
      });
      const results = await response.json();
      setProjectsList(results.data);
    } catch (err) {
      setError((err as Error).message);
      console.log(
        (err as Error).name,
        (err as Error).message,
        (err as Error).stack
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjectsList();
  }, []);

  const startServer = async (projectId: string) => {
    try {
      setStarting(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/project/${projectId}/start`, {
        method: "POST",
        credentials: "include",
      });
      const results = await response.json();

      console.log(results.data);
    } catch (err) {
      setError((err as Error).message);
      console.log(
        (err as Error).name,
        (err as Error).message,
        (err as Error).stack
      );
    } finally {
      setStarting(false);
    }
  };

  const stopServer = async (projectId: string) => {
    try {
      setStopping(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/project/${projectId}/stop`, {
        method: "POST",
        credentials: "include",
      });
      const results = await response.json();

      console.log(results.data);
    } catch (err) {
      setError((err as Error).message);
      console.log(
        (err as Error).name,
        (err as Error).message,
        (err as Error).stack
      );
    } finally {
      setStopping(false);
    }
  };

  const restartServer = async (projectId: string) => {
    try {
      setRestarting(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/project/${projectId}/restart`, {
        credentials: "include",
      });
      const results = await response.json();
      setProjectsList(results.data);
    } catch (err) {
      setError((err as Error).message);
      console.log(
        (err as Error).name,
        (err as Error).message,
        (err as Error).stack
      );
    } finally {
      setRestarting(false);
    }
  };
  const deleteProject = async (projectId: string) => {
    try {
      setDeleting(true);
      setError(null);
      console.log("start deleting...");
      const response = await fetch(`${BASE_URL}/project/${projectId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      const results = await response.json();

      console.log(results.data);
    } catch (err) {
      setError((err as Error).message);
      console.log(
        (err as Error).name,
        (err as Error).message,
        (err as Error).stack
      );
    } finally {
      setDeleting(false);
    }
  };
  const redeploy = async (projectId: string) => {
    try {
      setRedeploying(true);
      setError(null);
      const response = await fetch(
        `${BASE_URL}/project/${projectId}/redeploy`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const results = await response.json();

      console.log(results.data);
    } catch (err) {
      setError((err as Error).message);
      console.log(
        (err as Error).name,
        (err as Error).message,
        (err as Error).stack
      );
    } finally {
      setRedeploying(false);
    }
  };
  const streamLogs = async (projectId: string) => {
    try {
      setRedeploying(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/project/${projectId}/logs`, {
        method: "POST",
        credentials: "include",
      });
      const results = await response.json();
      setProjectsList(results.data);
    } catch (err) {
      setError((err as Error).message);
      console.log(
        (err as Error).name,
        (err as Error).message,
        (err as Error).stack
      );
    } finally {
      setRedeploying(false);
    }
  };
  return (
    <ProjectsContext.Provider
      value={{
        projects,
        project,
        setLogs: () => {},
        logs,
        redeploying,
        restarting,
        starting,
        stopping,
        deleting,
        loading,
        redeploy,
        deleteProject,
        restartServer,
        startServer,
        stopServer,
        streamLogs,
        error,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsProvider;
