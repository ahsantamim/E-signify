"use client";
import { TemplatesContent } from "@/components/dashboard/content/TemplatesContent";
import { TemplatesSidebar } from "@/components/dashboard/sidebars/TemplatesSidebar";
import { useState } from "react";

export default function Templates() {
  const [activeView, setActiveView] = useState("My Template");

  return (
    <div className="flex h-full w-full">
      <TemplatesSidebar onViewChange={setActiveView} activeView={activeView} />
      <main className="flex-1 bg-white scrollable-content">
        <TemplatesContent activeView={activeView} />
      </main>
    </div>
  );
}
