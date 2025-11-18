import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout()
      .then(() => {
        return navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <button
      disabled={loading}
      onClick={handleLogout}
      className="px-4 py-1 rounded-md  border text-violet-500 border-violet-700 cursor-pointer hover:opacity-65 duration-300"
    >
      {loading ? "logging out..." : "logout"}
    </button>
  );
};

export default LogoutButton;
