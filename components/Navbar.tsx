"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
    { path: "/dashboard", label: "Dashboard"},
    { path: "/marketplace", label: "Marketplace"},
    { path: "/requests", label: "My Requests"},
  ];

  if (!mounted) {
    return (
      <nav className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="h-6 w-28 bg-white/20 rounded animate-pulse"></div>
            <div className="flex space-x-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-20 bg-white/20 rounded animate-pulse"></div>
              ))}
              <div className="h-8 w-20 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3">
            {/* Logo/Brand */}
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-2 group focus:outline-none"
              disabled={isLoading}
              aria-label="Go to dashboard"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-lg">🔄</span>
              </div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                SlotSwapper
              </h1>
            </button>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  disabled={isLoading}
                  className={`
                    relative group flex items-center space-x-2 px-3 py-2 rounded-lg 
                    text-sm font-medium transition-all duration-200 min-w-[100px] justify-center
                    focus:outline-none focus:ring-1 focus:ring-white
                    ${
                      isActiveRoute(item.path)
                        ? "bg-white text-blue-700 shadow-md"
                        : "text-blue-100 hover:bg-white/20 hover:text-white"
                    }
                    ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  aria-current={isActiveRoute(item.path) ? "page" : undefined}
                >
                  <span className="text-base"></span>
                  <span>{item.label}</span>
                  
                  {isActiveRoute(item.path) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              ))}

              {/* Separator */}
              <div className="h-6 w-px bg-white/30 mx-1"></div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`
                  relative flex items-center space-x-2 px-3 py-2 rounded-lg 
                  text-sm font-medium transition-all duration-200 min-w-[90px] justify-center
                  focus:outline-none focus:ring-1 focus:ring-red-400
                  bg-red-500 hover:bg-red-600 text-white
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                aria-label={isLoading ? "Logging out..." : "Logout"}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>...</span>
                  </div>
                ) : (
                  <>
            
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Bar */}
        {isLoading && (
          <div className="w-full h-0.5 bg-blue-400 overflow-hidden">
            <div className="h-full bg-white animate-pulse"></div>
          </div>
        )}
      </nav>
    </>
  );
}