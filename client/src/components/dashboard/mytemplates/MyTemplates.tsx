"use client";
import React, { useState, useEffect } from "react";
import { FaStar, FaEllipsisV } from "react-icons/fa";
import axiosInstance from "@/services";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Scrollbar from "@/components/Scrollbar";
// Define the Template interface
interface Template {
  id: string; // MongoDB IDs are typically strings
  name: string;
  owner: string;
  createdDate: string;
  lastChange: string;
  isFavorite: boolean;
}

interface MyTemplatesProps {
  searchTerm: string;
  selectedDate: string;
  showOnlyFavorites?: boolean;
}

const MyTemplates: React.FC<MyTemplatesProps> = ({
  searchTerm,
  selectedDate,
  showOnlyFavorites = false,
}) => {
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null); // Changed to string
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/templates");
        const result = response.data;
        if (response.status === 200) {
          const formattedData = result.templates.map((template: any) => ({
            id: template._id,
            name: template.name,
            owner: `${template.createdBy.firstName} ${template.createdBy.lastName}`,
            createdDate: new Date(template.createdAt).toLocaleDateString(),
            lastChange: new Date(template.updatedAt).toLocaleDateString(),
            isFavorite: template.isFavorite,
          }));
          setData(formattedData);
          setLoading(false);
        } else {
          console.error("Failed to fetch templates:", result.message);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const toggleFavorite = async (id: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/api/templates/${id}/toggle-favorite`
      );
      if (response.status === 200) {
        toast.success("Template toggled as favorite");
        setData(
          data.map((template) =>
            template.id === id
              ? { ...template, isFavorite: !template.isFavorite }
              : template
          )
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setLoading(false);
    }
  };

  const filteredData = data.filter((template) => {
    const matchesSearch = template.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const createdDate = new Date(template.createdDate);
    const now = new Date();
    let matchesDate = true;

    if (selectedDate === "Last 6 months") {
      matchesDate = createdDate >= new Date(now.setMonth(now.getMonth() - 6));
    } else if (selectedDate === "Last week") {
      matchesDate = createdDate >= new Date(now.setDate(now.getDate() - 7));
    } else if (selectedDate === "Last 24 hrs") {
      matchesDate = createdDate >= new Date(now.setDate(now.getDate() - 1));
    }

    const matchesFavorite = showOnlyFavorites ? template.isFavorite : true;

    return matchesSearch && matchesDate && matchesFavorite;
  });

  const toggleDropdown = (id: string) => {
    // Change parameter type to string
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/templates/${id}`);

      if (response.status === 200) {
        // Remove the template from the local state
        setData(data.filter((template) => template.id !== id));
        // Close the dropdown
        setDropdownVisible(null);
        setLoading(false);
        // Show success message
        toast.success("Template deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
      setLoading(false);
    }
  };

  // const handleUse = (id: string) => {
  //   router.push(`/dashboard/use-template/${id}`);
  // };
  const handleUse = (id: string) => {
    router.push(`/dashboard/create-template?id=${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/edit-template/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">No templates found</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Scrollbar maxHeight="400px">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b"></th>
              <th className="px-4 py-2 border-b text-left w-2/5">Name</th>
              <th className="px-4 py-2 border-b text-left">Owner</th>
              <th className="px-4 py-2 border-b text-left">Created Date</th>
              <th className="px-4 py-2 border-b text-left">Last Change</th>
              <th className="px-4 py-2 border-b"></th>
              <th className="px-4 py-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100">
                {/* <td className="px-4 py-2 text-center border-b">
                <input type="checkbox" />
              </td> */}

                <td className="px-4 py-2 text-center border-b">
                  <FaStar
                    className={`cursor-pointer ${
                      item.isFavorite
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                    onClick={() => toggleFavorite(item.id)}
                  />
                </td>

                <td className="px-4 py-2 border-b text-left">{item.name}</td>

                <td className="px-4 py-2 border-b text-left whitespace-nowrap">
                  {item.owner}
                </td>

                <td className="px-4 py-2 border-b text-left whitespace-nowrap">
                  {item.createdDate}
                </td>

                <td className="px-4 py-2 border-b text-left whitespace-nowrap">
                  {item.lastChange}
                </td>

                <td className="px-4 py-2 border-b text-end">
                  <button
                    className="bg-[var(--button-color)] text-white px-4 py-2 hover:bg-[var(--button-hover-color)]"
                    onClick={() => handleUse(item.id)}
                  >
                    Use
                  </button>
                </td>

                <td className="px-4 py-2 border-b relative text-center">
                  <button onClick={() => toggleDropdown(item.id)}>
                    <FaEllipsisV className="cursor-pointer hover:text-gray-500" />
                  </button>

                  {dropdownVisible === item.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md z-10">
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-200"
                        onClick={() => {
                          handleEdit(item.id);
                          setDropdownVisible(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-200"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this template?"
                            )
                          ) {
                            handleDelete(item.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-200">
                        Move
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scrollbar>
    </div>
  );
};

export default MyTemplates;
