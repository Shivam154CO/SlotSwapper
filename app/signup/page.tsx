"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  AlertCircle,
  Building2,
  Key,
  Users,
  ChevronRight,
  Search
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "details">("type");
  const [signupType, setSignupType] = useState<"create" | "join" | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    organizationKey: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type: "create" | "join") => {
    setSignupType(type);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Clean up payload based on type
      const payload: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        timezone
      };

      if (signupType === "create") {
        payload.organizationName = form.organizationName;
      } else {
        payload.organizationKey = form.organizationKey;
      }

      const res = await api.post("/auth/signup", payload);

      if (res && (res.success || res.accessToken || res.token)) {
        localStorage.setItem("token", res.accessToken || res.token);
        if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("userId", res.user?._id);
        localStorage.setItem("userEmail", res.user?.email);
        localStorage.setItem("userName", res.user?.name);
        router.push("/dashboard");
      } else {
        throw new Error(res.msg || res.message || "Signup failed");
      }

    } catch (err: any) {
      setError(err.response?.msg || err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
              <ChevronRight className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SlotSwapper</span>
          </div>

          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Enterprise-grade <br />
            <span className="text-blue-200">Scheduling.</span>
          </h2>
          <p className="text-blue-100 text-lg max-w-md">
            Join thousands of teams optimizing their workflow through intelligent, multi-tenant slot management.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 text-white/80">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <Building2 className="w-6 h-6 mb-2 text-blue-200" />
            <p className="text-sm font-bold">Multi-Tenant</p>
            <p className="text-xs opacity-60">Isolated & Secure</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <Lock className="w-6 h-6 mb-2 text-blue-200" />
            <p className="text-sm font-bold">RBAC Ready</p>
            <p className="text-xs opacity-60">Custom Roles</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50 lg:bg-white">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            {step === "type" ? (
              <motion.div
                key="step-type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Join SlotSwapper</h1>
                  <p className="text-gray-500">How would you like to start?</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handleTypeSelect("create")}
                    className="w-full p-6 text-left rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:shadow-xl transition-all group flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Create a Workspace</h3>
                      <p className="text-sm text-gray-400">Register a new company and invite your team.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTypeSelect("join")}
                    className="w-full p-6 text-left rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:shadow-xl transition-all group flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Join an Existing Team</h3>
                      <p className="text-sm text-gray-400">Enter a unique organization key to join your team.</p>
                    </div>
                    <Search className="w-5 h-5 ml-auto text-gray-300 group-hover:text-indigo-500 self-center" />
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account? <a href="/login" className="text-blue-600 font-bold">Sign In</a>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button
                  onClick={() => setStep("type")}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {signupType === "create" ? "Register Workspace" : "Join Your Team"}
                  </h1>
                  <p className="text-gray-500">Enter your professional details below.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">NAME</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">KEY CODE</label>
                      {signupType === "join" ? (
                        <input
                          type="text"
                          name="organizationKey"
                          value={form.organizationKey}
                          onChange={handleChange}
                          placeholder="A1B2C3D4"
                          className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono uppercase"
                          required
                        />
                      ) : (
                        <input
                          type="text"
                          name="organizationName"
                          value={form.organizationName}
                          onChange={handleChange}
                          placeholder="Company Name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">BUSINESS EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">SECURE PASSWORD</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    {signupType === "create" ? "Create Workspace" : "Join Workspace"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);