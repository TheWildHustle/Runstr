import { ndk } from 'irisdb-nostr';
import ReactDOM from 'react-dom/client';
import React from 'react';

import { App } from '@/app';
import config from '@/config.json';
import RunTracker from './RunTracker.tsx';

// Initialize NDK with error handling and fallback relays
const initNDK = async () => {
  try {
    await ndk({
      explicitRelayUrls: [
        'wss://nostr-01.bolt.observer/',
        'wss://relay.damus.io',
        'wss://relay.nostr.band'
      ]
    });
    console.log('NDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize NDK:', error);
    // You might want to show an error message to the user here
  }
};

initNDK();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <RunTracker />
    </App>
  </React.StrictMode>
);

document.title = config.appTitle;