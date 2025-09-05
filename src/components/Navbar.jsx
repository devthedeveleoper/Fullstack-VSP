"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import useSearchStore from "@/stores/searchStore";
import { useDebounce } from "@/hooks/useDebounce";

const Navbar = () => {
  const { isAuthenticated, user, clearUser } = useAuthStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const setGlobalSearchTerm = useSearchStore((state) => state.setSearchTerm);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  useEffect(() => {
    setGlobalSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setGlobalSearchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    setIsMenuOpen(false);
    router.push("/login");
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Aurahub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative w-72 lg:w-96">
              <input
                type="text"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-full py-2 pl-4 pr-12 focus:outline-none focus:border-blue-500"
                placeholder="Search for videos..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {localSearchTerm && (
                  <button onClick={handleClearSearch} className="p-2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="font-semibold text-gray-600 hover:text-blue-600">Dashboard</Link>
                <Link href="/subscriptions" className="font-semibold text-gray-600 hover:text-blue-600">Subscriptions</Link>
                <Link href="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold whitespace-nowrap">Upload</Link>
                <button onClick={handleLogout} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold">Logout</button>
                {user && (
                  <span className="font-medium text-gray-700 hidden lg:block whitespace-nowrap">
                    Welcome, {user.username}!
                  </span>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-800 hover:text-blue-600 font-semibold">Login</Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold whitespace-nowrap">Sign Up</Link>
              </>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="relative mb-4">
              <input
                type="text"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-full py-2 pl-4 pr-12 focus:outline-none focus:border-blue-500"
                placeholder="Search for videos..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {localSearchTerm && (
                  <button onClick={handleClearSearch} className="p-2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100">Dashboard</Link>
                  <Link href="/my-playlists" className="font-semibold text-gray-600 hover:text-blue-600">My Playlists</Link>
                  <Link href="/subscriptions" onClick={() => setIsMenuOpen(false)} className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100">Subscriptions</Link>
                  <Link href="/upload" onClick={() => setIsMenuOpen(false)} className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100">Upload</Link>
                  <button onClick={handleLogout} className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100">Logout</button>
                  {user && (
                    <span className="py-2 px-2 font-medium text-gray-700">
                      Welcome, {user.username}!
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100">Login</Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;