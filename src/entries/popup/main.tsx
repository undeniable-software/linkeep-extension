import React from 'react';
import { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

import { RouterProvider, createMemoryRouter } from 'react-router-dom';

// Import the layouts
import { RootLayout } from '@/layouts/root-layout.tsx';

// Import the components
import { Index } from '@/routes/Index.tsx';

const router = createMemoryRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full">
                Loading...
              </div>
            }
          >
            <Index />
          </Suspense>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
