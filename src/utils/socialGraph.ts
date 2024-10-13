import { NDKSubscription, NostrEvent } from '@nostr-dev-kit/ndk';
import Fuse from 'fuse.js';
import { localState } from 'irisdb';
import { ndk, SocialGraph } from 'irisdb-nostr';

const instance = new SocialGraph('');

let sub: NDKSubscription | undefined;

export type SearchResult = {
  name: string;
  pubKey: string;
};

const latestProfileEvents = new Map<string, number>();

export const searchIndex = new Fuse<SearchResult>([], {
  keys: ['name'],
});

function getFollowedUserProfiles(myPubKey: string) {
  const followedUsers = instance.getFollowedByUser(myPubKey);
  const sub = ndk().subscribe(
    {
      kinds: [0],
      authors: Array.from(followedUsers),
    },
    { closeOnEose: true },
  );
  sub.on('event', (ev: NostrEvent) => {
    queueMicrotask(() => {
      const lastSeen = latestProfileEvents.get(ev.pubkey) || 0;
      if (ev.created_at > lastSeen) {
        latestProfileEvents.set(ev.pubkey, ev.created_at);
        try {
          const profile = JSON.parse(ev.content);
          const name = profile.name || profile.username;
          if (name) {
            // not sure if this remove is efficient?
            // should we have our internal map and reconstruct the searchIndex from it with debounce?
            searchIndex.remove((profile) => profile.pubKey === ev.pubkey);
            searchIndex.add({ name, pubKey: ev.pubkey });
          }
        } catch (e) {
          // Ignore
        }
      }
    });
  });
}

localState.get('user/publicKey').on((publicKey?: string) => {
  if (publicKey) {
    instance.setRoot(publicKey);
    sub?.stop();
    sub = ndk().subscribe({
      kinds: [3],
      authors: [publicKey],
      limit: 1,
    });
    let latestTime = 0;
    sub?.on('event', (ev) => {
      if (ev.created_at < latestTime) {
        return;
      }
      latestTime = ev.created_at;
      instance.handleEvent(ev);
      setTimeout(() => {
        getFollowedUserProfiles(publicKey);
      }, 500);
    });
  } else {
    instance.setRoot('');
  }
});

export default instance;
