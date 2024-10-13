import { useLocalState } from 'irisdb-hooks';
import { publicState } from 'irisdb-nostr';
import { nip19 } from 'nostr-tools';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '@/shared/components/user/Avatar.tsx';

interface ViewingUsersProps {
  file: string;
  authors: string[];
}

export function ViewingUsers({ file, authors }: ViewingUsersProps) {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const myNpub = useMemo(() => (myPubKey ? nip19.npubEncode(myPubKey) : ''), [myPubKey]);
  const [viewingUsers, setViewingUsers] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const node = publicState(authors).get(file).get('viewing');

    return node.forEach((isViewing, nodePath, updatedAt) => {
      if (typeof nodePath !== 'string' || !updatedAt) return;
      const user = nodePath.split('/')[0];
      if (!user) return;
      if (user === myNpub) return;
      const existing = viewingUsers.get(user);
      if (existing && existing > updatedAt) return;
      // updatedAt must be at most 30s old. make a timer to remove the user when 30s has elapsed from updatedAt
      const now = Date.now();
      const elapsed = now - updatedAt;
      setViewingUsers((prev) => {
        const next = new Map(prev);
        if (!isViewing || elapsed > 30000) {
          next.delete(user);
        } else {
          next.set(user, updatedAt);
        }
        return next;
      });
    });
  }, [file, authors, myPubKey]);

  useEffect(() => {
    const setViewing = (isViewing = true) => {
      if (!myPubKey) return;
      const expiresAt = Date.now() + 30000;
      publicState(authors)
        .get(file)
        .get('viewing')
        .get(String(myNpub))
        .put(isViewing, undefined, expiresAt);
    };
    setViewing();
    const updateInterval = setInterval(setViewing, 10000);
    const removeInterval = setInterval(() => {
      setViewingUsers((prev) => {
        const next = new Map(prev);
        const now = Date.now();
        for (const [user, updatedAt] of prev) {
          if (now - updatedAt > 30000) {
            next.delete(user);
          }
        }
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(removeInterval);
      clearInterval(updateInterval);
      setViewing(false);
    };
  }, [myPubKey]);

  return (
    <div className="hidden md:flex flex-row items-center gap-2">
      {Array.from(viewingUsers.keys()).map((k) => (
        <Link to={`/user/${k}`} key={k}>
          <Avatar key={k} pubKey={k} className="w-8 h-8" />
        </Link>
      ))}
    </div>
  );
}
