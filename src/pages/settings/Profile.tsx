import { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useLocalState, usePublicState } from 'irisdb-hooks';
import { ndk } from 'irisdb-nostr';
import { useEffect, useMemo, useState } from 'react';

import UploadButton from '@/shared/components/button/UploadButton';
import useProfile from '@/shared/hooks/useProfile';

export function ProfileSettings() {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const [, setIrisProfile] = usePublicState(myPubKey ? [myPubKey] : [], 'user/profile', null);

  const existingProfile = useProfile(myPubKey);

  const user = useMemo(() => {
    if (!myPubKey) {
      return null;
    }
    return ndk().getUser({ pubkey: myPubKey });
  }, [myPubKey]);

  const [newProfile, setNewProfile] = useState<NDKUserProfile | null>(user?.profile || null);

  useEffect(() => {
    if (existingProfile) {
      setNewProfile(existingProfile);
    }
  }, [existingProfile]);

  function setProfileField(field: keyof NDKUserProfile, value: string) {
    setNewProfile((prev) => {
      if (!prev) {
        return null;
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function onSaveProfile() {
    if (!user || !newProfile) {
      return;
    }
    user.profile = newProfile;
    console.log('save profile', newProfile);
    user.publish();
    setIrisProfile(newProfile);
  }

  const isEdited = useMemo(() => {
    if (!newProfile) {
      return false;
    }
    return JSON.stringify(newProfile) !== JSON.stringify(existingProfile);
  }, [newProfile, existingProfile]);

  if (!myPubKey) {
    return null;
  }

  console.log('existingProfile', existingProfile); // TODO something causing render loop?

  return (
    <div className="mb-4">
      <h2 className="text-2xl mb-4">Profile</h2>
      <div className="flex flex-col gap-4">
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Name</span>
          </div>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full max-w-xs"
            value={newProfile?.name}
            onChange={(e) => setProfileField('name', e.target.value)}
          />
        </label>
        {newProfile?.picture && (
          <div className="flex items-center gap-4 my-4">
            <img
              src={String(newProfile?.picture || existingProfile?.picture)}
              className="w-24 h-24 rounded-full"
              alt="Profile picture"
            />
          </div>
        )}
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Image</span>
          </div>
          <input
            type="text"
            placeholder="Image"
            className="input input-bordered w-full max-w-xs mb-4"
            value={newProfile?.picture}
            onChange={(e) => setProfileField('picture', e.target.value)}
          />
          <UploadButton text="Upload new" onUpload={(url) => setProfileField('picture', url)} />
        </label>
        {newProfile?.banner && (
          <img src={newProfile?.banner} alt="Banner" className="w-full h-48 object-cover" />
        )}
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Banner</span>
          </div>
          <input
            type="text"
            placeholder="Image"
            className="input input-bordered w-full max-w-xs mb-4"
            value={newProfile?.banner}
            onChange={(e) => setProfileField('banner', e.target.value)}
          />
          <UploadButton text="Upload new" onUpload={(url) => setProfileField('banner', url)} />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Website</span>
          </div>
          <input
            type="text"
            placeholder="Website"
            className="input input-bordered w-full max-w-xs"
            value={newProfile?.website}
            onChange={(e) => setProfileField('website', e.target.value)}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">About</span>
          </div>
          <textarea
            placeholder="About"
            className="textarea textarea-bordered w-full max-w-xs"
            value={newProfile?.about}
            onChange={(e) => setProfileField('about', e.target.value)}
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={onSaveProfile}
          disabled={!newProfile || !isEdited}
        >
          Save
        </button>
      </div>
    </div>
  );
}
