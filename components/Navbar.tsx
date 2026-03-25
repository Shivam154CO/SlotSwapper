"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, ShoppingBag, List, Settings, LogOut, ChevronRight } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("userSession");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (pathname === path) return;
    setIsLoading(true);
    router.push(path);
  };

  const isActiveRoute = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { path: "/requests", label: "My Requests", icon: List },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  if (!mounted) {
    return (
      <nav className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse"></div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-2 group focus:outline-none"
              disabled={isLoading}
              aria-label="Go to dashboard"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-blue-700">
                SlotSwapper
              </span>
            </button>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              <div className="hidden md:flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      disabled={isLoading}
                      className={`
                        relative group flex items-center space-x-2 px-4 py-2 rounded-lg 
                        text-sm font-medium transition-all duration-200
                        focus:outline-none
                        ${active
                          ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg 
                  text-sm font-medium transition-colors
                  text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Loading Bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-100 overflow-hidden">
            <div className="h-full bg-blue-600 w-1/3 animate-[loading_1s_ease-in-out_infinite]"></div>
          </div>
        )}
      </nav>
    </>
  );
}