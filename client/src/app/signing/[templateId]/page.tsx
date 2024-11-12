"use client";
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import SignIn from '@/components/signin/SignIn';
import axiosInstance from '@/services';

export default function SigningPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const recipientId = searchParams.get('recipient');
        if (!recipientId) {
          setError('Invalid signing link');
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(
          `/api/templates/${params.templateId}/signing?recipient=${recipientId}`
        );
        
        if (response.data && response.data.template) {
          console.log("Template data received:", response.data.template);
          setTemplate(response.data.template);
        } else {
          setError('Template not found');
        }
      } catch (error: any) {
        console.error('Error loading template:', error);
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Error loading template';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.templateId) {
      loadTemplate();
    }
  }, [params.templateId, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-600">
          Template not found
        </div>
      </div>
    );
  }

  return <SignIn template={template} />;
} 