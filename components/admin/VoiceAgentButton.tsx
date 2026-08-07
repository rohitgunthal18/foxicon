'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';

import VoiceAgentDialog from './VoiceAgentDialog';

interface Props {
  leadId: string;
  leadName: string;
  leadCity: string | null;
  leadRating: number | null;
  leadReviewCount: number | null;
  /** Inline variant for the table actions column */
  inline?: boolean;
}

export default function VoiceAgentButton({
  leadId,
  leadName,
  leadCity,
  leadRating,
  leadReviewCount,
  inline = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (inline) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded p-1.5 text-primary-600 transition hover:bg-primary-100 hover:text-primary-800"
          title="Call with voice agent"
        >
          <Bot className="h-4 w-4" />
          <span className="sr-only">Call with voice agent</span>
        </button>

        {isOpen && (
          <VoiceAgentDialog
            leadId={leadId}
            leadName={leadName}
            leadCity={leadCity}
            leadRating={leadRating}
            leadReviewCount={leadReviewCount}
            onClose={() => setIsOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-300 bg-primary-50 py-2.5 text-sm font-medium text-primary-800 transition hover:bg-primary-100"
      >
        <Bot aria-hidden className="h-4 w-4" />
        Call with Voice Agent
      </button>

      {isOpen && (
        <VoiceAgentDialog
          leadId={leadId}
          leadName={leadName}
          leadCity={leadCity}
          leadRating={leadRating}
          leadReviewCount={leadReviewCount}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
