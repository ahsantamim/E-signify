"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function ActionNav() {
  const router = useRouter();
  const cancel = () => {
    router.push("/dashboard/dash-templates");
  };
  return (
    <div className="fixed top-0 left-0 w-full h-14 bg-white border-b px-4 py-3 shadow-md z-10">
      <div className="mx-auto flex justify-start mb-2">
        <button
          type="button"
          className="mr-2 px-4 py-2 bg-gray-300 font-bold text-sm rounded-full"
          onClick={cancel}
        >
          X
        </button>
      </div>
    </div>
  );
}
