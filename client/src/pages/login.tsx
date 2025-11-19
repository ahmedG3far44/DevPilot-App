// import { useAuth } from "@/context/authContext";
import LoginButton from "@/components/buttons/LoginButton";
import { Github } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col items-center justify-center gap-1 mb-6">
            <img src="/icon.svg" width={80} height={80} />
            <h1 className="text-xl lg:text-3xl font-bold lg:font-black text-white">
              <span>Dev</span>
              <span>Pilot</span>
            </h1>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className=" text-[10px] lg:text-sm">
              Sign in to continue to your account
            </p>
          </div>

          <LoginButton className="w-full text-white text-sm">
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </LoginButton>

          <div className="mt-8 text-center">
            <p className=" text-xs">
              By continuing, you agree to our{" "}
              <a
                href="#"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Terms of Service
              </a>
            </p>
          </div>
        </div>

        {/* Extra decoration */}
        <div className="text-center mt-6">
          <p className=" text-sm">
            Don't have an account?{" "}
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
