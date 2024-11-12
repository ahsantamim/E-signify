'use client';
import React, { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import axiosInstance from '@/services';
import { format } from 'date-fns';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
import Scrollbar from '@/components/Scrollbar';

interface Template {
  _id: string;
  name: string;
  documentTemplateUrl: string;
  createdAt: string;
  updatedAt: string;
  defaultFields: Array<{
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
  }>;
  recipientRoles: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  signingStatus: string;
}

interface SentProps {
  showCompleted?: boolean;
}

const Sent: React.FC<SentProps> = ({ showCompleted = false }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);

  const loadSentTemplates = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/templates/sent');
      if (response.data.templates) {
        const allTemplates = response.data.templates;
        // Filter templates based on showCompleted prop
        const filteredTemplates = allTemplates.filter(
          (template: { defaultFields: any[] }) =>
            template.defaultFields.some((field: { value: any }) => field.value)
        );
        if (showCompleted) {
          setTemplates(filteredTemplates);
        } else {
          setTemplates(allTemplates);
        }
      }
    } catch (err: any) {
      console.error('Error loading sent templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (templateId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/templates/${templateId}/download`,
        {
          responseType: 'blob',
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `signed-document-${templateId}.pdf`);

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      console.error('Error downloading template:', err);
      alert('Error downloading the document');
    }
  };

  const handlePreview = async (templateId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/templates/${templateId}/download`,
        {
          responseType: 'blob',
        }
      );

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewPdf(pdfUrl);
      setShowModal(true);
    } catch (err: any) {
      setError('Error previewing the document');
      console.error('Error previewing template:', err);
      alert('Error previewing the document');
    }
  };

  const Modal = ({ children }: { children: React.ReactNode }) => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <span>{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale((s) => Math.min(2, s + 0.1))}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                setPreviewPdf(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    loadSentTemplates();
  }, []);

  // Add refresh functionality
  // const handleRefresh = () => {
  //   setLoading(true);
  //   loadSentTemplates();
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (templates.length === 0) {
    return <div className="text-center p-4">No templates found</div>;
  }

  return (
    <div className="p-4">
      <div className="bg-white overflow-hidden">
        <Scrollbar maxHeight="400px">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">Document Name</th>
                <th className="px-4 py-2 border-b text-left">Recipients</th>
                <th className="px-4 py-2 border-b text-left">Last Updated</th>
                <th className="px-4 py-2 border-b text-left">Status</th>
                <th className="px-4 py-2 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => {
                const isSigned = template.signingStatus === 'Signed';
                return (
                  <tr key={template._id} className="hover:bg-gray-100">
                    <td className="px-4 py-4 border-b text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b text-left">
                      <div className="text-sm text-gray-500">
                        {template.recipientRoles.length === 1 ? (
                          template.recipientRoles[0].email
                        ) : (
                          <>
                            {template.recipientRoles
                              .slice(0, 2)
                              .map((role, index) => (
                                <span key={index}>
                                  {role.email}
                                  {index <
                                    template.recipientRoles.slice(0, 2).length -
                                      1 && ', '}
                                </span>
                              ))}
                            {template.recipientRoles.length > 2 && (
                              <span>
                                {' '}
                                and {template.recipientRoles.length - 2} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b text-left whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(template.updatedAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b text-left">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isSigned
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {isSigned ? 'Signed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b text-center">
                      <button
                        onClick={() => isSigned && handlePreview(template._id)}
                        className={`mr-2 ${
                          isSigned
                            ? 'text-blue-600 hover:text-blue-900'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isSigned}
                      >
                        <Eye className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => isSigned && handleDownload(template._id)}
                        className={`${
                          isSigned
                            ? 'text-green-600 hover:text-green-900'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isSigned}
                      >
                        <Download className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Scrollbar>
      </div>

      <Modal>
        {previewPdf && (
          <Document
            file={previewPdf}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            className="flex flex-col items-center bg-gray-200 p-5"
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div key={`page_${index + 1}`} className="mb-4">
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  className="shadow-lg"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        )}
      </Modal>
    </div>
  );
};

export default Sent;
