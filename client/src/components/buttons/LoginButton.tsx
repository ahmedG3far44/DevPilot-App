import type { ReactNode } from "react";
import { Link } from "react-router-dom";

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
    <Link
      to={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}`}
      className={`${className}`}
    >
      {children}
    </Link>
  );
};

export default LoginButton;
