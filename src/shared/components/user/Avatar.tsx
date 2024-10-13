import { RiCheckLine } from '@remixicon/react';
import { PublicKey } from 'irisdb-nostr';
import { ndk } from 'irisdb-nostr';
import { useEffect, useMemo, useState } from 'react';

import MinidenticonImg from '@/shared/components/user/MinidenticonImg';
import socialGraph from '@/utils/socialGraph.ts';

export const Avatar = ({
  pubKey,
  className,
  showBadge = true,
}: {
  pubKey: string;
  className?: string;
  showBadge?: boolean;
}) => {
  const [image, setImage] = useState('');
  const pubKeyHex = useMemo(() => {
    if (!pubKey || pubKey === 'follows') {
      return '';
    }
    return new PublicKey(pubKey).toString();
  }, [pubKey]);

  useEffect(() => {
    setImage('');
    const fetchImage = async () => {
      if (!pubKeyHex) {
        return;
      }
      const user = ndk().getUser({ pubkey: pubKeyHex });
      const profile = await user.fetchProfile();
      if (profile && profile.image) {
        setImage(profile.image);
      }
    };

    fetchImage();
  }, [pubKeyHex]);

  const handleImageError = () => {
    setImage('');
  };

  function getBadge() {
    if (!showBadge) {
      return null;
    }
    const distance = socialGraph.getFollowDistance(pubKeyHex);
    if (distance <= 1) {
      const tooltip = distance === 0 ? 'You' : 'Following';
      return (
        <span className="indicator-item badge badge-primary aspect-square p-0" title={tooltip}>
          <RiCheckLine className="w-4 h-4" />
        </span>
      );
    }
    return null;
  }

  return (
    <div
      className={`${className || 'w-12 h-12'} rounded-full bg-base-100 flex items-center justify-center border-base-content border-2 indicator`}
    >
      {getBadge()}
      <div className="w-full rounded-full overflow-hidden aspect-square not-prose">
        {image ? (
          <img
            src={image}
            alt="User Avatar"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <MinidenticonImg username={pubKeyHex} alt="User Avatar" />
        )}
      </div>
    </div>
  );
};
