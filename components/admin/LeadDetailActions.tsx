'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Loader2 } from 'lucide-react';

import {
  LEAD_DEAD_ENDS,
  LEAD_STAGES,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_SHORT,
  type LeadStatus,
} from '@/lib/admin-shared';

interface Props {
  leadId: string;
  currentStatus: LeadStatus;
  stageIndex: number;
}

const ALL_STATUSES: readonly LeadStatus[] = [...LEAD_STAGES, ...LEAD_DEAD_ENDS];

export default function LeadDetailActions({ leadId, currentStatus, stageIndex }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // A dropdown that only closes by clicking its own trigger again is a trap.
  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const nextStage =
    stageIndex >= 0 && stageIndex < LEAD_STAGES.length - 1
      ? LEAD_STAGES[stageIndex + 1]
      : null;

  async function setStatus(status: LeadStatus) {
    setIsSaving(true);
    setError(null);
    setIsOpen(false);

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setError(result.error ?? 'Could not update the status.');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {nextStage && (
          <button
            type="button"
            onClick={() => setStatus(nextStage)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Check aria-hidden className="h-4 w-4" />
            )}
            Move to {LEAD_STATUS_SHORT[nextStage]}
          </button>
        )}

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm text-primary-700 transition hover:border-primary-300"
          >
            All stages
            <ChevronDown
              aria-hidden
              className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-primary-200 bg-white py-1 shadow-lg"
            >
              {ALL_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="menuitem"
                  onClick={() => setStatus(status)}
                  disabled={status === currentStatus}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition ${
                    status === currentStatus
                      ? 'cursor-default bg-primary-50 font-medium text-primary-900'
                      : 'text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  {LEAD_STATUS_LABEL[status]}
                  {status === currentStatus && <Check aria-hidden className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
