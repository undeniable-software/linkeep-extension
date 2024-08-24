import {
  SignedIn,
  SignedOut,
  SignOutButton,
  useAuth,
} from '@clerk/chrome-extension';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import type { SaveMessage } from '@/entries/background';

export const Index = () => {
  return (
    <Card className="w-[250px] rounded-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight leading-none text-center">
          <span role="img" aria-label="bookmark" className="mr-2">
            🔖
          </span>
          Linkeep
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SignedIn>
          <MainView />
        </SignedIn>
        <SignedOut>
          <CardDescription className="mb-4 text-center">
            Please sign in or sign up to continue.
          </CardDescription>
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              onClick={() => {
                browser.tabs.create({
                  url: browser.runtime.getURL('/popup.html#/sign-in'),
                });
              }}
            >
              Sign In
            </Button>
          </div>
        </SignedOut>
      </CardContent>
      <CardFooter className="flex justify-left">
        <SignedIn>
          <SignOutButton>
            <Button size="sm" variant="outline">
              Sign Out
            </Button>
          </SignOutButton>
        </SignedIn>
      </CardFooter>
    </Card>
  );
};

const subscriptionCheck = async () => {
  interface SubscriptionCheckResponse {
    isSubscribed: boolean;
  }

  const response = await fetch(
    `${import.meta.env.VITE_LINKEEP_API_URL}/subscriptionCheck`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data: SubscriptionCheckResponse = await response.json();
  return data.isSubscribed;
};

const MainView = () => {
  const { getToken } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [link, setLink] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [intent, setIntent] = useState('');
  const [mode, setMode] = useState(''); // 'page' or 'link'
  const [statusMessage, setStatusMessage] = useState(''); // New state for status message
  const [isSuccess, setIsSuccess] = useState(false); // New state for success status

  useEffect(() => {
    const checkSubscription = async () => {
      const subscribed = await subscriptionCheck();
      setIsSubscribed(subscribed);
    };
    checkSubscription();
  }, []);

  const FEATURE_FLAG_INTENT = false; // Set to true to enable intent feature

  function handleButtonClick(mode: string) {
    setMode(mode);
    setShowInput(true);
  }

  function handleBackButtonClick() {
    setShowInput(false);
    setIntent('');
    setLink('');
    setMode('');
    setStatusMessage(''); // Clear status message on back
  }

  async function handleSubmit() {
    const token = await getToken();

    let message: SaveMessage = {
      mode: mode === 'link' ? 'urlProvided' : 'currentPage',
      URL: mode === 'link' ? link : undefined,
      intent: FEATURE_FLAG_INTENT ? intent : undefined,
    };

    try {
      const response = await browser.runtime.sendMessage({ ...message, token });
      if (response) {
        setStatusMessage('Save successful!'); // Success message
        setIsSuccess(true); // Set success status
      } else {
        setStatusMessage('Save failed. Please try again.'); // Error message
        setIsSuccess(false); // Set failure status
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage('Save failed. Please try again.'); // Error message
      setIsSuccess(false); // Set failure status
    }

    setShowInput(false);
    setIntent('');
    setLink('');
  }

  return isSubscribed ? (
    <div className="space-y-4">
      <CardDescription className="text-xs text-center">
        {FEATURE_FLAG_INTENT
          ? 'Save this page or a link with a note about why to help linkeep organize it for you.'
          : 'Save this page or a link so linkeep can organize it for you.'}
      </CardDescription>
      {!showInput ? (
        <div className="space-y-2">
          <Button className="w-full" onClick={() => handleButtonClick('page')}>
            <span role="img" aria-label="page" className="mr-2">
              💾
            </span>
            Save this Page
          </Button>
          <Button className="w-full" onClick={() => handleButtonClick('link')}>
            <span role="img" aria-label="link" className="mr-2">
              🔗
            </span>
            Save a Link
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {FEATURE_FLAG_INTENT && (
            <div className="space-y-2">
              <Label htmlFor="intent">Why are you saving this?</Label>
              <Input
                id="intent"
                placeholder="Enter your intent..."
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              />
            </div>
          )}
          {mode === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="link">Enter URL</Label>
              <Input
                id="link"
                placeholder="https://example.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          )}
          <div className="flex justify-between">
            <Button size="sm" onClick={handleSubmit}>
              <span role="img" aria-label="save" className="mr-2">
                💾
              </span>
              Save Now
            </Button>
            <Button size="sm" variant="outline" onClick={handleBackButtonClick}>
              <span role="img" aria-label="back" className="mr-1">
                🔙
              </span>
              Back
            </Button>
          </div>
        </div>
      )}
      {statusMessage && (
        <div
          className={`p-2 text-sm text-center rounded-md border ${
            isSuccess
              ? 'text-green-500 bg-green-100 border-green-500'
              : 'text-red-500 bg-red-100 border-red-500'
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-4">
      <CardDescription className="text-xs text-center">
        You're not subscribed to Linkeep. Please{' '}
        <a
          className="underline hover:text-blue-500"
          href="https://mylinkeep.com/#pricing"
          target="_blank"
        >
          subscribe
        </a>{' '}
        to use the extension to save links.
      </CardDescription>
    </div>
  );
};
