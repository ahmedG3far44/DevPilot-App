import type { ReactNode } from "react";
import { Button } from "../ui/button";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string;

const LoginButton = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const redirectUri = `${BASE_URL}/auth/github/callback`;
  return (
    <Button
      variant={"default"}
      className={`${className} w-full py-1 px-4 text-sm rounded-md shadow-sm text-center cursor-pointer hover:opacity-90 duration-300`}
      onClick={() =>
        window.location.assign(
          `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}`
        )
      }
    >
      {children}
    </Button>
  );
};

export default LoginButton;
