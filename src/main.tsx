import { ndk } from 'irisdb-nostr';
import ReactDOM from 'react-dom/client';
import React from 'react';

import { App } from '@/app';
import config from '@/config.json';
import RunTracker from './RunTracker.tsx';

ndk(); // init NDK & irisdb login flow

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <RunTracker />
    </App>
  </React.StrictMode>
);

document.title = config.appTitle;
