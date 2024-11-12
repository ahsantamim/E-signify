import React, { FC } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onClear: () => void;
  searchTerm: string;
  selectedDate: string;
  showStatus?: boolean;
  showSender?: boolean;
}

const SearchBar: FC<SearchBarProps> = ({
  onSearchChange,
  onDateChange,
  searchTerm,
  selectedDate,
  onClear,
  showStatus = false,
  showSender = false,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
        <FaSearch className="text-gray-500 cursor-pointer hover:text-gray-700" />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search My Templates"
          onChange={(e) => onSearchChange(e.target.value)}
          className="ml-2 outline-none text-sm"
        />
      </div>
      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
      >
        <option value="">Date</option>
        {/* <option value="All time">All time</option> */}
        <option value="Last 6 months">Last 6 months</option>
        <option value="Last week">Last week</option>
        <option value="Last 24 hrs">Last 24 hrs</option>
      </select>
      {showStatus && (
        <select
          onChange={(e) => console.log("Status:", e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
        >
          <option>Status</option>
          <option value="Read">Read</option>
          <option value="Unread">Unread</option>
        </select>
      )}
      {showSender && (
        <select
          onChange={(e) => console.log("Sender:", e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
        >
          <option>Sender</option>
          <option value="Sender 1">Sender 1</option>
          <option value="Sender 2">Sender 2</option>
        </select>
      )}
      <button
        onClick={onClear}
        className="text-sm text-black hover:underline"
      >
        Clear
      </button>
    </div>
  );
};

export default SearchBar;
