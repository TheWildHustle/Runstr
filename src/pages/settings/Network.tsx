import { RiDeleteBinLine } from '@remixicon/react';
import { useLocalState } from 'irisdb-hooks';
import { DEFAULT_RELAYS, ndk as getNdk } from 'irisdb-nostr';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import Show from '@/shared/components/Show.tsx';

export function Network() {
  const ndk = getNdk();
  const [ndkRelays, setNdkRelays] = useState(new Map(ndk.pool.relays));
  const [connectToRelayUrls, setConnectToRelayUrls] = useLocalState(
    'user/relays',
    Array.from(ndk.pool.relays.keys()),
  );
  const [newRelayUrl, setNewRelayUrl] = useState('');

  useEffect(() => {
    const updateRelays = () => {
      setNdkRelays(new Map(ndk.pool.relays));
    };
    updateRelays();
    const interval = setInterval(updateRelays, 1000);
    return () => clearInterval(interval);
  }, []);

  const addRelay = (e: FormEvent) => {
    e.preventDefault();
    let url = newRelayUrl.trim();
    if (!url) return;
    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      url = `wss://${url}`;
    }
    setConnectToRelayUrls([...(connectToRelayUrls || []), url]);
    setNewRelayUrl('');
  };

  const removeRelay = (url: string) => {
    setConnectToRelayUrls(
      (connectToRelayUrls || Array.from(ndkRelays.keys())).filter((u) => u !== url),
    );
  };

  const resetDefaults = () => {
    setConnectToRelayUrls(DEFAULT_RELAYS);
  };

  const hasDefaultRelays = useMemo(
    () =>
      connectToRelayUrls?.every((url) => DEFAULT_RELAYS.includes(url)) &&
      connectToRelayUrls?.length === DEFAULT_RELAYS.length,
    [connectToRelayUrls],
  );

  return (
    <div className="mb-4">
      <h2 className="text-2xl mb-4">Network</h2>
      <div className="divide-y divide-base-300">
        {connectToRelayUrls?.map((url) => {
          const relay = ndkRelays.get(url);
          return (
            <div key={url} className="py-2 flex justify-between items-center">
              <span className="text-lg font-medium">{url.replace('wss://', '')}</span>
              <div className="flex items-center gap-4">
                <RiDeleteBinLine className="cursor-pointer" onClick={() => removeRelay(url)} />
                <span
                  className={`badge ${relay?.status === 1 ? 'badge-success' : 'badge-error'}`}
                ></span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <form onSubmit={addRelay}>
          <input
            type="text"
            placeholder="Add relay"
            className="input input-bordered w-full max-w-xs"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
          />
          <button className="btn btn-primary ml-2">Add Relay</button>
        </form>
      </div>
      <Show when={!hasDefaultRelays}>
        <div className="mt-4">
          <button className="btn btn-secondary" onClick={resetDefaults}>
            Reset to defaults
          </button>
        </div>
      </Show>
    </div>
  );
}
