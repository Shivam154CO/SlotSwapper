"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("[Frontend] Signup attempt with:", form);

  try {
    const res = await api.post("/auth/signup", form); // ✅ keep this same
    console.log("[Frontend] Signup success:", res.data);
  } catch (err) {
    console.error("[Frontend] Signup error:", err);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-center text-white mb-4">
          Join SlotSwapper
        </h1>

        {error && (
          <div className="bg-red-500/30 p-3 rounded-lg text-red-100 text-sm mb-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/10 text-white rounded-lg outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/10 text-white rounded-lg outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full p-3 bg-white/10 text-white rounded-lg outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-blue-200 mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-purple-300 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
