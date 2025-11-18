import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to={"/"}
      className="font-black text-center text-3xl my-4 hover:opacity-75 duration-300 "
    >
      <span className="text-violet-500">Dev</span>
      <span className="text-zinc-400">Pilot</span>
    </Link>
  );
};

export default Logo;
