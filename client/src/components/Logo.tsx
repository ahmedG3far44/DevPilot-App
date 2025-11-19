import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to={"/"}
      className="font-black text-center text-3xl my-4 hover:opacity-75 flex justify-center items-center gap-2"
    >
      <img src={"/icon.svg"} width={40} height={40} />
      <h1>
        <span>Dev</span>
        <span>Pilot</span>
      </h1>
    </Link>
  );
};

export default Logo;
