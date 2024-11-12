import React, { ReactNode } from "react";

interface ScrollbarProps {
  children: ReactNode;
  maxHeight?: string;
}

const Scrollbar: React.FC<ScrollbarProps> = ({
  children,
  maxHeight = "400px",
}) => {
  return (
    <div
      style={{ maxHeight }}
      className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500"
    >
      {children}
    </div>
  );
};

export default Scrollbar;
