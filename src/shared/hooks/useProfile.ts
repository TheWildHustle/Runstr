import { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { ndk, PublicKey } from 'irisdb-nostr';
import { useEffect, useMemo, useState } from 'react';

export default function useProfile(pubKey?: string) {
  const [profile, setProfile] = useState<NDKUserProfile | null>(null);

  const pubKeyHex = useMemo(() => {
    if (!pubKey) {
      return '';
    }
    return new PublicKey(pubKey).toString();
  }, [pubKey]);

  useEffect(() => {
    if (!pubKeyHex) {
      return;
    }
    const sub = ndk().subscribe(
      { kinds: [0], authors: [pubKeyHex] },
      { closeOnEose: false },
      undefined,
      true,
    );
    let latest = 0;
    sub.on('event', (event: NDKEvent) => {
      if (event.pubkey === pubKeyHex && event.kind === 0) {
        if (!event.created_at || event.created_at <= latest) {
          return;
        }
        latest = event.created_at;
        const profile = JSON.parse(event.content);
        setProfile(profile);
      }
    });
    return () => {
      sub.stop();
    };
  }, [pubKeyHex]);

  return profile;
}
