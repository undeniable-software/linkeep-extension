import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignOutButton,
} from '@clerk/chrome-extension';

import { Button } from '@/components/ui/button';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export const RootLayout = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
      signInForceRedirectUrl={'/popup.html#/sign-in'}
      signUpForceRedirectUrl={'/popup.html#/sign-up'}
    >
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <SignedIn></SignedIn>
        <SignedOut> </SignedOut>
      </footer>
    </ClerkProvider>
  );
};
