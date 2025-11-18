import { useState, type FC, type PropsWithChildren } from "react";
import { DeployContext, type DeployBodyType } from "./DeployContext";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

const DeployProvider: FC<PropsWithChildren> = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deploy = async (data: DeployBodyType): Promise<void> => {
    try {
      setLogs([]);
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      //   if (!response.ok) {
      //     throw new Error("");
      //   }

      //   const result = await response.json();

      console.log(" ");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeployContext.Provider value={{ logs, deploy, loading, error }}>
      {children}
    </DeployContext.Provider>
  );
};

export default DeployProvider;
