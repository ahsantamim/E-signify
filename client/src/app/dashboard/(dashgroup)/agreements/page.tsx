"use client";
import { AgreementsContent } from '@/components/dashboard/content/AgreementsContent';
import { AgreementsSidebar } from '@/components/dashboard/sidebars/AgreementsSidebar';
import { useState } from 'react';

export default function Agreements() {
  const [activeView, setActiveView] = useState('Inbox');

  return (
    <div className="flex h-full w-full">
      <AgreementsSidebar onViewChange={setActiveView} activeView={activeView} />
      <main className="flex-1 bg-white scrollable-content">
        <AgreementsContent activeView={activeView} />
      </main>
    </div>
  );
}