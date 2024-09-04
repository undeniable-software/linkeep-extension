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

const API_URL = `${import.meta.env.VITE_LINKEEP_API_URL}/subscription-check`;
const SUCCESS_MESSAGE = 'Save successful!';
const FAILURE_MESSAGE = 'Save failed. Please try again.';
const FEATURE_FLAG_INTENT = false;

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

const subscriptionCheck = async (token: string) => {
  interface SubscriptionCheckResponse {
    isSubscribed: boolean;
  }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data: SubscriptionCheckResponse = await response.json();
  return data.isSubscribed;
};

const MainView = () => {
  const { getToken } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [formState, setFormState] = useState({
    showInput: false,
    intent: '',
    link: '',
    mode: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const checkSubscription = async () => {
    const token = await getToken?.();
    if (token) {
      const subscribed = await subscriptionCheck(token);
      setIsSubscribed(subscribed);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [getToken]);

  function handleButtonClick(mode: string) {
    setFormState((prevState) => ({
      ...prevState,
      showInput: true,
      mode,
    }));
  }

  function handleBackButtonClick() {
    setFormState({
      showInput: false,
      intent: '',
      link: '',
      mode: '',
    });
    setStatusMessage('');
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  async function handleSubmit() {
    try {
      const token = await getToken();

      const message: SaveMessage = {
        mode: formState.mode === 'link' ? 'urlProvided' : 'currentPage',
        URL: formState.mode === 'link' ? formState.link : undefined,
        intent: FEATURE_FLAG_INTENT ? formState.intent : undefined,
      };

      const response = await browser.runtime.sendMessage({ ...message, token });

      if (response) {
        setStatusMessage(SUCCESS_MESSAGE);
        setIsSuccess(true);
      } else {
        setStatusMessage(FAILURE_MESSAGE);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage(FAILURE_MESSAGE);
      setIsSuccess(false);
    } finally {
      setFormState({
        showInput: false,
        intent: '',
        link: '',
        mode: '',
      });
    }
  }

  return isSubscribed ? (
    <div className="space-y-4">
      <CardDescription className="text-xs text-center">
        {FEATURE_FLAG_INTENT
          ? 'Save this page or a link with a note about why to help Linkeep organize it for you.'
          : 'Save this page or a link so Linkeep can organize it for you.'}
      </CardDescription>
      {!formState.showInput ? (
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
                value={formState.intent}
                onChange={handleInputChange}
              />
            </div>
          )}
          {formState.mode === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="link">Enter URL</Label>
              <Input
                id="link"
                placeholder="https://example.com"
                value={formState.link}
                onChange={handleInputChange}
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
