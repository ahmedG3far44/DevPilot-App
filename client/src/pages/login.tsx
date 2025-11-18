// import { useAuth } from "@/context/authContext";
import LoginButton from "@/components/buttons/LoginButton";
import Logo from "@/components/Logo";
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:scale-[1.02]">
          <Logo />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300 text-sm">
              Sign in to continue to your account
            </p>
          </div>

          <LoginButton className="text-white font-semibold ">
            <div className="flex items-center justify-center gap-1 bg-zinc-50/20 hover:bg-zinc-50/30 duration-300 p-2 rounded-md  ">
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </div>
          </LoginButton>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-xs">
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
          <p className="text-gray-400 text-sm">
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
