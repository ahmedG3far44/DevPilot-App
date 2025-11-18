import { Link, Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="w-full min-h-screen flex items-start justify-start gap-2 bg-zinc-400 relative">
      <aside className="w-3/12 min-h-screen p-4 flex flex-col sticky left-0 top-0 z-50 items-start gap-4 justify-start bg-zinc-400">
        <Link to={"/"}>Home</Link>
        <Link to={"/dashboard/insights"}>Insights</Link>
        <Link to={"/dashboard/users"}>Manage Users</Link>
        <Link to={"/dashboard/settings"}>Settings</Link>
      </aside>
      <main className="w-3/4 min-h-screen p-4 bg-zinc-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
