"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaUserPlus, FaTrash, FaFileUpload } from "react-icons/fa";
import axiosInstance from "@/services";
import ActionNav from "./ActionNav";
import Loader from "@/components/loader/Loader";
interface Recipient {
  role: string;
  name: string;
  email: string;
  order?: number;
}

interface DocumentItem {
  file: File;
  previewUrl: string;
}

export default function CreateTemplate() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const [templateName, setTemplateName] = useState<string>("");
  const [templateDescription, setTemplateDescription] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isSigningOrderEnabled, setIsSigningOrderEnabled] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { role: "", name: "", email: "", order: 1 },
  ]);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<any>(null);
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch template data from the backend
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return; // If no ID, skip fetching
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/templates/${templateId}`
        );
        const template = response.data.template;
        // Populate form fields
        setTemplateName(template.name || "");
        setTemplateDescription(template.description || "");
        setEmailSubject(template.emailSubject || "");
        setEmailMessage(template.emailMessage || "");
        setTemplateData(response.data.template);
        // Populate recipients
        const populatedRecipients = template.recipientRoles.map(
          (role: any, index: number) => ({
            role: role.role || "",
            name: role.name || "",
            email: role.email || "",
            order: index + 1, // Assign an order if signing order is enabled
          })
        );
        setRecipients(populatedRecipients);
        // Fetch and set document URL for preview
        if (template.documentTemplateUrl) {
          const response = await axiosInstance.get(
            `/api/templates/${templateId}/download`,
            { responseType: "blob" } // Handle binary data
          );
          const pdfBlob = new Blob([response.data], {
            type: "application/pdf",
          });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setDocuments([{ file: null as unknown as File, previewUrl: pdfUrl }]);
        }
        // Populate document URL
        setDocumentUrl(template.documentTemplateUrl || "");
      } catch (err) {
        setError("Failed to fetch template data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      documents.forEach((doc) => {
        URL.revokeObjectURL(doc.previewUrl);
      });
    };
  }, [documents]);

  const validateForm = () => {
    let formErrors: any = {};

    if (!templateName) {
      formErrors.templateName = "Template name is required";
    }

    if (documents.length === 0) {
      formErrors.documents = "At least one document is required";
    }

    recipients.forEach((recipient, index) => {
      if (!recipient.role) formErrors[`role${index}`] = "Role is required";
      if (!recipient.name) formErrors[`name${index}`] = "Name is required";
      if (!recipient.email || !/\S+@\S+\.\S+/.test(recipient.email)) {
        formErrors[`email${index}`] = "Valid email is required";
      }
    });

    if (!emailSubject) {
      formErrors.emailSubject = "Email subject is required";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleAddDocument = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        // Create a preview URL for the PDF
        const previewUrl = URL.createObjectURL(file);
        setDocuments([...documents, { file, previewUrl }]);

        // Reset the input field
        if (event.target) {
          event.target.value = "";
        }
      } else {
        setErrors({ ...errors, documents: "Only PDF files are allowed" });
      }
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prevDocs) => {
      // Revoke the URL of the document being removed
      URL.revokeObjectURL(prevDocs[index].previewUrl);

      // Return the new array without the removed document
      return prevDocs.filter((_, docIndex) => docIndex !== index);
    });
  };

  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      {
        role: "",
        name: "",
        email: "",
        order: isSigningOrderEnabled ? recipients.length + 1 : undefined,
      },
    ]);
  };

  const handleRemoveRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients((prevRecipients) =>
        prevRecipients.filter((_, recIndex) => recIndex !== index)
      );
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("name", templateName);
        formData.append("description", templateDescription);
        formData.append("emailSubject", emailSubject);
        formData.append("emailMessage", emailMessage);
        // Add recipient roles with or without signing order
        const preparedRecipients = recipients.map((recipient, index) => ({
          ...recipient,
          order: isSigningOrderEnabled ? recipient.order : undefined,
        }));
        formData.append("recipientRoles", JSON.stringify(preparedRecipients));

        // if (documents.length > 0) {
        //   formData.append("documentTemplateUrl", documents[0].file);
        // }
        // Handle document upload or reuse
        if (documents.length > 0 && documents[0].file) {
          formData.append("documentTemplateUrl", documents[0].file);
        } else if (documentUrl) {
          formData.append("documentTemplateUrl", documentUrl);
        } else {
          setErrors({ documents: "No document uploaded or selected." });
          setIsSubmitting(false);
          return;
        }

        const response = await axiosInstance.post("/api/templates", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setIsSubmitting(false);
        if (response.status) {
          router.push(
            `/dashboard/prepare-template?templateId=${response.data.template._id}`
          );
        }
      } catch (error) {
        setErrors({
          ...errors,
          submit: "Failed to create template. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const cancel = () => {
    router.push("/dashboard/dash-templates");
  };

  if (loading)
    return <Loader isVisible={loading} message="Loading template..." />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      {isSubmitting && (
        <Loader isVisible={isSubmitting} message="Creating Template..." />
      )}
      {/* Fixed Action Buttons */}
      <ActionNav />
      <form
        className="w-[55%] mx-auto p-8 mb-10 mt-16"
        onSubmit={handleFormSubmit}
      >
        {/* Template Name and Description */}
        <div className="mb-4">
          <label className="block mb-2">Template Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          {errors.templateName && (
            <p className="text-red-500 text-sm">{errors.templateName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Template Description</label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Enter description"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
          />
        </div>

        {/* Document Upload Section */}
        <div className="mb-4">
          <label className="block mb-2 font-bold text-3xl py-6">
            Add Documents
          </label>

          {documents.length === 0 ? (
            <div className="border-dashed border-2 p-4 text-center mb-4">
              <input
                type="file"
                onChange={handleAddDocument}
                className="hidden"
                id="fileUpload"
                accept="application/pdf"
              />
              <label
                htmlFor="fileUpload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <FaFileUpload size={24} className="mb-2" />
                <span>Upload PDF</span>
              </label>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="relative border p-2 w-24 h-32 rounded"
                >
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => handleRemoveDocument(index)}
                  >
                    ✖️
                  </button>
                  <iframe
                    src={doc.previewUrl}
                    className="w-full h-full"
                    title={`PDF Preview ${index + 1}`}
                  />
                </div>
              ))}

              <div className="flex items-center justify-center w-24 h-32 border-2 border-dashed rounded">
                <input
                  type="file"
                  onChange={handleAddDocument}
                  className="hidden"
                  id="additionalFileUpload"
                  accept="application/pdf"
                />
                <label
                  htmlFor="additionalFileUpload"
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                >
                  <FaFileUpload size={24} className="mb-2" />
                  <span className="text-sm">Add More</span>
                </label>
              </div>
            </div>
          )}

          {errors.documents && (
            <p className="text-red-500 text-sm">{errors.documents}</p>
          )}
        </div>

        {/* Add Recipients */}
        <div className="mb-4">
          <label className="block mb-2 font-bold text-3xl py-6">
            Add Recipients
          </label>
          {/* Signing Order Toggle */}
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={isSigningOrderEnabled}
              onChange={() => setIsSigningOrderEnabled(!isSigningOrderEnabled)}
            />
            <span className="ml-2">Set signing order</span>
          </label>
          {recipients.map((recipient, index) => (
            <div
              key={index}
              className="relative p-4 mb-4 shadow-lg border border-l-gray-500 rounded"
            >
              {recipients.length > 1 && (
                <button
                  type="button"
                  className="absolute top-2 right-2 cursor-pointer p-1"
                  onClick={() => handleRemoveRecipient(index)}
                >
                  <FaTrash size={20} className="text-red-500" />
                </button>
              )}

              <label className="block mb-1">Role</label>
              <input
                type="text"
                className="block mb-2 w-full p-2 border rounded"
                placeholder="Role"
                value={recipient.role}
                onChange={(e) => {
                  const newRecipients = [...recipients];
                  newRecipients[index].role = e.target.value;
                  setRecipients(newRecipients);
                }}
              />
              {errors[`role${index}`] && (
                <p className="text-red-500 text-sm">{errors[`role${index}`]}</p>
              )}

              <label className="block mb-1">Name</label>
              <input
                type="text"
                className="block mb-2 w-full p-2 border rounded"
                placeholder="Name"
                value={recipient.name}
                onChange={(e) => {
                  const newRecipients = [...recipients];
                  newRecipients[index].name = e.target.value;
                  setRecipients(newRecipients);
                }}
              />
              {errors[`name${index}`] && (
                <p className="text-red-500 text-sm">{errors[`name${index}`]}</p>
              )}

              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="block w-full p-2 border rounded"
                placeholder="Email"
                value={recipient.email}
                onChange={(e) => {
                  const newRecipients = [...recipients];
                  newRecipients[index].email = e.target.value;
                  setRecipients(newRecipients);
                }}
              />
              {errors[`email${index}`] && (
                <p className="text-red-500 text-sm">
                  {errors[`email${index}`]}
                </p>
              )}
              {/* Order input, shown only if signing order is enabled */}
              {isSigningOrderEnabled && (
                <div className="mt-2">
                  <label className="block mb-1">Order</label>
                  <input
                    type="number"
                    min="1"
                    className="block w-full p-2 border rounded"
                    placeholder="Signing order"
                    value={recipient.order || ""}
                    onChange={(e) => {
                      const newRecipients = [...recipients];
                      newRecipients[index].order = Number(e.target.value);
                      setRecipients(newRecipients);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="border p-2 flex items-center space-x-2 rounded hover:bg-gray-50"
            onClick={handleAddRecipient}
          >
            <FaUserPlus size={20} /> <span>Add Recipient</span>
          </button>
        </div>

        {/* Message Section */}
        <div className="mb-20">
          <label className="block mb-2 font-bold text-3xl py-6">
            Add Message
          </label>
          <label className="block mb-1">Email Subject</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-2"
            placeholder="Email Subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          {errors.emailSubject && (
            <p className="text-red-500 text-sm">{errors.emailSubject}</p>
          )}

          <label className="block mb-1">Email Message</label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Email Message"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
          />
        </div>

        {/* Fixed Action Buttons */}
        <div className="fixed bottom-0 left-0 w-full h-14 bg-white border-t px-4 py-3 shadow-md">
          <div className="mx-auto flex justify-end mb-2">
            <button
              type="button"
              className="mr-2 px-4 py-2 bg-gray-300 font-bold text-sm "
              onClick={cancel}
              disabled={isSubmitting}
            >
              SAVE AND CLOSE
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 font-bold text-sm  disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "SUBMITTING..." : "NEXT"}
            </button>
          </div>
        </div>

        {errors.submit && (
          <p className="text-red-500 text-sm text-center mt-2">
            {errors.submit}
          </p>
        )}
      </form>
    </div>
  );
}
