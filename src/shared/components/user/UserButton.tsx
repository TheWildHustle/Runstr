import { RiLoginBoxLine } from '@remixicon/react';
import { useLocalState } from 'irisdb-hooks';
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import Show from '@/shared/components/Show.tsx';
import { Avatar } from '@/shared/components/user/Avatar.tsx';
import LoginDialog from '@/shared/components/user/LoginDialog.tsx';

export default function UserButton() {
  const [pubKey] = useLocalState('user/publicKey', '', String);
  const userModal = useRef<HTMLDialogElement>(null);
  const location = useLocation();

  const showModal = useCallback(() => {
    userModal.current?.showModal();
  }, []);

  useEffect(() => {
    userModal.current?.close();
  }, [pubKey, location]);

  return (
    <>
      <Show when={!!pubKey}>
        <div className="rounded-full cursor-pointer" onClick={showModal}>
          <Avatar pubKey={pubKey} showBadge={false} />
        </div>
      </Show>
      <Show when={!pubKey}>
        <div>
          <button className="btn btn-primary" onClick={showModal}>
            <RiLoginBoxLine className="w-6 h-6" />
            <span className="hidden sm:inline-block">Sign in</span>
          </button>
        </div>
      </Show>
      <dialog ref={userModal} className="modal">
        <div className="modal-box">
          <LoginDialog />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
