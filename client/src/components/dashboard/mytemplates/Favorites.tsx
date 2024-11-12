import React, { useState, useEffect } from "react";
import DocumentAlias from "../DocumentAlias";
import MyTemplates from "./MyTemplates";
import axiosInstance from "@/services";

interface FavoritesProps {
    searchTerm: string;
    selectedDate: string;
    showOnlyFavorites?: boolean;
  }
  

const Favorites = ({ searchTerm, selectedDate, showOnlyFavorites = false }: FavoritesProps) => {
    const [hasTemplates, setHasTemplates] = useState(false);

    useEffect(() => {
        const checkFavorites = async () => {
            try {
                const response = await axiosInstance.get("/api/templates");
                const hasFavorites = response.data.templates.some(
                    (template: any) => template.isFavorite
                );
                setHasTemplates(hasFavorites);
            } catch (error) {
                console.error("Error checking favorites:", error);
            }
        };

        checkFavorites();
    }, []);

    if (!hasTemplates) {
        return (
            <DocumentAlias
                docu_title="Keep your favorite templates close"
                docu_text="When you add existing templates to your favorites, you can access them more easily."
                docu_link=""
                docu_img="/favorites.png"
                btn_show="invisible"
                btn_text="Add to Favorites"
            />
        );
    }

    return <MyTemplates searchTerm={searchTerm} selectedDate={selectedDate} showOnlyFavorites={true} />;
};

export default Favorites;
