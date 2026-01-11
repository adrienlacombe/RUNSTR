/**
 * useRunningBitcoin - Hook for Running Bitcoin Challenge
 *
 * SUPABASE ARCHITECTURE:
 * - Fetches leaderboard from Supabase via RunningBitcoinService
 * - Fast queries (~500ms) with 5-minute cache
 * - No baseline notes needed - Supabase is the source of truth
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RunningBitcoinService,
  type RunningBitcoinLeaderboard,
} from '../services/challenge/RunningBitcoinService';

interface UseRunningBitcoinResult {
  leaderboard: RunningBitcoinLeaderboard | null;
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  currentUserPubkey: string | undefined;
  hasJoined: boolean;
  joinChallenge: () => Promise<boolean>;
}

export function useRunningBitcoin(): UseRunningBitcoinResult {
  const [leaderboard, setLeaderboard] = useState<RunningBitcoinLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPubkey, setCurrentUserPubkey] = useState<string | undefined>();
  const [hasJoined, setHasJoined] = useState(false);
  const isMounted = useRef(true);

  // Fetch user pubkey and join status on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const pubkey = await AsyncStorage.getItem('@runstr:hex_pubkey');
      if (pubkey && isMounted.current) {
        setCurrentUserPubkey(pubkey);
        const joined = await RunningBitcoinService.hasJoined(pubkey);
        if (isMounted.current) {
          setHasJoined(joined);
        }
      }
    };
    fetchUserInfo();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Main effect: Fetch leaderboard from Supabase via service
  useEffect(() => {
    isMounted.current = true;

    const fetchLeaderboard = async () => {
      const t0 = Date.now();
      console.log(`[useRunningBitcoin] ========== SUPABASE FETCH ==========`);

      try {
        const data = await RunningBitcoinService.getLeaderboard();
        if (isMounted.current) {
          setLeaderboard(data);
          console.log(
            `[useRunningBitcoin] ✅ Loaded in ${Date.now() - t0}ms: ` +
            `${data.participants.length} participants, ${data.finishers.length} finishers`
          );
        }
      } catch (err) {
        console.error(`[useRunningBitcoin] Fetch error:`, err);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Pull-to-refresh: Re-fetch from Supabase
  const refreshAll = useCallback(async () => {
    const t0 = Date.now();
    console.log(`[useRunningBitcoin] ========== REFRESH START ==========`);
    setIsLoading(true);

    try {
      // Force refresh by invalidating cache in the service
      const data = await RunningBitcoinService.getLeaderboard(true);
      if (isMounted.current) {
        setLeaderboard(data);
        console.log(
          `[useRunningBitcoin] ✅ Refreshed in ${Date.now() - t0}ms: ` +
          `${data.participants.length} participants`
        );
      }
    } catch (error) {
      console.error('[useRunningBitcoin] Refresh error:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Join challenge handler
  const joinChallenge = useCallback(async () => {
    if (!currentUserPubkey) return false;

    const success = await RunningBitcoinService.joinChallenge(currentUserPubkey);
    if (success && isMounted.current) {
      setHasJoined(true);
      await refreshAll();
    }
    return success;
  }, [currentUserPubkey, refreshAll]);

  return {
    leaderboard,
    isLoading,
    refreshAll,
    currentUserPubkey,
    hasJoined,
    joinChallenge,
  };
}

export default useRunningBitcoin;
