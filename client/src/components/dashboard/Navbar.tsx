"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../assets/images/logo.png";
import { useUser } from "../context/userContext";

export default function Navbar() {
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Example user data
  const userInitials =
    user && user.firstName && user.lastName
      ? user.firstName.charAt(0) + user.lastName.charAt(0)
      : "";

  // Navigation links with their paths
  const navLinks = [
    { name: "Home", path: "/dashboard" },
    { name: "Agreements", path: "/dashboard/agreements" },
    { name: "Templates", path: "/dashboard/dash-templates" },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Section with Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Image src={logo} alt="DocuClone Logo" width={150} height={50} />
            </Link>
            {/* Links only for logged-in users */}
            {user && (
              <div className="hidden md:flex space-x-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`relative text-gray-600 hover:text-black ml-6 py-2 ${
                      pathname === link.path ? "font-bold" : ""
                    }`}
                  >
                    {link.name}
                    {pathname === link.path && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            {user ? (
              // Profile Section for logged-in users
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center focus:outline-none"
                >
                  <div className="w-10 h-10 bg-gray-400 text-black flex items-center justify-center rounded-full">
                    {userInitials}
                  </div>
                </button>
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <p>
                        <strong>{user?.firstName}</strong>
                      </p>
                      <p className="pt-2 line-clamp-1">{user?.email}</p>
                      <p className="pt-2">Account : {user?.id.slice(0, 6)}</p>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login and Register buttons for logged-out users
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[var(--button-login-color)] text-white font-medium rounded-sm hover:bg-[var(--button-login-hover-color)] px-3 py-2 text-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      isOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              // Show links for logged-in users in mobile view
              navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-600 hover:text-white ${
                    pathname === link.path ? "font-bold bg-gray-100" : ""
                  }`}
                >
                  {link.name}
                  {pathname === link.path && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                  )}
                </Link>
              ))
            ) : (
              // Show Login and Register for logged-out users in mobile view
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-600 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-600 hover:text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
