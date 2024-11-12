"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services";
import { useUser } from "@/components/context/userContext";
import Scrollbar from "@/components/Scrollbar";

interface Template {
  _id: string;
  name: string;
  documentTemplateUrl: string;
  createdAt: string;
  updatedAt: string;
  signingStatus: "Signed" | "Pending";
  recipientRoles: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdBy: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface InboxProps {
  showActionRequired?: boolean;
}

function Inbox({ showActionRequired = false }: InboxProps) {
  const router = useRouter();
  const { user } = useUser();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInboxTemplates = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/templates/inbox`, {
        params: {
          email: user?.email,
        },
      });
      if (response.data.templates) {
        // Filter templates if showActionRequired is true
        const filteredTemplates = showActionRequired
          ? response.data.templates.filter(
              (template: { signingStatus: string }) =>
                template.signingStatus === "Pending"
            )
          : response.data.templates;
        setTemplates(filteredTemplates);
      }
    } catch (err: any) {
      console.error("Error loading inbox templates:", err);
      setError(err.response?.data?.message || "Error loading templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInboxTemplates();
  }, []);

  const handleSign = (templateId: string, recipientId: string) => {
    router.push(`/signing/${templateId}?recipient=${recipientId}`);
  };

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
                <th className="px-4 py-2 border-b text-left">From</th>
                <th className="px-4 py-2 border-b text-left">Received Date</th>
                <th className="px-4 py-2 border-b text-left">Status</th>
                <th className="px-4 py-2 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => {
                const currentUserRole = template.recipientRoles.find(
                  (role) => role.email === user?.email
                );

                return (
                  <tr key={template._id} className="hover:bg-gray-100">
                    <td className="px-4 py-4 border-b text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b text-left">
                      <div className="text-sm text-gray-500">
                        {`${template.createdBy.firstName} ${template.createdBy.lastName}`}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b text-left whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(template.createdAt), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b text-left">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          template.signingStatus === "Signed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {template.signingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b text-center">
                      {template.signingStatus === "Pending" &&
                      currentUserRole ? (
                        <button
                          onClick={() =>
                            handleSign(template._id, currentUserRole._id)
                          }
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Sign
                        </button>
                      ) : (
                        <button className="bg-gray-300 text-white px-4 py-2 rounded disabled:opacity-50">
                          Signed
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Scrollbar>
      </div>
    </div>
  );
}

export default Inbox;

//old code
// "use client";
// import React, { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { useRouter } from "next/navigation";
// import axiosInstance from "@/services";
// import { useUser } from "@/components/context/userContext";
// import Scrollbar from "@/components/Scrollbar";

// interface Template {
//   _id: string;
//   name: string;
//   documentTemplateUrl: string;
//   createdAt: string;
//   updatedAt: string;
//   signingStatus: 'Signed' | 'Pending';
//   defaultFields?: Array<{
//     id: number;
//     type: string;
//     position: {
//       x: number;
//       y: number;
//       page: number;
//     };
//     value?: string;
//     width: number;
//     height: number;
//     uniqueId: string;
//   }>;
//   recipientRoles: Array<{
//     _id: string;
//     name: string;
//     email: string;
//   }>;
//   createdBy: {
//     email: string;
//     firstName: string;
//     lastName: string;
//   };
// }

// interface InboxProps {
//   showActionRequired?: boolean;
// }

// function Inbox({ showActionRequired = false }: InboxProps) {
//   const router = useRouter();
//   const { user } = useUser();
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadInboxTemplates = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get(`/api/templates/inbox`, {
//         params: {
//           email: user?.email,
//         },
//       });
//       if (response.data.templates) {
//         // Filter templates if showActionRequired is true
//         const filteredTemplates = showActionRequired
//           ? response.data.templates.filter(
//               (template: { defaultFields: any[] }) =>
//                 template.defaultFields?.every(
//                   (field: { value: any }) => !field.value
//                 ) ?? false
//             )
//           : response.data.templates;
//         setTemplates(filteredTemplates);
//       }
//     } catch (err: any) {
//       console.error("Error loading inbox templates:", err);
//       setError(err.response?.data?.message || "Error loading templates");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadInboxTemplates();
//   }, []);

//   const handleSign = (templateId: string, recipientId: string) => {
//     router.push(`/signing/${templateId}?recipient=${recipientId}`);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-red-500 text-center p-4">{error}</div>;
//   }

//   if (templates.length === 0) {
//     return <div className="text-center p-4">No templates found</div>;
//   }

//   return (
//     <div className="p-4">
//       <div className="bg-white overflow-hidden">
//         <Scrollbar maxHeight="400px">
//           <table className="min-w-full bg-white">
//             <thead>
//               <tr>
//                 <th className="px-4 py-2 border-b text-left">Document Name</th>
//                 <th className="px-4 py-2 border-b text-left">From</th>
//                 <th className="px-4 py-2 border-b text-left">Received Date</th>
//                 <th className="px-4 py-2 border-b text-left">Status</th>
//                 <th className="px-4 py-2 border-b text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {templates.map((template) => {
//                 const currentUserRole = template.recipientRoles.find(
//                   (role) => role.email === user?.email
//                 );
//                 const isSigned = template.defaultFields?.every(
//                   (field) => field.value
//                 ) ?? false;
//                 return (
//                   <tr key={template._id} className="hover:bg-gray-100">
//                     <td className="px-4 py-4 border-b text-left">
//                       <div className="text-sm font-medium text-gray-900">
//                         {template.name}
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 border-b text-left">
//                       <div className="text-sm text-gray-500">
//                         {`${template.createdBy.firstName} ${template.createdBy.lastName}`}
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 border-b text-left whitespace-nowrap">
//                       <div className="text-sm text-gray-500">
//                         {format(new Date(template.createdAt), "MMM dd, yyyy")}
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 border-b text-left">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           isSigned
//                             ? "bg-green-100 text-green-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {isSigned ? "Signed" : "Pending"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-4 border-b text-center">
//                       {!isSigned && currentUserRole ? (
//                         <button
//                           onClick={() =>
//                             handleSign(template._id, currentUserRole._id)
//                           }
//                           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                         >
//                           Sign
//                         </button>
//                       ) : (
//                         <button className="bg-gray-300 text-white px-4 py-2 rounded disabled:opacity-50">
//                           Signed
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </Scrollbar>
//       </div>
//     </div>
//   );
// }

// export default Inbox;
