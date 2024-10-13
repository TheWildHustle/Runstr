import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useLocalState } from 'irisdb-hooks';
import { ndk, PublicKey } from 'irisdb-nostr';
import { useMemo, useState } from 'react';

import socialGraph from '@/utils/socialGraph.ts';

export function FollowButton({ pubKey }: { pubKey: string }) {
  const [myPubKey] = useLocalState('user/publicKey', '', String);
  const [isHovering, setIsHovering] = useState(false);
  const [, setUpdated] = useState(0);
  const pubKeyHex = useMemo(() => pubKey && new PublicKey(pubKey).toString(), [pubKey]);
  const isFollowing = myPubKey && socialGraph.isFollowing(myPubKey, pubKeyHex);

  if (!pubKeyHex || pubKeyHex === myPubKey) {
    return null;
  }

  const handleClick = () => {
    const event = new NDKEvent(ndk());
    event.kind = 3;
    const followedUsers = socialGraph.getFollowedByUser(myPubKey);
    if (isFollowing) {
      followedUsers.delete(pubKeyHex);
    } else {
      followedUsers.add(pubKeyHex);
    }
    event.tags = Array.from(followedUsers).map((pubKey) => ['p', pubKey]);
    event.publish();
    setTimeout(() => {
      setUpdated((updated) => updated + 1);
    }, 1000);
  };

  // text should be Follow or Following. if Following, on hover it should say Unfollow
  const text = isFollowing ? (isHovering ? 'Unfollow' : 'Following') : 'Follow';
  const className = isFollowing ? (isHovering ? 'btn-secondary' : 'btn-success') : 'btn-primary';

  return (
    <button
      className={`btn btn-sm ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {text}
    </button>
  );
}
