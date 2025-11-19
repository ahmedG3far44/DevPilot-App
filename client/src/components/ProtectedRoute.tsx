import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Header } from "./header";


const ProtectedRoute = () => {

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to={"/login"} />;

  return (
    <div className="lg:w-3/4 mx-auto min-h-screen p-4 lg:p-8">
      <Header />
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;
