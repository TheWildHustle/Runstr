import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import config from '@/config.json';
import CanvasPage from '@/pages/canvas';
import ChatPage from '@/pages/chat';
import DocsPage from '@/pages/document';
import Explorer from '@/pages/explorer/Explorer';
import CreateIris from '@/pages/home';
import SettingsPage from '@/pages/settings';
import Subscribe from '@/pages/subscription';
import UserPage from '@/pages/user';
import Layout from '@/shared/components/Layout';


export const router = createBrowserRouter(
  createRoutesFromElements([
    <Route element={<Layout />}>
      <Route path="/" element={config.isCreateIris ? <CreateIris /> : <DocsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/user/:pubKey" element={<UserPage />} />
      <Route path="/explorer/:file?" element={<Explorer />} />
      <Route path="/subscribe" element={<Subscribe />} />
      <Route path="/canvas/:file?" element={<CanvasPage />} />
      <Route path="/document/:file?" element={<DocsPage />} />
      <Route path="/chat/:id?" element={<ChatPage />} />
      <Route path="/create-iris" element={<CreateIris />} />
      <Route path="/run" element={<RunPage />} />
    </Route>,
  ]),
);
