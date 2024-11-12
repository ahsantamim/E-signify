import React, { useState, useEffect } from "react";
import axiosInstance from "@/services";
import { toast } from "react-hot-toast";
import { FaUndo, FaTrash } from "react-icons/fa";
import Scrollbar from "@/components/Scrollbar";

interface Template {
  id: string;
  name: string;
  owner: string;
  createdDate: string;
  lastChange: string;
}

interface DeletedProps {
  searchTerm: string;
  selectedDate: string;
}

const Deleted: React.FC<DeletedProps> = ({ searchTerm, selectedDate }) => {
  const [data, setData] = useState<Template[]>([]);

  useEffect(() => {
    const fetchDeletedTemplates = async () => {
      try {
        const response = await axiosInstance.get("/api/templates/deleted");
        console.log(`response: shffhwf: ${response}`);
        const result = response.data;
        if (response.status === 200) {
          const formattedData = result.templates.map((template: any) => ({
            id: template._id,
            name: template.name,
            owner: `${template.createdBy.firstName} ${template.createdBy.lastName}`,
            createdDate: new Date(template.createdAt).toLocaleDateString(),
            lastChange: new Date(template.updatedAt).toLocaleDateString(),
          }));
          setData(formattedData);
        } else {
          console.error("Failed to fetch deleted templates:", result.message);
        }
      } catch (error) {
        console.error("Error fetching deleted templates:", error);
      }
    };

    fetchDeletedTemplates();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const response = await axiosInstance.post(`/api/templates/${id}/restore`);
      if (response.status === 200) {
        toast.success("Template restored successfully");
        setData(data.filter((template) => template.id !== id));
      }
    } catch (error) {
      console.error("Error restoring template:", error);
      toast.error("Failed to restore template");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const response = await axiosInstance.delete(
        `/api/templates/${id}/permanent-delete`
      );
      if (response.status === 200) {
        toast.success("Template permanently deleted");
        setData(data.filter((template) => template.id !== id));
      }
    } catch (error) {
      console.error("Error permanently deleting template:", error);
      toast.error("Failed to delete template permanently");
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

    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-4">
      {filteredData.length > 0 ? (
        <Scrollbar maxHeight="400px">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left w-2/5">Name</th>
                <th className="px-4 py-2 border-b text-left">Owner</th>
                <th className="px-4 py-2 border-b text-left">Created Date</th>
                <th className="px-4 py-2 border-b text-left">Last Change</th>
                <th className="px-4 py-2 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b text-left">{item.name}</td>
                  <td className="px-4 py-2 border-b text-left">{item.owner}</td>
                  <td className="px-4 py-2 border-b text-left">
                    {item.createdDate}
                  </td>
                  <td className="px-4 py-2 border-b text-left">
                    {item.lastChange}
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      onClick={() => handleRestore(item.id)}
                    >
                      <FaUndo />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to permanently delete this template?"
                          )
                        ) {
                          handlePermanentDelete(item.id);
                        }
                      }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scrollbar>
      ) : (
        <p className="text-center text-gray-500">
          No deleted templates available.
        </p>
      )}
    </div>
  );
};

export default Deleted;
