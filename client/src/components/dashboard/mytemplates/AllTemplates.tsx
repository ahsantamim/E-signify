import React, { useState, useEffect } from "react";
import DocumentAlias from "../DocumentAlias";
import MyTemplates from "./MyTemplates";
import axiosInstance from "@/services";

interface AllTemplatesProps {
  searchTerm: string;
  selectedDate: string;
  showOnlyFavorites?: boolean;
}

const AllTemplates: React.FC<AllTemplatesProps> = ({
  searchTerm,
  selectedDate,
  showOnlyFavorites = false,
}) => { 
  return (
    <MyTemplates
      searchTerm={searchTerm}
      selectedDate={selectedDate}
      showOnlyFavorites={showOnlyFavorites}
    />
  );
};

export default AllTemplates;
