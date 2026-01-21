import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BotSession,
  BotStatus,
  BotStatusEnum,
  DispatchBotRequest,
  Platform,
} from '@dna/core';
import { apiHandler } from '../api';

export interface ParsedMeetingUrl {
  platform: Platform;
  meetingId: string;
}

export function parseMeetingUrl(url: string): ParsedMeetingUrl | null {
  const trimmedUrl = url.trim();

  const googleMeetMatch = trimmedUrl.match(
    /meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i
  );
  if (googleMeetMatch) {
    return {
      platform: 'google_meet',
      meetingId: googleMeetMatch[1].toLowerCase(),
    };
  }

  const teamsMatch = trimmedUrl.match(/teams\.microsoft\.com.*meetup-join/i);
  if (teamsMatch) {
    return {
      platform: 'teams',
      meetingId: trimmedUrl,
    };
  }

  if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(trimmedUrl)) {
    return {
      platform: 'google_meet',
      meetingId: trimmedUrl.toLowerCase(),
    };
  }

  return null;
}

export interface UseTranscriptionOptions {
  playlistId: number | null;
  pollInterval?: number;
}

export interface UseTranscriptionReturn {
  session: BotSession | null;
  status: BotStatus | null;
  isDispatching: boolean;
  isStopping: boolean;
  isPollingStatus: boolean;
  error: Error | null;
  dispatchBot: (meetingUrl: string, passcode?: string) => Promise<BotSession>;
  stopBot: () => Promise<void>;
  clearSession: () => void;
}

export function useTranscription({
  playlistId,
  pollInterval = 5000,
}: UseTranscriptionOptions): UseTranscriptionReturn {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<BotSession | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const isActiveStatus = (status: BotStatusEnum): boolean => {
    return ['joining', 'in_call', 'transcribing'].includes(status);
  };

  const { data: status, isFetching: isPollingStatus } = useQuery<
    BotStatus,
    Error
  >({
    queryKey: ['botStatus', session?.platform, session?.meeting_id],
    queryFn: () =>
      apiHandler.getBotStatus({
        platform: session!.platform,
        meetingId: session!.meeting_id,
      }),
    enabled: !!session && isActiveStatus(session.status),
    refetchInterval: pollInterval,
  });

  const dispatchMutation = useMutation<
    BotSession,
    Error,
    DispatchBotRequest
  >({
    mutationFn: (request) => apiHandler.dispatchBot({ request }),
    onSuccess: (newSession) => {
      setSession(newSession);
      setError(null);
      queryClient.invalidateQueries({
        queryKey: ['playlistMetadata', playlistId],
      });
    },
    onError: (err) => {
      setError(err);
    },
  });

  const stopMutation = useMutation<boolean, Error, void>({
    mutationFn: async () => {
      if (!session) throw new Error('No active session');
      return apiHandler.stopBot({
        platform: session.platform,
        meetingId: session.meeting_id,
      });
    },
    onSuccess: () => {
      if (session) {
        setSession({ ...session, status: 'stopped' });
      }
      queryClient.invalidateQueries({
        queryKey: ['botStatus', session?.platform, session?.meeting_id],
      });
    },
    onError: (err) => {
      setError(err);
    },
  });

  const dispatchBot = useCallback(
    async (meetingUrl: string, passcode?: string): Promise<BotSession> => {
      if (!playlistId) {
        throw new Error('No playlist selected');
      }

      const parsed = parseMeetingUrl(meetingUrl);
      if (!parsed) {
        throw new Error('Invalid meeting URL format');
      }

      const request: DispatchBotRequest = {
        platform: parsed.platform,
        meeting_id: parsed.meetingId,
        playlist_id: playlistId,
        passcode,
      };

      return dispatchMutation.mutateAsync(request);
    },
    [playlistId, dispatchMutation]
  );

  const stopBot = useCallback(async (): Promise<void> => {
    await stopMutation.mutateAsync();
  }, [stopMutation]);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    session,
    status: status ?? null,
    isDispatching: dispatchMutation.isPending,
    isStopping: stopMutation.isPending,
    isPollingStatus,
    error,
    dispatchBot,
    stopBot,
    clearSession,
  };
}
