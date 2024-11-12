import { ReactNode, useState } from "react";
import MyTemplates from "../mytemplates/MyTemplates";
import SharedWithMe from "../mytemplates/SharedWithMe";
import Favorites from "../mytemplates/Favorites";
import SearchBar from "../SearchBar";
import AllTemplates from "../mytemplates/AllTemplates";
import Deleted from "../mytemplates/Deleted";

interface TemplatesContentProps {
  activeView: string;
}

export function TemplatesContent({ activeView }: TemplatesContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedDate("");
  };
  const contentMap: Record<string, ReactNode> = {
    "My Template": (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Templates</h2>
        <SearchBar
          searchTerm={searchTerm}
          selectedDate={selectedDate}
          onSearchChange={handleSearchChange}
          onDateChange={handleDateChange}
          onClear={handleClear}
        />
        <MyTemplates searchTerm={searchTerm} selectedDate={selectedDate} />
      </div>
    ),
    "Favorites": (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Favorite Templates</h2>
        <SearchBar
          searchTerm={searchTerm}
          selectedDate={selectedDate}
          onSearchChange={handleSearchChange}
          onDateChange={handleDateChange}
          onClear={handleClear}
        />
        <Favorites searchTerm={searchTerm} selectedDate={selectedDate} />
      </div>
    ),
    "Shared with Me": (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Shared Templates</h2>
        <SharedWithMe />
      </div>
    ),
    "All Templates": (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Templates</h2>
        <SearchBar
          searchTerm={searchTerm}
          selectedDate={selectedDate}
          onSearchChange={handleSearchChange}
          onDateChange={handleDateChange}
          onClear={handleClear}
        />
        <AllTemplates searchTerm={searchTerm} selectedDate={selectedDate} />
      </div>
    ),
    "Deleted": (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Deleted Templates</h2>
        <Deleted searchTerm={searchTerm} selectedDate={selectedDate} />
      </div>
    ),
  };

  return contentMap[activeView] || null;
}
