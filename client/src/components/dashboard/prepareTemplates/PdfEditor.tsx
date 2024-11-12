"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { X } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import ActionNav from "../mytemplates/ActionNav";
import axiosInstance from "@/services";
import { BACKEND_URL } from "@/utils/const";
import toast from "react-hot-toast";
import Loader from "@/components/loader/Loader";
import { useRouter } from "next/navigation";

const pdfjsVersion = "3.11.174";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

interface Field {
  id: number;
  type: string;
  position?: { x: number; y: number; page: number };
  value?: string;
  width?: number;
  height?: number;
}

interface DroppedField extends Field {
  position: { x: number; y: number; page: number };
  uniqueId: string;
  assignedTo?: string | null; // Add assignedTo property
}

interface DraggableFieldProps {
  field: Field;
}

const fieldTypes = [
  { id: 1, type: "Signature", icon: "✍️", width: 200, height: 50 },
  { id: 2, type: "Initial", icon: "🔤", width: 100, height: 50 },
  { id: 3, type: "Date Signed", icon: "📅", width: 150, height: 40 },
  { id: 4, type: "Name", icon: "👤", width: 200, height: 40 },
  { id: 5, type: "Email", icon: "📧", width: 250, height: 40 },
  { id: 6, type: "Company", icon: "🏢", width: 200, height: 40 },
  { id: 7, type: "Title", icon: "📋", width: 200, height: 40 },
  { id: 8, type: "Text", icon: "📝", width: 300, height: 40 },
];

const colorPalette = ["#FFD700", "#ADD8E6", "#FF69B4", "#90EE90", "#FFA500"];

const DraggableField: React.FC<DraggableFieldProps> = ({ field }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "field",
    item: field,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const fieldType = fieldTypes.find((t) => t.id === field.id);

  return (
    <div
      ref={drag}
      className={`flex items-center p-3 bg-white rounded-lg shadow-sm mb-2 cursor-move
        ${isDragging ? "opacity-50" : "opacity-100"}
        hover:bg-gray-50 transition-colors`}
    >
      <span className="mr-2">{fieldType?.icon}</span>
      <span>{field.type}</span>
    </div>
  );
};

const DroppedField: React.FC<{
  field: DroppedField;
  onRemove: (uniqueId: string) => void;
  onUpdate: (field: DroppedField) => void;
  scale: number;
  selectedRecipient: string | null;
  recipientColors: { [key: string]: string };
}> = ({
  field,
  onRemove,
  onUpdate,
  scale,
  selectedRecipient,
  recipientColors,
}) => {
  // Create a unique identifier for the field
  // const fieldId = `field-${field.id}-${field.position.page}`;
  const isCurrentRecipient = field.assignedTo === selectedRecipient;
  const color = field.assignedTo
    ? recipientColors[field.assignedTo] || "#E0E0E0"
    : "#E0E0E0";
  const opacity = isCurrentRecipient ? 1 : 0.5;

  const [{ isDragging }, drag] = useDrag({
    type: "placed-field",
    item: () => ({
      ...field,
      isPlaced: true,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const fieldType = fieldTypes.find((t) => t.id === field.id);
  const width = (fieldType?.width || 100) * scale;
  const height = (fieldType?.height || 30) * scale;

  const style = {
    position: "absolute" as const,
    left: field.position.x * scale,
    top: field.position.y * scale,
    width: `${width}px`,
    height: `${height}px`,
    cursor: "move",
    opacity: isDragging ? 0.5 : opacity,
    touchAction: "none",
    backgroundColor: color,
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(field.uniqueId);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onUpdate({ ...field, value: e.target.value });
  };

  return (
    <div
      ref={drag}
      style={style}
      className="p-2 rounded border flex items-center"
      data-field-id={field.uniqueId}
    >
      {field.type === "Checkbox" ? (
        <input
          type="checkbox"
          checked={field.value === "true"}
          onChange={(e) => {
            e.stopPropagation();
            onUpdate({ ...field, value: String(e.target.checked) });
          }}
          className="w-4 h-4"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <input
          type="text"
          value={field.value || ""}
          onChange={handleValueChange}
          placeholder={field.type}
          className="w-full bg-transparent border-none focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <button
        onClick={handleRemove}
        className="ml-2 text-gray-500 hover:text-red-500 z-10"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const PDFPage: React.FC<{
  pageNumber: number;
  scale: number;
  onDrop: (
    item: Field,
    position: { x: number; y: number; page: number }
  ) => void;
  droppedFields: DroppedField[];
  onRemoveField: (uniqueId: string) => void;
  onUpdateField: (field: DroppedField) => void;
  selectedRecipient: string | null;
  recipientColors: { [key: string]: string };
}> = ({
  pageNumber,
  scale,
  onDrop,
  droppedFields,
  onRemoveField,
  onUpdateField,
  selectedRecipient,
  recipientColors,
}) => {
  const pageRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: ["field", "placed-field"],
    drop: (item: any, monitor) => {
      if (!pageRef.current) return;

      const pageRect = pageRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const position = {
        x: (clientOffset.x - pageRect.left) / scale,
        y: (clientOffset.y - pageRect.top) / scale,
        page: pageNumber,
      };

      if (item.isPlaced) {
        // Handle moving existing field
        onUpdateField({
          ...item,
          position,
        });
      } else {
        // Handle new field drop
        onDrop(item, position);
      }

      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop}>
      <div ref={pageRef} className={`relative ${isOver ? "bg-blue-50" : ""}`}>
        <Page pageNumber={pageNumber} scale={scale} className="pdf-page" />
        {droppedFields
          .filter((field) => field.position.page === pageNumber)
          .map((field, index) => (
            <DroppedField
              key={`${field.id}-${index}-${field.position.x}-${field.position.y}`}
              field={field}
              onRemove={onRemoveField}
              onUpdate={onUpdateField}
              scale={scale}
              selectedRecipient={selectedRecipient}
              recipientColors={recipientColors}
            />
          ))}
      </div>
    </div>
  );
};

const PdfEditor: React.FC = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfFile, setPdfFile] = useState<File | null>(null); // Changed to store File object
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [droppedFields, setDroppedFields] = useState<DroppedField[]>([]);
  const [recipients, setRecipients] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [recipientColors, setRecipientColors] = useState<{
    [key: string]: string;
  }>({}); // New state for recipient colors
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("templateId");
    if (id) {
      setTemplateId(id);
      loadTemplateData(id);
    }
  }, []);

  useEffect(() => {
    const colors = recipients.reduce<{ [key: string]: string }>(
      (acc, recipient, index) => {
        acc[recipient.id] = colorPalette[index % colorPalette.length];
        return acc;
      },
      {}
    );
    setRecipientColors(colors);
  }, [recipients]);

  const loadTemplateData = async (id: string) => {
    setLoadingPdf(true);
    try {
      const response = await axiosInstance.get(`/api/templates/${id}`);
      const template = response.data.template;
      const pdfUrl = template.documentTemplateUrl;

      // Set the recipients from recipientRoles in the template data
      setRecipients(
        template.recipientRoles.map((role: any) => ({
          id: role._id,
          name: role.name,
        }))
      );

      try {
        const pdfResponse = await axiosInstance.get(pdfUrl, {
          responseType: "arraybuffer",
        });

        if (pdfResponse.status !== 200) {
          throw new Error(`HTTP error! status: ${pdfResponse.status}`);
        }

        const pdfBlob = new Blob([pdfResponse.data], {
          type: "application/pdf",
        });
        const file = new File([pdfBlob], "template.pdf", {
          type: "application/pdf",
        });
        setPdfFile(file);
        setLoadingPdf(false);

        // Also store the binary data for later use
        const arrayBuffer = await pdfBlob.arrayBuffer();
        setPdfBuffer(arrayBuffer);
      } catch (error) {
        console.error("Error fetching PDF:", error);
        // Add user-friendly error handling
        alert("Failed to load PDF document. Please try again later.");
        setLoadingPdf(false);
      }
    } catch (error) {
      console.error("Error loading template:", error);
      alert("Failed to load template data. Please try again later.");
      setLoadingPdf(false);
    }
  };

  // Add error handling for PDF document loading
  const handleDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF document:", error);
    alert("Failed to load PDF document. Please check if the file is valid.");
  };

  const handleRecipientChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const recipientId = event.target.value;
    setSelectedRecipient(recipientId);
  };

  // const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setPdfFile(file); // Store the File object
  //     const reader = new FileReader();
  //     reader.readAsArrayBuffer(file);
  //     reader.onloadend = () => {
  //       setPdfBuffer(reader.result as ArrayBuffer);
  //     };
  //   }
  // };

  const handleFieldDrop = useCallback(
    (item: Field, position: { x: number; y: number; page: number }) => {
      const fieldType = fieldTypes.find((t) => t.id === item.id);
      setDroppedFields((prev) => [
        ...prev,
        {
          ...item,
          position,
          width: fieldType?.width || 100,
          height: fieldType?.height || 30,
          uniqueId: `${item.id}-${Date.now()}-${Math.random()}`,
          assignedTo: selectedRecipient || undefined, // Set assignedTo to the selected recipient
        },
      ]);
    },
    [selectedRecipient] // Add selectedRecipient as a dependency
  );

  const handleFieldUpdate = useCallback((updatedField: DroppedField) => {
    setDroppedFields((prevFields) =>
      prevFields.map((field) =>
        field.uniqueId === updatedField.uniqueId
          ? {
              ...field,
              ...updatedField,
              position: updatedField.position,
            }
          : field
      )
    );
  }, []);

  const removeField = (uniqueId: string) => {
    // Change parameter type
    setDroppedFields((fields) => fields.filter((f) => f.uniqueId !== uniqueId));
  };

  const savePDF = async () => {
    if (!templateId) return;

    setIsSending(true);

    try {
      // Clean up the fields data before sending
      const cleanFields = droppedFields.map((field) => ({
        id: field.id,
        type: field.type,
        position: {
          x: field.position.x,
          y: field.position.y,
          page: field.position.page,
        },
        value: field.value || "",
        width: field.width,
        height: field.height,
        uniqueId: field.uniqueId,
        assignedTo: field.assignedTo, // Include assignedTo
      }));

      // First update the template with the field positions
      const updateResponse = await axiosInstance.put(
        `/api/templates/${templateId}`,
        {
          defaultFields: cleanFields,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (updateResponse.data && updateResponse.data.template) {
        console.log("Template updated successfully");

        // Then send emails to recipients
        try {
          const emailResponse = await axiosInstance.post(
            `/api/templates/${templateId}/send`
          );
          if (emailResponse.data) {
            setIsSending(false);
            toast.success(
              "Template saved and emails sent to recipients successfully"
            );
            router.push("/dashboard/agreements");
          }
        } catch (emailError: any) {
          console.error("Error sending emails:", emailError);
          toast.error(
            emailError.response?.data?.message ||
              "Error sending emails to recipients"
          );
          setIsSending(false);
        }
      }
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error(error.response?.data?.message || "Error saving template");
      setIsSending(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {<Loader isVisible={loadingPdf} message="Loading PDF..." />}
      {<Loader isVisible={isSending} message="Sending emails..." />}
      <ActionNav />
      <div className="flex h-screen bg-gray-100 mt-14">
        {/* Left Sidebar */}
        <div className="w-64 bg-white p-4 shadow-md overflow-y-auto">
          <h3 className="text-sm font-semibold mb-4">Select Recipient</h3>
          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedRecipient || ""}
            onChange={handleRecipientChange}
          >
            <option value="">Select a recipient</option>
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name}
              </option>
            ))}
          </select>
          <h3 className="text-sm font-semibold mb-4">Standard Fields</h3>
          <div className="space-y-2">
            {fieldTypes.map((field) => (
              <DraggableField key={field.id} field={field} />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                -
              </button>
              <span>{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale((s) => Math.min(2, s + 0.1))}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                +
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-white shadow-lg  overflow-auto"
            style={{ height: "calc(100vh - 200px)" }}
          >
            {pdfFile && (
              <Document
                file={pdfFile}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={handleDocumentLoadError}
                className="pdf-document"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <PDFPage
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={scale}
                    onDrop={handleFieldDrop}
                    droppedFields={droppedFields}
                    onRemoveField={removeField}
                    onUpdateField={handleFieldUpdate}
                    selectedRecipient={selectedRecipient}
                    recipientColors={recipientColors}
                  />
                ))}
              </Document>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-48 bg-white p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Pages</h3>
          <div className="space-y-2">
            {Array.from(new Array(numPages), (el, index) => (
              <button
                key={`page_${index + 1}`}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-full p-2 text-left rounded ${
                  currentPage === index + 1
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50"
                }`}
              >
                Page {index + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 w-full h-14 bg-white border-t px-4 py-3 shadow-md">
          <div className="mx-auto flex justify-end mb-2">
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 font-bold text-sm  disabled:opacity-50"
              disabled={isSending}
              onClick={savePDF}
            >
              {isSending ? "SENDING..." : "SEND"}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .pdf-document {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #e5e7eb;
          padding: 20px;
          gap: 20px;
        }
        .pdf-page {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          background-color: white;
          border-radius: 8px;
        }
      `}</style>
    </DndProvider>
  );
};

export default PdfEditor;
