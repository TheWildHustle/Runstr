import { RiLinkM, RiThunderstormsFill } from '@remixicon/react';
import classNames from 'classnames';
import { useLocalState } from 'irisdb-hooks';
import { PublicKey } from 'irisdb-nostr';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { FollowButton } from '@/shared/components/button/FollowButton.tsx';
import { Avatar } from '@/shared/components/user/Avatar.tsx';
import { Name } from '@/shared/components/user/Name.tsx';
import useProfile from '@/shared/hooks/useProfile.ts';

export default function UserPage() {
  const { pubKey } = useParams();

  const profile = useProfile(pubKey);

  const pubKeyHex = useMemo(() => {
    if (!pubKey) {
      return '';
    }
    return new PublicKey(pubKey).toString();
  }, [pubKey]);

  const [myPubKey] = useLocalState('user/publicKey', '', String);

  if (!pubKey) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col gap-4 w-full max-w-prose bg-base-100">
        {profile?.banner && (
          <img src={profile.banner} className="w-full h-48 object-cover" alt="Banner" />
        )}
        <div className={classNames('flex flex-col gap-4 p-4', { '-mt-16': profile?.banner })}>
          <div className="flex flex-row items-center gap-8 mt-4 justify-between">
            <Avatar pubKey={pubKey} showBadge={false} className="w-24 h-24" />
            {myPubKey && myPubKey === pubKeyHex ? (
              <Link to="/settings" className="btn btn-sm btn-primary">
                Edit profile
              </Link>
            ) : (
              <FollowButton pubKey={pubKey} />
            )}
          </div>
          <div className="text-2xl font-bold">
            <Name pubKey={pubKey} />
          </div>
          {profile?.about && <div className="text-base-content">{profile.about}</div>}
          <ul className="flex flex-col gap-2">
            {profile?.website && (
              <li className="flex flex-row items-center gap-2">
                <RiLinkM className="w-6 h-6 inline-block" />
                <a href={profile.website} target="_blank" rel="noreferrer" className="link">
                  {profile.website.replace('https://', '').replace('http://', '')}
                </a>
              </li>
            )}
            {(profile?.lud06 || profile?.lud16) && (
              <li className="flex flex-row items-center gap-2">
                <RiThunderstormsFill className="w-6 h-6 inline-block" />
                <a
                  href={`lightning:${profile.lud06 || profile.lud16}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link"
                >
                  {profile.lud06 || profile.lud16}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
