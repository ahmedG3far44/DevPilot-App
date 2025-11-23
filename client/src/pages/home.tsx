import React, { useState, useEffect } from "react";
import {
  Github,
  Rocket,
  Zap,
  Shield,
  BarChart3,
  Terminal,
  ChevronRight,
  Play,
  CheckCircle2,
  Server,
} from "lucide-react";

import { Header } from "@/components/header";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleStart = () => {
    if (isAuthenticated) {
      return navigate("/user");
    } else {
      return navigate("/login");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Github className="w-6 h-6" />,
      title: "GitHub-Native",
      description:
        "Connect directly with your GitHub account. No extra configuration needed.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Deploy in Seconds",
      description:
        "Select a repo, configure once, and deploy. Average time: under 60 seconds.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "Full Control",
      description:
        "Customize build scripts, environment variables, and deployment settings.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description:
        "Watch live logs, track deployments, and monitor your projects' health.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure by Default",
      description:
        "Encrypted tokens, secure environment variables, and HTTPS-only connections.",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Frontend & Backend",
      description:
        "Deploy React, Next.js, Express, NestJS, and more. All in one place.",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const steps = [
    { num: "01", title: "Connect GitHub", desc: "One-click OAuth login" },
    {
      num: "02",
      title: "Select Repository",
      desc: "Browse and choose your project",
    },
    { num: "03", title: "Configure & Deploy", desc: "Set your build settings" },
    { num: "04", title: "Go Live", desc: "Your app is now online" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48"
          style={{
            transform: `translate(${scrollY * 0.2}px, ${scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 -right-48"
          style={{
            transform: `translate(${-scrollY * 0.15}px, ${scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/4"
          style={{
            transform: `translate(${scrollY * 0.1}px, ${-scrollY * 0.2}px)`,
          }}
        />
      </div>
      <div className="lg:w-3/4 mx-auto p-4 lg:p-8">
        <Header />
      </div>
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div
          className={`text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">
              Deploy your GitHub repos in seconds
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            GitHub-Powered
            <br />
            Deployments
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            The simplest way to deploy your repositories. Connect your GitHub
            account and go live in minutes.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2 group"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center gap-3">
                <span className="text-slate-500">$</span>
                <span className="text-green-400">vibe deploy</span>
                <span className="text-slate-400">my-awesome-app</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-400">
                  Repository cloned successfully
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-400">Dependencies installed</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-400">Build completed in 23s</span>
              </div>
              <div className="flex items-center gap-3">
                <Rocket className="w-4 h-4 text-purple-500 animate-bounce" />
                <span className="text-purple-400">
                  Deployed to https://my-awesome-app.vibe.app
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-slate-400">
            Powerful features that make deployment effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:-translate-y-2"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Deploy in 4 simple steps
          </h2>
          <p className="text-xl text-slate-400">
            From zero to production in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
              )}
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 font-bold text-2xl">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-center">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-12">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                &lt;60s
              </div>
              <div className="text-slate-400">Average Deploy Time</div>
            </div>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                95%
              </div>
              <div className="text-slate-400">Success Rate</div>
            </div>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                99%
              </div>
              <div className="text-slate-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to ship faster?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join developers who trust Vibe for seamless GitHub deployments
          </p>
          <button
            onClick={handleStart}
            className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition flex items-center gap-3 mx-auto group"
          >
            <Github className="w-6 h-6" />
            Start Deploying Now
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>
      <footer className="relative z-10 border-t border-slate-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} DevPilot. Built for developers who
              ship fast.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
