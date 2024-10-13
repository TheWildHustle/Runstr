import classNames from 'classnames';
import { useLocalState } from 'irisdb-hooks';
import { PublicKey, publicState } from 'irisdb-nostr';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { UserRow } from '@/shared/components/user/UserRow';
import { searchIndex, SearchResult } from '@/utils/socialGraph';

export const AddUserForm = ({ file, authors }: { file: string; authors: string[] }) => {
  const [myPubKey] = useLocalState('user/publicKey', '', String);
  const [userToAdd, setUserToAdd] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeResult, setActiveResult] = useState<number>(0);

  const userToAddValid = useMemo(() => {
    if (userToAdd === myPubKey) return false;
    try {
      new PublicKey(userToAdd);
      return true;
    } catch {
      return false;
    }
  }, [userToAdd, myPubKey]);

  useEffect(() => {
    if (userToAdd && !userToAddValid) {
      const results = searchIndex.search(userToAdd);
      console.log('results', results);
      setActiveResult(0);
      setSearchResults(
        results.map((result) => result.item).filter((result) => !authors.includes(result.pubKey)),
      );
    } else {
      setSearchResults([]);
    }
  }, [userToAdd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveResult((activeResult + 1) % searchResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveResult((activeResult - 1 + searchResults.length) % searchResults.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function addWriteAccess(pubKey: string) {
    publicState(myPubKey).get(`${file}/writers/${pubKey}`).put(true);
    setUserToAdd('');
    setSearchResults([]);
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (userToAddValid) {
      addWriteAccess(userToAdd);
    } else if (searchResults.length) {
      addWriteAccess(searchResults[activeResult].pubKey);
    }
  };

  // Simplified click handler directly on <li> elements
  const handleSearchResultClick = (pubKey: string) => {
    addWriteAccess(pubKey);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="dropdown dropdown-open">
        <input
          type="text"
          className={classNames('input input-bordered w-full', {
            'input-success': userToAdd && userToAddValid,
            'text-xs': !!userToAdd,
            'input-primary': userToAddValid,
          })}
          placeholder="Add people (search or paste public key)"
          value={userToAdd}
          onChange={(e) => setUserToAdd(e.target.value)}
        />
        {searchResults.length > 0 && (
          <ul className="dropdown-content menu shadow bg-base-300 rounded-box w-52 z-10 w-full">
            {searchResults.map((result, index) => (
              <li
                key={result.pubKey}
                className={classNames('cursor-pointer rounded-md', {
                  'bg-base-100': index === activeResult,
                })}
                onClick={() => handleSearchResultClick(result.pubKey)}
              >
                <UserRow pubKey={result.pubKey} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {userToAdd && userToAddValid && <UserRow pubKey={userToAdd} description="Write access" />}
      <button className={classNames('btn btn-primary', { hidden: !userToAddValid })} type="submit">
        Add write access
      </button>
    </form>
  );
};
