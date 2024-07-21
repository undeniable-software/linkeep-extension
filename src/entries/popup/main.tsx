import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

import { RouterProvider, createHashRouter } from 'react-router-dom';

// Import the layouts
import { RootLayout } from '@/layouts/root-layout.tsx';

// Import the components
import { SignInPage } from '@/routes/SignIn.tsx';
import { SignUpPage } from '@/routes/SignUp.tsx';
import { Index } from '@/routes/Index.tsx';

const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Index /> },
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
