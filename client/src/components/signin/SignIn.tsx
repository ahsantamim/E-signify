"use client";
import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/services";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import toast from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface Field {
  id: number;
  type: string;
  position: {
    x: number;
    y: number;
    page: number;
  };
  value: string;
  width: number;
  height: number;
  uniqueId: string;
}

interface SignInProps {
  template: {
    _id: string;
    name: string;
    documentTemplateUrl: string;
    defaultFields: Field[];
  };
}

const SignIn: React.FC<SignInProps> = ({ template }) => {
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("recipient");
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [fields, setFields] = useState<Field[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (template?.defaultFields) {
      // Initialize fields with template's default fields
      setFields(
        template.defaultFields.map((field) => ({ ...field, value: "" }))
      );
    }
  }, [template]);

  const handleFieldChange = (uniqueId: string, value: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.uniqueId === uniqueId ? { ...field, value } : field
      )
    );
  };

  const validateFields = () => {
    const requiredFields = fields.filter(
      (field) =>
        (field.type === "Signature" || field.type === "Name") && !field.value
    );

    if (requiredFields.length > 0) {
      setError("Please fill in all required fields (Signature and Name)");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Submitting fields:", {
        recipientId: searchParams.get("recipient"),
        fields,
      });

      const response = await axiosInstance.post(
        `/api/templates/${template._id}/submit`,
        {
          recipientId: searchParams.get("recipient"),
          fields: fields.map((field) => ({
            id: field.id,
            type: field.type,
            position: field.position,
            value: field.value || "",
            width: field.width,
            height: field.height,
            uniqueId: field.uniqueId,
          })),
        }
      );

      if (response.data.message) {
        toast.success("Document signed successfully!");
        router.push("/signing/success");
      } else {
        setError(response.data.message || "Failed to submit signature");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error submitting the form. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: Field) => {
    const style = {
      position: "absolute" as const,
      left: `${field.position.x}px`,
      top: `${field.position.y}px`,
      width: `${field.width}px`,
      height: `${field.height}px`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      zIndex: 50,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    };

    switch (field.type) {
      case "Signature":
        return (
          <div
            style={style}
            className="bg-white border border-gray-300 p-2 hover:border-blue-500 focus-within:border-blue-500"
          >
            <input
              type="text"
              value={field.value}
              onChange={(e) =>
                handleFieldChange(field.uniqueId, e.target.value)
              }
              placeholder="Type your signature"
              className="w-full h-full outline-none border-none bg-transparent"
              required
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-xs text-red-500">Required</div>
          </div>
        );

      case "Name":
        return (
          <div
            style={style}
            className="bg-white border border-gray-300 p-2 hover:border-blue-500 focus-within:border-blue-500"
          >
            <input
              type="text"
              value={field.value}
              onChange={(e) =>
                handleFieldChange(field.uniqueId, e.target.value)
              }
              placeholder="Enter your name"
              className="w-full h-full outline-none border-none bg-transparent"
              required
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-xs text-red-500">Required</div>
          </div>
        );

      case "Date":
        return (
          <div
            style={style}
            className="bg-white border border-gray-300 p-2 hover:border-blue-500 focus-within:border-blue-500"
          >
            <input
              type="date"
              value={field.value}
              onChange={(e) =>
                handleFieldChange(field.uniqueId, e.target.value)
              }
              className="w-full h-full outline-none border-none bg-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );

      default:
        return (
          <div
            style={style}
            className="bg-white border border-gray-300 p-2 hover:border-blue-500 focus-within:border-blue-500"
          >
            <input
              type="text"
              value={field.value}
              onChange={(e) =>
                handleFieldChange(field.uniqueId, e.target.value)
              }
              placeholder={`Enter ${field.type}`}
              className="w-full h-full outline-none border-none bg-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">{template.name}</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
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

        <div className="relative border bg-gray-100 overflow-auto">
          <Document
            file={template.documentTemplateUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            className="pdf-document"
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="relative pdf-page-container"
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  className="pdf-page"
                  renderTextLayer={false}
                />
                <div className="absolute inset-0">
                  {fields
                    .filter((field) => field.position.page === index + 1)
                    .map((field) => (
                      <div key={field.uniqueId}>{renderField(field)}</div>
                    ))}
                </div>
              </div>
            ))}
          </Document>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-yellow-500 font-bold text-sm disabled:opacity-50"
          >
            {isSubmitting ? "SUBMITTING . . . " : "SIGN & SUBMIT"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .pdf-document {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
        }

        .pdf-page-container {
          background-color: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          display: inline-block;
        }

        .pdf-page {
          display: block;
          canvas {
            display: block;
            width: 100%;
            height: 100%;
          }
        }

        /* Remove any margin/padding from the canvas wrapper */
        .react-pdf__Page__canvas {
          margin: 0 !important;
          border-radius: 8px;
        }

        /* Ensure annotations stay within bounds */
        .react-pdf__Page__annotations {
          height: 100% !important;
        }

        input {
          cursor: text;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
