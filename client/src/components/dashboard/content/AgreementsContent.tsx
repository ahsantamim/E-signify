import { ReactNode } from 'react';
import Sent from '../agreements/Sent';
import Inbox from '../agreements/Inbox';

interface AgreementsContentProps {
  activeView: string;
}

export function AgreementsContent({ activeView }: AgreementsContentProps) {
  const contentMap: Record<string, ReactNode> = {
    'Inbox': (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Inbox</h2>
        <Inbox showActionRequired={false} />
      </div>
    ),
    'Sent': (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Sent Agreements</h2>
        <Sent showCompleted={false}/>
      </div>
    ),
    'Action Required': (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Action Required</h2>
        <Inbox showActionRequired={true} />
      </div>
    ),
    'Completed': (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Completed Agreements</h2>
        <Sent showCompleted={true} />
      </div>
    ),
    'Drafts': (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Drafts</h2>
        {/* Add your Action Required content here */}
      </div>
    ),
    'Deleted': (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Deleted</h2>
        {/* Add your Action Required content here */}
      </div>
    )
  };

  return contentMap[activeView] || null;
}