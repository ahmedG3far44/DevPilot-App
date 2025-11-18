import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import LoginButton from "./buttons/LoginButton";
import LogoutButton from "./buttons/LogoutButton";
import Logo from "./Logo";

export const Header = () => {
  const { user, isAuthenticated, loading } = useAuth();
  return (
    <div className=" m-auto z-50 ">
      <div className="flex items-center justify-between">
        <Logo />
        <>
          {isAuthenticated ? (
            <div>
              {!loading && (
                <div className="flex items-center gap-4 justify-center">
                  <User
                    picture={user?.avatar_url as string}
                    name={user?.name as string}
                  />
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
      <div className="w-8 h-8 flex items-center justify-center rounded-full  bg-zinc-600 ">
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
