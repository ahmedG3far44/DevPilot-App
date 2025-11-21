import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import { FolderOpenDot, GitBranch, Logs } from "lucide-react";

import Logo from "./Logo";
import LoginButton from "./buttons/LoginButton";
import LogoutButton from "./buttons/LogoutButton";
import { ModeToggle } from "./mode-toggle";

export const Header = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigations = [
    {
      id: "1",
      path: "/user",
      name: "Repos",
      icon: <GitBranch size={20} />,
    },
    {
      id: "2",
      path: "/projects",
      name: "Projects",
      icon: <FolderOpenDot size={20} />,
    },
    {
      id: "3",
      path: "/project/namd",
      name: "Logs",
      icon: <Logs size={20} />,
    },
  ];
  return (
    <div className="m-auto z-50 ">
      <div className="flex items-center justify-between">
        <Logo />
        <>
          {isAuthenticated ? (
            <div>
              {!loading && (
                <div className="flex items-center gap-4 justify-center">
                  <nav className="mr-10 flex items-center justify-center gap-8">
                    {navigations.map((link) => {
                      return (
                        <li
                          key={link.id}
                          className="flex items-center gap-2 hover:text-muted-foreground duration-300 cursor-pointer "
                        >
                          <span>{link.icon}</span>{" "}
                          <Link to={link.path}>{link.name}</Link>
                        </li>
                      );
                    })}
                  </nav>
                  <User
                    picture={user?.avatar_url as string}
                    name={user?.name as string}
                  />
                  <ModeToggle />
                  <LogoutButton />
                </div>
              )}
            </div>
          ) : (
            <LoginButton>Login</LoginButton>
          )}
        </>
      </div>
    </div>
  );
};

export const User = ({ picture, name }: { picture: string; name: string }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-8 h-8 flex items-center justify-center rounded-full   ">
        <img
          className="w-full h-full rounded-full overflow-hidden object-cover"
          src={picture}
          alt={name}
        />
      </div>
      <Link className="text-sm  hover:opacity-65 duration-300" to={"/user"}>
        {name}
      </Link>
    </div>
  );
};
