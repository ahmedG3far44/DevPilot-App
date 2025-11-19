import React, { useEffect, useRef } from "react";

import { Loader2 } from "lucide-react";

interface DeploymentLogsProps {
  logs: string[];
  isDeploying: boolean;
  projectName?: string;
}

const DeploymentLogs: React.FC<DeploymentLogsProps> = ({
  logs,
  isDeploying,
  projectName = "my-awesome-app",
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const getLogIcon = (line: string) => {
    if (
      line.includes("successfully") ||
      line.includes("completed") ||
      line.includes("✓")
    ) {
      return "✓";
    }
    if (line.includes("Deployed") || line.includes("🚀")) {
      return "🚀";
    }
    return "✓";
  };

  const getLogColor = (line: string) => {
    if (line.includes("successfully") || line.includes("completed")) {
      return "text-green-600";
    }
    if (line.includes("Deployed")) {
      return "text-purple-600";
    }
    return "text-emerald-600";
  };

  return (
    <div className={`min-h-screen py-4 sm:py-6 px-3 sm:px-4`}>
      <div className="max-w-4xl mx-auto  rounded-md border-muted border-2 mt-10">
        <div
          className={`rounded-xl shadow-2xl overflow-hidden bg-card  `}
        >
          <div
            className={`px-4 py-3 flex items-center gap-3  bg-card border-b border-muted`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div
            ref={logsContainerRef}
            className={`p-6 max-h-[70vh] overflow-y-auto font-mono text-sm bg-card`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "bg-background bg-muted",
            }}
          >
            {/* Command prompt */}
            <div className="mb-4">
              <div className={`flex items-center gap-2 "text-green-600`}>
                <span>$</span>
                <span className={"text-blue-500"}>vibe deploy</span>
                <span>{projectName}</span>
              </div>
            </div>

            {/* Logs */}
            <div className="space-y-1">
              {logs.map((line, i) => (
                <div key={i} className="flex items-start gap-3 py-0.5">
                  <span className={`flex-shrink-0 ${getLogColor(line)}`}>
                    {getLogIcon(line)}
                  </span>
                  <span className={getLogColor(line)}>{line}</span>
                </div>
              ))}

              {isDeploying && (
                <div
                  className={`flex items-center gap-3 py-0.5 text-violet-500
                  `}
                >
                  <Loader2 className="animate-spin flex-shrink-0" size={14} />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentLogs;
