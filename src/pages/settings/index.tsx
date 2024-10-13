import { Network } from '@/pages/settings/Network.tsx';
import { ProfileSettings } from '@/pages/settings/Profile.tsx';
import { SubscriptionTab } from '@/pages/subscription/SubscriptionTab.tsx';

export default function Settings() {
  return (
    <div className="flex flex-1 flex-col h-full items-center">
      <div className="container max-w-3xl p-4 md:p-8 my-5 bg-base-100 rounded-lg shadow">
        <h1 className="text-3xl font-semibold mb-6">Settings</h1>
        <Network />
        <ProfileSettings />
        <SubscriptionTab />
      </div>
    </div>
  );
}
