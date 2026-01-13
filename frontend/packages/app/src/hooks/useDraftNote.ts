import { useState, useEffect, useCallback, useRef } from 'react';

export interface DraftNote {
  versionId: number;
  content: string;
  subject: string;
  to: string;
  cc: string;
  links: string;
  versionStatus: string;
  updatedAt: string;
}

const STORAGE_KEY_PREFIX = 'dna-draft-note-';

function getStorageKey(versionId: number): string {
  return `${STORAGE_KEY_PREFIX}${versionId}`;
}

function createEmptyDraft(versionId: number): DraftNote {
  return {
    versionId,
    content: '',
    subject: '',
    to: '',
    cc: '',
    links: '',
    versionStatus: '',
    updatedAt: new Date().toISOString(),
  };
}

function loadDraftFromStorage(versionId: number): DraftNote {
  try {
    const stored = localStorage.getItem(getStorageKey(versionId));
    if (stored) {
      const parsed = JSON.parse(stored) as DraftNote;
      if (parsed.versionId === versionId) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return createEmptyDraft(versionId);
}

function saveDraftToStorage(draft: DraftNote): void {
  try {
    localStorage.setItem(getStorageKey(draft.versionId), JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

function removeDraftFromStorage(versionId: number): void {
  try {
    localStorage.removeItem(getStorageKey(versionId));
  } catch {
    // ignore storage errors
  }
}

export interface UseDraftNoteResult {
  draftNote: DraftNote | null;
  updateDraftNote: (updates: Partial<Omit<DraftNote, 'versionId' | 'updatedAt'>>) => void;
  clearDraftNote: () => void;
}

export function useDraftNote(versionId: number | null | undefined): UseDraftNoteResult {
  const [draftNote, setDraftNote] = useState<DraftNote | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdatesRef = useRef<DraftNote | null>(null);

  useEffect(() => {
    if (versionId == null) {
      setDraftNote(null);
      return;
    }
    const loaded = loadDraftFromStorage(versionId);
    setDraftNote(loaded);
  }, [versionId]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        if (pendingUpdatesRef.current) {
          saveDraftToStorage(pendingUpdatesRef.current);
        }
      }
    };
  }, []);

  const updateDraftNote = useCallback(
    (updates: Partial<Omit<DraftNote, 'versionId' | 'updatedAt'>>) => {
      if (versionId == null) return;

      setDraftNote((prev) => {
        const base = prev ?? createEmptyDraft(versionId);
        const updated: DraftNote = {
          ...base,
          ...updates,
          versionId,
          updatedAt: new Date().toISOString(),
        };
        pendingUpdatesRef.current = updated;

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          if (pendingUpdatesRef.current) {
            saveDraftToStorage(pendingUpdatesRef.current);
            pendingUpdatesRef.current = null;
          }
        }, 300);

        return updated;
      });
    },
    [versionId]
  );

  const clearDraftNote = useCallback(() => {
    if (versionId == null) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      pendingUpdatesRef.current = null;
    }
    removeDraftFromStorage(versionId);
    setDraftNote(createEmptyDraft(versionId));
  }, [versionId]);

  return { draftNote, updateDraftNote, clearDraftNote };
}
