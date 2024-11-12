import Link from 'next/link';
import { useState } from 'react';
import { FaInbox, FaPaperPlane, FaCheck, FaExclamation, FaTrash } from 'react-icons/fa';
import { RiDraftFill } from "react-icons/ri";

interface AgreementsSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AgreementsSidebar({ activeView, onViewChange }: AgreementsSidebarProps) {
  const menuItems = [
    { name: 'Inbox', icon: <FaInbox /> },
    { name: 'Sent', icon: <FaPaperPlane /> },
    { name: 'Completed', icon: <FaCheck /> },
    { name: 'Action Required', icon: <FaExclamation /> },
    {name: 'Drafts', icon: <RiDraftFill/>},
    {name: 'Deleted', icon: <FaTrash />}
  ];

  return (
    <div className="w-64 bg-gray-100 p-4 h-full">
      <Link href="/dashboard/create-template"><button className="w-full bg-[var(--button-color)] text-white py-2 px-4 hover:bg-[var(--button-hover-color)] mb-6">
        Start Now
      </button></Link>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`flex items-center w-full text-left p-2 rounded-md ${
              activeView === item.name
                ? 'bg-gray-300 font-bold'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onViewChange(item.name)}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
}