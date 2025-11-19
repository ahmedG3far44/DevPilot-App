import { AuthContext } from "./AuthContext";
import { useEffect, useState, type FC, type PropsWithChildren } from "react";
import type { IUser, RepositoryCardData } from "@/types/repository";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(
    JSON.parse(localStorage.getItem("user")!) || null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [repos, setRepos] = useState<RepositoryCardData[]>([]);

  const isAdmin = user?.isAdmin || false;
  const isAuthenticated = user ? true : false;

  const getCurrentUserSesssion = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.authenticated) {
        console.log(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (error) {
      console.log((error as Error).message);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const getReposList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/project/user/repos`, {
        credentials: "include",
      });
      const repos = await response.json();
      setRepos(repos.data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setUser(null);
      }
    } catch (error) {
      console.log((error as Error).message);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUserSesssion();
    getReposList();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        repos,
        loading,
        error,
        isAdmin,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
