import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Server, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  TrendingUp,
  Clock,
  Globe,
  Terminal,
  Zap,
  Database
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface EnvVariable {
  key: string;
  value: string;
  visible: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

interface TrafficData {
  time: string;
  requests: number;
  responseTime: number;
}

interface ProjectData {
  id: string;
  name: string;
  cloneUrl: string;
  description: string;
  port: number;
  runScript: string;
  buildScript: string;
  entryFile: string;
  entryDirectory: string;
  status: 'running' | 'stopped' | 'deploying' | 'error';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  deployedAt: string;
  lastDeployment: string;
}

const ProjectMonitor: React.FC = () => {
  const [project, setProject] = useState<ProjectData>({
    id: 'proj_abc123',
    name: 'my-awesome-app',
    cloneUrl: 'https://github.com/username/my-awesome-app.git',
    description: 'A production-ready SaaS application',
    port: 3000,
    runScript: 'npm start',
    buildScript: 'npm run build',
    entryFile: 'index.js',
    entryDirectory: './src',
    status: 'running',
    uptime: '5d 12h 34m',
    cpuUsage: 23.4,
    memoryUsage: 456.8,
    deployedAt: '2025-10-28 14:32:15',
    lastDeployment: '2 hours ago'
  });

  const [envVars, setEnvVars] = useState<EnvVariable[]>([
    { key: 'DATABASE_URL', value: 'postgresql://user:pass@localhost:5432/db', visible: false },
    { key: 'API_KEY', value: 'sk_live_abc123xyz789def456', visible: false },
    { key: 'NODE_ENV', value: 'production', visible: true },
    { key: 'PORT', value: '3000', visible: true },
    { key: 'JWT_SECRET', value: 'super_secret_jwt_key_12345', visible: false }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '2025-11-02 14:23:45', level: 'info', message: 'Server started on port 3000' },
    { id: '2', timestamp: '2025-11-02 14:23:46', level: 'info', message: 'Database connection established' },
    { id: '3', timestamp: '2025-11-02 14:24:12', level: 'info', message: 'GET /api/users - 200 OK (45ms)' },
    { id: '4', timestamp: '2025-11-02 14:24:18', level: 'warn', message: 'Rate limit approaching for IP 192.168.1.100' },
    { id: '5', timestamp: '2025-11-02 14:24:32', level: 'info', message: 'POST /api/auth/login - 200 OK (123ms)' },
    { id: '6', timestamp: '2025-11-02 14:25:01', level: 'error', message: 'Failed to process payment: Stripe API timeout' },
    { id: '7', timestamp: '2025-11-02 14:25:15', level: 'info', message: 'Cache cleared successfully' },
    { id: '8', timestamp: '2025-11-02 14:25:32', level: 'debug', message: 'Redis connection pool: 5/10 active' }
  ]);

  const [trafficData, setTrafficData] = useState<TrafficData[]>([
    { time: '10:00', requests: 234, responseTime: 45 },
    { time: '10:30', requests: 312, responseTime: 52 },
    { time: '11:00', requests: 289, responseTime: 48 },
    { time: '11:30', requests: 445, responseTime: 67 },
    { time: '12:00', requests: 523, responseTime: 71 },
    { time: '12:30', requests: 498, responseTime: 65 },
    { time: '13:00', requests: 567, responseTime: 78 },
    { time: '13:30', requests: 612, responseTime: 82 },
    { time: '14:00', requests: 689, responseTime: 89 },
    { time: '14:30', requests: 734, responseTime: 95 }
  ]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Simulate real-time log updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const messages = [
        'GET /api/health - 200 OK (12ms)',
        'POST /api/webhook - 200 OK (156ms)',
        'Database query executed in 23ms',
        'Cache hit for key: user_session_xyz',
        'Background job completed: email_notification',
        'WebSocket connection established'
      ];
      
      const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        level: randomLevel,
        message: randomMessage
      };

      setLogs(prev => [...prev.slice(-50), newLog]);

      // Update traffic data
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newTraffic: TrafficData = {
        time: timeStr,
        requests: Math.floor(Math.random() * 300) + 400,
        responseTime: Math.floor(Math.random() * 40) + 60
      };

      setTrafficData(prev => [...prev.slice(-9), newTraffic]);

      // Update CPU and Memory
      setProject(prev => ({
        ...prev,
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(200, Math.min(1000, prev.memoryUsage + (Math.random() - 0.5) * 50))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const toggleEnvVisibility = (key: string) => {
    setEnvVars(prev =>
      prev.map(env =>
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
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'deploying': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLogLevelStyle = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-slate-600 mb-4">{project.description}</p>
              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Uptime: {project.uptime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>Port: {project.port}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  <span>Last deployed: {project.lastDeployment}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">CPU Usage</span>
              <Zap className="text-blue-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{project.cpuUsage.toFixed(1)}%</div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${project.cpuUsage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Memory</span>
              <Database className="text-purple-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{project.memoryUsage.toFixed(0)} MB</div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(project.memoryUsage / 1024) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Requests/min</span>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {trafficData[trafficData.length - 1]?.requests || 0}
            </div>
            <div className="text-sm text-green-600 mt-1">↑ 12% from last hour</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Avg Response</span>
              <Activity className="text-orange-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {trafficData[trafficData.length - 1]?.responseTime || 0}ms
            </div>
            <div className="text-sm text-orange-600 mt-1">↓ 8% from last hour</div>
          </div>
        </div>

        {/* Traffic Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Request Traffic</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
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

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Response Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Info & Environment Variables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Project Configuration</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">Clone URL</span>
                <span className="text-sm text-slate-900 truncate ml-4 max-w-xs">{project.cloneUrl}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">Entry Directory</span>
                <span className="text-sm text-slate-900">{project.entryDirectory}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">Entry File</span>
                <span className="text-sm text-slate-900">{project.entryFile}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">Build Script</span>
                <span className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">
                  {project.buildScript}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">Run Script</span>
                <span className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">
                  {project.runScript}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium text-slate-600">Deployed At</span>
                <span className="text-sm text-slate-900">{project.deployedAt}</span>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="text-purple-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Environment Variables</h2>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {envVars.map((env) => (
                <div
                  key={env.key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{env.key}</div>
                    <div className="text-sm text-slate-600 font-mono truncate">
                      {env.visible ? env.value : '•'.repeat(env.value.length)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleEnvVisibility(env.key)}
                      className="p-2 hover:bg-slate-200 rounded-lg transition"
                      title={env.visible ? 'Hide' : 'Show'}
                    >
                      {env.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(env.value, env.key)}
                      className="p-2 hover:bg-slate-200 rounded-lg transition"
                      title="Copy"
                    >
                      {copiedKey === env.key ? (
                        <CheckCircle2 size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="text-slate-700" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Live Logs</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Activity size={16} className={autoRefresh ? 'text-green-500' : 'text-gray-400'} />
              <span>{autoRefresh ? 'Streaming' : 'Paused'}</span>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 mb-2 hover:bg-slate-800 p-2 rounded transition">
                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${getLogLevelStyle(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMonitor;