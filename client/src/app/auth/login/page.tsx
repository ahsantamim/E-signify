"use client"
import LoginForm from "@/components/auth/login";
import React from "react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-12 rounded-sm w-full max-w-lg border border-gray-300">
        <LoginForm />
      </div>
    </div>
  );
}
