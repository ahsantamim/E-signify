import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100  p-3 border-t lg:w-full">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-4 px-4">
        <div className="flex items-center space-x-4 text-gray-600 text-[10px]">
          <div className="relative group cursor-pointer">
            <span>English (US)</span>
            <span className="ml-1">▼</span> {/* Dropdown icon */}
          </div>
          <span>|</span>
          <span className="cursor-pointer">Contact Us</span>
          <span>|</span>
          <span className="cursor-pointer">Terms of Use</span>
          <span>|</span>
          <span className="cursor-pointer">Privacy</span>
          <span>|</span>
          <span className="cursor-pointer">Intellectual Property</span>
          <span>|</span>
          <span className="cursor-pointer">Trust</span>
        </div>
        <div className="text-gray-500 w-full text-start text-[10px] lg:w-fit">
          Copyright © 2024 E-Signify, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
