import { useAuthors, useLocalState } from 'irisdb-hooks';
import { publicState } from 'irisdb-nostr';
import { nip19 } from 'nostr-tools';
import { useEffect, useMemo, useState } from 'react';

import { MessageComponent } from '@/shared/components/chat/MessageComponent.tsx';

export type ChatMessage = {
  author: string;
  time: number;
  content: string;
};

export default function Chat({ path }: { path: string }) {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const [messages, setMessages] = useState<Map<string, ChatMessage>>(new Map());
  const [newMessage, setNewMessage] = useState('');
  const myNpub = useMemo(() => (myPubKey ? nip19.npubEncode(myPubKey) : ''), [myPubKey]);

  const authors = useAuthors('follows');

  useEffect(() => {
    if (!myPubKey) return;
    setMessages(new Map());
    return publicState(authors)
      .get(`${path}/messages`)
      .forEach((msg, key, updatedAt) => {
        if (!updatedAt) return;
        if (!msg) {
          setMessages((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
          return;
        }
        const author = key.split('/')[0];
        const content = String(msg);
        setMessages((prev) => new Map(prev.set(key, { author, time: updatedAt, content })));
      });
  }, [myPubKey, authors, path]);

  if (!myPubKey) {
    return <div className="flex items-center justify-center h-full">Please sign in to chat.</div>;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage) return;
    publicState(authors).get(`${path}/messages/${new Date().toISOString()}`).put(newMessage);
    setNewMessage('');
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <form className="flex items-center" onSubmit={onSubmit}>
        <input
          type="text"
          className="input input-primary flex-grow mr-2"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="btn btn-primary">Send</button>
      </form>
      <div className="flex-grow overflow-y-auto gap-2">
        {Array.from(messages.entries())
          .sort((a, b) => b[1].time - a[1].time)
          .map((msg) => (
            <MessageComponent
              key={msg[0]}
              chatPath={path}
              path={msg[0]}
              msg={msg[1]}
              myNpub={myNpub}
              authors={authors}
            />
          ))}
      </div>
    </div>
  );
}
