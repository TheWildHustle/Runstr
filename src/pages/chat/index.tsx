import { RiArrowLeftLine } from '@remixicon/react';
import classNames from 'classnames';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ChatList } from '@/pages/chat/ChatList.tsx';
import Chat from '@/shared/components/chat/Chat.tsx';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newChatId, setNewChatId] = useState('');

  const displayCreateChat = id === 'new' || !id;
  const displayCreateChatMobile = id === 'new';
  const displayChat = !displayCreateChat;
  const displayChatListMobile = !id;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newChatId) return;
    navigate(`/chat/${newChatId}`);
    setNewChatId('');
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const sanitizedInput = e.target.value
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setNewChatId(sanitizedInput);
  }

  return (
    <div className="flex flex-row flex-1">
      <div
        className={classNames('flex flex-col gap-4 flex-1 md:flex-none md:w-60', {
          'hidden md:flex': !displayChatListMobile,
        })}
      >
        <ChatList />
      </div>
      <div className={classNames('flex flex-col flex-1 p-4 gap-4', { 'hidden md:flex': !id })}>
        <div className="flex flex-row gap-2 items-center justify-between">
          <Link to="/chat" className="text-lg md:hidden">
            <RiArrowLeftLine className="w-6 h-6" />
          </Link>
          <div className="text-2xl font-bold">{displayCreateChat ? 'New chat' : `#${id}`}</div>
        </div>
        {displayChat && (
          <div className="flex flex-1 flex-col gap-4">
            <Chat path={`apps/chat/chats/${id}`} />
          </div>
        )}
        {displayCreateChat && (
          <div
            className={classNames('flex-1 flex flex-col gap-4', {
              'hidden md:flex': !displayCreateChatMobile,
            })}
          >
            <form className="text-2xl items-center flex flex-row gap-2" onSubmit={onSubmit}>
              #{' '}
              <input
                type="text"
                className="input input-primary"
                value={newChatId}
                onChange={onChange}
                placeholder="new-chat"
              />
              <button className="btn btn-primary">Create chat</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
