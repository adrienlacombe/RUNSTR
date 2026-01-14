/**
 * useJanuaryWalking - Hook for January Walking Challenge
 *
 * SUPABASE ARCHITECTURE:
 * - Fetches leaderboard from Supabase via JanuaryWalkingService
 * - Fast queries (~500ms) with 5-minute cache
 * - No baseline notes needed - Supabase is the source of truth
 *
 * NOTE: This challenge tracks STEPS, not distance.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  JanuaryWalkingService,
  type JanuaryWalkingLeaderboard,
} from '../services/challenge/JanuaryWalkingService';

interface UseJanuaryWalkingResult {
  leaderboard: JanuaryWalkingLeaderboard | null;
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  currentUserPubkey: string | undefined;
}

export function useJanuaryWalking(): UseJanuaryWalkingResult {
  const [leaderboard, setLeaderboard] = useState<JanuaryWalkingLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPubkey, setCurrentUserPubkey] = useState<string | undefined>();
  const isMounted = useRef(true);

  // Fetch user pubkey on mount
  useEffect(() => {
    const fetchUserPubkey = async () => {
      const pubkey = await AsyncStorage.getItem('@runstr:hex_pubkey');
      if (pubkey && isMounted.current) {
        setCurrentUserPubkey(pubkey);
      }
    };
    fetchUserPubkey();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Main effect: Fetch leaderboard from Supabase via service
  useEffect(() => {
    isMounted.current = true;

    const fetchLeaderboard = async () => {
      const t0 = Date.now();
      console.log(`[useJanuaryWalking] ========== SUPABASE FETCH ==========`);

      try {
        const data = await JanuaryWalkingService.getLeaderboard(currentUserPubkey);
        if (isMounted.current) {
          setLeaderboard(data);
          console.log(
            `[useJanuaryWalking] ✅ Loaded in ${Date.now() - t0}ms: ` +
            `${data.participants.length} participants, ${data.totalSteps.toLocaleString()} steps total`
          );
        }
      } catch (err) {
        console.error(`[useJanuaryWalking] Fetch error:`, err);
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
  }, [currentUserPubkey]);

  // Pull-to-refresh: Re-fetch from Supabase
  const refreshAll = useCallback(async () => {
    const t0 = Date.now();
    console.log(`[useJanuaryWalking] ========== REFRESH START ==========`);
    setIsLoading(true);

    try {
      // Force refresh by invalidating cache in the service
      const data = await JanuaryWalkingService.getLeaderboard(currentUserPubkey, true);
      if (isMounted.current) {
        setLeaderboard(data);
        console.log(
          `[useJanuaryWalking] ✅ Refreshed in ${Date.now() - t0}ms: ` +
          `${data.participants.length} participants`
        );
      }
    } catch (error) {
      console.error('[useJanuaryWalking] Refresh error:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [currentUserPubkey]);

  return {
    leaderboard,
    isLoading,
    refreshAll,
    currentUserPubkey,
  };
}

export default useJanuaryWalking;
