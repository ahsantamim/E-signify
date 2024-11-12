import { useState } from 'react';
import { FaFileAlt, FaShareAlt, FaStar, FaTrash} from 'react-icons/fa';
import { useRouter } from 'next/navigation'

interface TemplatesSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function TemplatesSidebar({ activeView, onViewChange }: TemplatesSidebarProps) {
  const menuItems = [
    { name: 'My Template', icon: <FaFileAlt /> },
    { name: 'Favorites', icon: <FaStar /> },
    { name: 'Shared with Me', icon: <FaShareAlt /> },
    { name: 'All Templates', icon: <FaFileAlt /> },
    { name: 'Deleted', icon: <FaTrash/> },
  ];
  const router=useRouter();

  const chnageRouteToCreateTemplate = () => {
    router.push('/dashboard/create-template');
  }

  return (
    <div className="w-64 bg-gray-100 p-4 h-full">
      <button className="w-full bg-[var(--button-color)] text-white py-2 px-4 hover:bg-[var(--button-hover-color)] mb-6" onClick={chnageRouteToCreateTemplate}>
        Create Template
      </button>
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