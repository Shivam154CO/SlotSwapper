"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="text-center max-w-2xl">
        <Image
          src="/slotswap.png"
          alt="SlotSwapper Logo"
          width={100}
          height={100}
          className="mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold text-blue-700 mb-2">
          Welcome to SlotSwapper
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your schedule effortlessly — swap slots, collaborate with others, and stay organized.
        </p>

        <div className="flex justify-center space-x-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      <footer className="absolute bottom-5 text-gray-500 text-sm">
        © {new Date().getFullYear()} SlotSwapper | Smart Scheduling for Everyone
      </footer>
    </main>
  );
}
