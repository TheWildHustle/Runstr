import { RiDeleteBinLine, RiEmojiStickerLine } from '@remixicon/react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { usePublicGroupState } from 'irisdb-hooks';
import { publicState } from 'irisdb-nostr';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatMessage } from '@/shared/components/chat/Chat.tsx';
import { RelativeTime } from '@/shared/components/RelativeTime.tsx';
import { UserRow } from '@/shared/components/user/UserRow.tsx';

export function MessageComponent({
  msg,
  path,
  chatPath,
  myNpub,
  authors,
}: {
  msg: ChatMessage;
  path: string;
  chatPath: string;
  myNpub: string;
  authors: string[];
}) {
  const isMine = msg.author === myNpub;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReaction] = usePublicGroupState(
    authors,
    `${chatPath}/reactions/${encodeURIComponent(path)}`,
    (val) => String(val).slice(0, 2),
  );

  useEffect(() => {
    // if showEmojiPicker is true, add handler to close on esc
    if (showEmojiPicker) {
      const escHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowEmojiPicker(false);
      };
      window.addEventListener('keydown', escHandler);
      return () => window.removeEventListener('keydown', escHandler);
    }
  }, [showEmojiPicker]);

  function onDelete() {
    const truncated = msg.content.length > 20 ? msg.content.slice(0, 20) + '...' : msg.content;
    if (confirm(`Delete message "${truncated}"?`)) {
      // TODO make put() handle paths beginning with "npub" so we don't need to split here
      publicState([]).get(path.split('/').slice(1).join('/')).put(null);
    }
  }

  if (!msg.content) return null;

  return (
    <div className="flex flex-col mb-4 p-2 bg-base-100 rounded-md gap-2">
      <div className="flex items-start justify-between">
        <div className="text-sm font-bold">
          <Link to={`/user/${msg.author}`}>
            <UserRow pubKey={msg.author} />
          </Link>
        </div>
        <div className="text-xs flex flex-row items-center gap-4">
          <span className="cursor-pointer" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <RiEmojiStickerLine className="w-4 h-4" />
          </span>
          {isMine && (
            <span className="cursor-pointer" onClick={onDelete}>
              <RiDeleteBinLine className="w-4 h-4" />
            </span>
          )}
          <RelativeTime time={msg.time} />
        </div>
      </div>
      <div className="text-sm">{msg.content}</div>
      <div className="flex flex-row items-center justify-end">
        <div
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="cursor-pointer flex gap-1"
        >
          {Array.from(reactions.entries()).map(([path, reaction]) => {
            if (!reaction || path.indexOf('npub') !== 0) return null;
            return <span>{reaction}</span>;
          })}
        </div>
      </div>

      {showEmojiPicker && (
        <dialog id="my_modal_3" className="modal modal-open">
          <div className="modal-box flex flex-col gap-4 items-center justify-center">
            {myNpub && (
              <EmojiPicker
                reactionsDefaultOpen={true}
                theme={Theme.AUTO}
                onEmojiClick={(e) => {
                  setReaction(e.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            )}
            {Array.from(reactions.entries()).map(([path, reaction]) => {
              const pubKey = path.split('/')[0];
              if (!reaction || pubKey.indexOf('npub') !== 0) return null;
              return (
                <div className="flex flex-1 w-full flex-row gap-4 justify-between items-center">
                  <div key={path} className="flex flex-row gap-4 items-center">
                    <span>{reaction}</span>
                    <UserRow pubKey={pubKey} />
                  </div>
                  <button
                    className="btn btn-neutral cursor-pointer"
                    onClick={() => setReaction('')}
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowEmojiPicker(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
