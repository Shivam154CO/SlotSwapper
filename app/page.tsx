"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  RefreshCw,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  Layout,
  ShieldCheck
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading SlotSwapper...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SlotSwapper</span>
            </div>

            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-black transition-all hover:scale-105"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              Enterprise Schedule Optimization
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-tight">
              Schedule Swapping <br />
              <span className="text-blue-600">
                Made Simple.
              </span>
            </h1>

            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop the chaotic email chains. Swap shifts instantly, manage your schedule effortlessly, and collaborate with your team in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
                <ArrowRight className="w-5 h-5" />
              </Link>

              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  View Demo
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: CheckCircle,
              title: "Verified Swapping",
              desc: "Automated verification ensures every swap meets organizational policies."
            },
            {
              icon: Users,
              title: "Team Sync",
              desc: "Keep your entire team aligned with real-time schedule updates and notifications."
            },
            {
              icon: BarChart3,
              title: "Analytics",
              desc: "Track swap history, peak times, and team scheduling patterns."
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Proof / Trust Section */}
      <div className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Trusted by forward-thinking teams
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center bg-white/50 rounded-2xl p-12 backdrop-blur-sm border border-gray-100">
            <div className="text-xl font-bold text-gray-400/80 tracking-tighter flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-400/20 rounded-full" /> STARSHIP
            </div>
            <div className="text-xl font-bold text-gray-400/80 tracking-tighter flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-400/20 rotate-45" /> OCTANE
            </div>
            <div className="text-xl font-bold text-gray-400/80 tracking-tighter flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-400/20 rounded-sm" /> VELOCITY
            </div>
            <div className="text-xl font-bold text-gray-400/80 tracking-tighter flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gray-400/20 rounded-lg" /> QUANTUM
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Features */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything you need to <br />
              <span className="text-blue-600">master your schedule</span>
            </h2>
            <p className="text-lg text-gray-500">
              Powerful features designed to make shift management effortless for everyone on the team.
            </p>

            <div className="space-y-4">
              {[
                "Instant push notifications for swap requests",
                "Calendar integration (Google, Outlook, iCal)",
                "Role-based permissions and approval flows",
                "Automated conflict detection"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 relative overflow-hidden h-[400px] flex items-center justify-center border border-gray-100">
            {/* Simple schematic representation */}
            <div className="relative bg-white rounded-xl shadow-sm p-6 w-3/4 border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-gray-200 rounded" />
                  <div className="h-2 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 w-full bg-blue-50/50 rounded-lg" />
                <div className="h-8 w-full bg-gray-50 rounded-lg" />
                <div className="h-8 w-full bg-gray-50 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white text-xs font-bold">
              S
            </div>
            <span className="font-bold text-gray-900">SlotSwapper</span>
          </div>

          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} SlotSwapper. All rights reserved.
          </div>

          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="#" className="text-gray-400 hover:text-gray-600">Terms</Link>
            <Link href="#" className="text-gray-400 hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}