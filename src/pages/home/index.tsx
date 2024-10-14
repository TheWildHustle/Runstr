import { Link } from 'react-router-dom';
import config from '@/config.json';

export default function Home() {
  return (
    <div className="prose p-4 md:p-8 max-w-[768px] mx-auto">
      <h1>
        Welcome to <code>{config.appTitle}</code>
      </h1>
      <p>
        Runstr is a running app built on Nostr.
      </p>
      <p>
        Key Features:
      </p>
      <ul>
        <li>Start and track runs</li>
        <li>Create and join run clubs</li>
        <li>Create and join run competitions</li>
        <li>Listen to popular wavlake playlists from the app</li>
        <li>Run to earn sats and badges</li>
        <li>Easily share runs across the nostr ecosystem</li>
        <li>Private and public run group chats</li>
        <li>AI running coaches</li>
      </ul>
      <p>
        <Link to="/run" className="btn btn-primary">Start Running</Link>
      </p>
    </div>
  );
}