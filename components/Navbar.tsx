"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <nav className="w-full bg-blue-600 text-white flex justify-between items-center px-6 py-3 shadow-md">
      <h1
        className="font-semibold text-xl cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        SlotSwapper
      </h1>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <button
          onClick={() => router.push("/marketplace")}
          className="hover:underline cursor-pointer"
        >
          Marketplace
        </button>
        <button
          onClick={() => router.push("/requests")}
          className="hover:underline cursor-pointer"
        >
          My Requests
        </button>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-1 rounded-md hover:bg-blue-50 transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}