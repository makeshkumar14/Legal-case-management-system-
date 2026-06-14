import { useEffect, useRef } from 'react';
import { DATA_SYNC_EVENT, DATA_SYNC_STORAGE_KEY } from '../services/api';

export function useLiveDataSync(sync, { enabled = true, intervalMs = 15000, dependencies = [] } = {}) {
  const syncRef = useRef(sync);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const runSync = async ({ silent = true } = {}) => {
      if (syncInFlightRef.current) {
        return;
      }

      syncInFlightRef.current = true;
      try {
        await syncRef.current?.({ silent });
      } catch (error) {
        console.error('Live data sync failed:', error);
      } finally {
        syncInFlightRef.current = false;
      }
    };

    const syncSilently = () => {
      void runSync({ silent: true });
    };

    const handleStorage = (event) => {
      if (event.key === DATA_SYNC_STORAGE_KEY) {
        syncSilently();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncSilently();
      }
    };

    void runSync({ silent: false });

    window.addEventListener(DATA_SYNC_EVENT, syncSilently);
    window.addEventListener('focus', syncSilently);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = intervalMs > 0
      ? window.setInterval(() => {
          if (document.visibilityState === 'visible') {
            syncSilently();
          }
        }, intervalMs)
      : null;

    return () => {
      window.removeEventListener(DATA_SYNC_EVENT, syncSilently);
      window.removeEventListener('focus', syncSilently);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [enabled, intervalMs, ...dependencies]);
}
