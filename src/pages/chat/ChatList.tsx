import classNames from 'classnames';
import { useAuthors, usePublicState } from 'irisdb-hooks';
import { Link, useParams } from 'react-router-dom';

export function ChatList() {
  const { id } = useParams();
  const authors = useAuthors('follows');
  const [chats] = usePublicState(authors, 'apps/chat/chats', {});

  return (
    <div className="flex flex-col bg-base-100 h-full border-r border-r-base-300">
      <Link
        to={`/chat/new`}
        className={classNames('text-lg px-4 py-2', {
          'font-bold': !id || id === 'new',
          'bg-base-200': !id || id === 'new',
          'hover:bg-base-200': id !== 'new',
        })}
      >
        New chat
      </Link>
      {Object.keys(chats).map((chatId) => (
        <Link
          key={chatId}
          to={`/chat/${chatId}`}
          className={classNames('text-lg px-4 py-2', {
            'font-bold': id === chatId,
            'bg-base-200': id === chatId,
            'hover:bg-base-200': id !== chatId,
          })}
        >
          #{chatId}
        </Link>
      ))}
    </div>
  );
}
