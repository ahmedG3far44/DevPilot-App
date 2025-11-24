import { useState, type FC, type PropsWithChildren } from "react";
import { DeployContext, type DeployBodyType } from "./DeployContext";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

const DeployProvider: FC<PropsWithChildren> = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async (deployedProjectData: DeployBodyType) => {
    setIsDeploying(true);
    setError(null);
    setLogs(["> Initializing deployment connection..."]);

    try {
      const response = await fetch(`${BASE_URL}/deploy`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deployedProjectData),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }

      // 1. Initialize the reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let projectId = "";
      let redirectUrl = "";

      // 2. Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setLogs((prev) => [...prev, "> Connection closed."]);
          break;
        }

        // 3. Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // 4. Append to buffer and split by new lines
        buffer += chunk;
        const lines = buffer.split("\n");

        // The last item in 'lines' might be incomplete (no newline yet),
        // so we keep it in the buffer for the next chunk.
        buffer = lines.pop() || "";

        // 5. Update state with complete lines
        if (lines.length > 0) {
          setLogs((prev) => [...prev, ...lines]);
        }

        if (buffer.includes("DEPLOY_STATUS:SUCCESS")) {
          // Extract project ID
          const projectIdMatch = buffer.match(/PROJECT_ID:([^\n]+)/);
          if (projectIdMatch) {
            projectId = projectIdMatch[1];
          }

          // Extract redirect URL
          const redirectMatch = buffer.match(/REDIRECT_URL:([^\n]+)/);
          console.log(redirectMatch);
          if (redirectMatch) {
            redirectUrl = redirectMatch[1];
          }
        }
      }

      if (projectId && redirectUrl) {
        window.location.assign(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message);
      setLogs((prev) => [...prev, `> Error: ${err.message}`]);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <DeployContext.Provider value={{ logs, handleDeploy, isDeploying, error }}>
      {children}
    </DeployContext.Provider>
  );
};

export default DeployProvider;

// Define the shape of your project info

// const DeployTerminal: React.FC = () => {
//   const [logs, setLogs] = useState<string[]>([]);
//   const [isDeploying, setIsDeploying] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Ref to auto-scroll to the bottom of the logs
//   const logsEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Auto-scroll whenever logs update
//   useEffect(() => {
//     scrollToBottom();
//   }, [logs]);

//   return (
//     <div className="max-w-2xl mx-auto p-4">
//       <button
//         onClick={handleDeploy}
//         disabled={isDeploying}
//         className={`px-4 py-2 rounded font-bold text-white transition
//           ${
//             isDeploying
//               ? "0 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700"
//           }`}
//       >
//         {isDeploying ? "Deploying..." : "Start Deployment"}
//       </button>

//       {/* Terminal Output Window */}
//       <div className="mt-4 bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700 font-mono text-sm">
//         <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center">
//           <div className="flex space-x-2 mr-4">
//             <div className="w-3 h-3 rounded-full bg-red-500"></div>
//             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//             <div className="w-3 h-3 rounded-full bg-green-500"></div>
//           </div>
//           <span className="">deploy_logs.sh</span>
//         </div>

//         <div className="h-64 overflow-y-auto p-4 text-green-400 space-y-1">
//           {logs.map((line, index) => (
//             // Using index as key is okay here since we only append
//             <div key={index} className="break-all">
//               <span className=" mr-2">$</span>
//               {line}
//             </div>
//           ))}

//           {error && (
//             <div className="text-red-400 font-bold">
//               <span className="mr-2">⚠</span>
//               {error}
//             </div>
//           )}

//           {/* Invisible element to anchor scroll */}
//           <div ref={logsEndRef} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeployTerminal;
