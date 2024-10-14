import { ndk } from 'irisdb-nostr';
import ReactDOM from 'react-dom/client';
import React from 'react';
import 'leaflet/dist/leaflet.css';

import { App } from '@/app';
import config from '@/config.json';

const RELAY_URLS = [
  'wss://nostr-01.bolt.observer/',
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.current.fyi'
];

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const initNDK = async (retryCount = 0) => {
  if (ndk.isInitialized()) {
    console.log('NDK already initialized');
    return;
  }

  try {
    await ndk({
      explicitRelayUrls: RELAY_URLS
    });
    console.log('NDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize NDK:', error);

    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying in ${delay / 1000} seconds...`);
      setTimeout(() => initNDK(retryCount + 1), delay);
    } else {
      console.error('Max retries reached. Unable to initialize NDK.');
      // You might want to show an error message to the user here
    }
  }
};

initNDK();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.title = config.appTitle;