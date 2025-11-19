import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import HomePage from "./pages/home";
import Dashboard from "./pages/dashboard";
import ProjectMonitor from "./components/project/ProjectMonitor";
import DeploymentProjectForm from "./components/project/DeploymentProjectForm";
import UserPage from "./pages/user";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectsPage from "./pages/projects";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        // protected user routes
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="user" element={<UserPage />} />
          <Route path="deploy/:repoName" element={<DeploymentProjectForm />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="project/:projectId" element={<ProjectMonitor />} />
        </Route>
        // protected admin routes
        <Route path="dashboard" element={<Dashboard />}>
          <Route path="insights" element={<h1>Admin Insights Page </h1>} />
          <Route path="users" element={<h1>Manage Users Page </h1>} />
          <Route path="settings" element={<h1>Settings Page </h1>} />
        </Route>
        <Route path="*" element={<div>404 not found page</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
