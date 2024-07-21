import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/chrome-extension';
import { useCallback } from 'react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export const RootLayout = () => {
  const navigate = useNavigate();

  // Memoize navigate functions to prevent unnecessary re-renders
  const routerPush = useCallback((to: string) => navigate(to), [navigate]);
  const routerReplace = useCallback(
    (to: string) => navigate(to, { replace: true }),
    [navigate]
  );

  return (
    <ClerkProvider
      routerPush={routerPush}
      routerReplace={routerReplace}
      publishableKey={PUBLISHABLE_KEY}
      signInForceRedirectUrl={'/popup.html#/sign-in'}
      signUpForceRedirectUrl={'/popup.html#/sign-up'}
    >
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <SignedIn>{/* Ensure SignedIn component is optimized */}</SignedIn>
        <SignedOut>{/* Ensure SignedOut component is optimized */}</SignedOut>
      </footer>
    </ClerkProvider>
  );
};
