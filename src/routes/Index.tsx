import { SignedIn, SignedOut, useAuth } from '@clerk/chrome-extension';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import type { SaveMessage } from '@/entries/background';
import { getSubscriptionToken, decodeToken } from '@/lib/utils';

const SUCCESS_MESSAGE = 'Save successful!';
const FAILURE_MESSAGE = 'Save failed. Please try again.';
const FEATURE_FLAG_INTENT = false;

export const Index = () => {
  return (
    <Card className="w-[300px] rounded-none shadow-none bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-extrabold tracking-tight leading-none text-center text-gray-800">
          <span role="img" aria-label="bookmark" className="mr-2 text-4xl">
            🔖
          </span>
          Linkeep
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <SignedIn>
          <MainView />
        </SignedIn>
        <SignedOut>
          <div className="space-y-4 text-center">
            <CardDescription className="text-lg text-gray-600">
              Welcome to Linkeep!
            </CardDescription>
            <p className="text-sm text-gray-500">
              To use this extension, please sign in on our website.
            </p>
            <Button
              className="w-full text-white bg-gray-800 transition-colors duration-300 hover:bg-gray-700"
              onClick={() =>
                window.open('https://mylinkeep.com/sign-in', '_blank')
              }
            >
              Sign In on Linkeep
            </Button>
          </div>
        </SignedOut>
      </CardContent>
    </Card>
  );
};

const MainView = () => {
  const { getToken } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState({
    showInput: false,
    intent: '',
    link: '',
    mode: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const getClerkAuthToken = async () => {
    const token = await getToken?.();
    return token;
  };

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const clerkAuthToken = await getClerkAuthToken();
        if (!clerkAuthToken) {
          throw new Error('Clerk auth token is null');
        }
        const token = await getSubscriptionToken(clerkAuthToken);
        const { subscriptionStatus } = decodeToken(token);
        setIsSubscribed(subscriptionStatus);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSubscription();
  }, []);

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
      const clerkAuthToken = await getClerkAuthToken();
      const message: SaveMessage = {
        mode: formState.mode === 'link' ? 'urlProvided' : 'currentPage',
        URL: formState.mode === 'link' ? formState.link : undefined,
        intent: FEATURE_FLAG_INTENT ? formState.intent : undefined,
      };
      const response = await browser.runtime.sendMessage({
        ...message,
        clerkAuthToken,
      });
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

  return isLoading ? (
    <div className="flex justify-center items-center h-24">
      <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-gray-800 animate-spin"></div>
    </div>
  ) : isSubscribed ? (
    <div className="space-y-4 text-gray-800">
      <CardDescription className="text-sm text-center text-gray-600">
        {FEATURE_FLAG_INTENT
          ? 'Save this page or a link with a note about why to help Linkeep organize it for you.'
          : 'Save this page or a link so Linkeep can organize it for you.'}
      </CardDescription>
      {!formState.showInput ? (
        <div className="space-y-2">
          <Button
            className="w-full text-white bg-gray-800 transition-colors duration-300 hover:bg-gray-700"
            onClick={() => handleButtonClick('page')}
          >
            <span role="img" aria-label="page" className="mr-2">
              💾
            </span>
            Save this Page
          </Button>
          <Button
            className="w-full text-white bg-gray-800 transition-colors duration-300 hover:bg-gray-700"
            onClick={() => handleButtonClick('link')}
          >
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
              <Label htmlFor="intent" className="text-gray-700">
                Why are you saving this?
              </Label>
              <Input
                id="intent"
                placeholder="Enter your intent..."
                value={formState.intent}
                onChange={handleInputChange}
                className="placeholder-gray-500 text-gray-800 bg-gray-100 border-gray-300"
              />
            </div>
          )}
          {formState.mode === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="link" className="text-gray-700">
                Enter URL
              </Label>
              <Input
                id="link"
                placeholder="https://example.com"
                value={formState.link}
                onChange={handleInputChange}
                className="placeholder-gray-500 text-gray-800 bg-gray-100 border-gray-300"
              />
            </div>
          )}
          <div className="flex justify-between">
            <Button
              size="sm"
              onClick={handleSubmit}
              className="text-white bg-gray-800 hover:bg-gray-700"
            >
              <span role="img" aria-label="save" className="mr-2">
                💾
              </span>
              Save Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBackButtonClick}
              className="text-gray-800 border-gray-300 hover:bg-gray-100"
            >
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
          className={`p-2 text-sm text-center rounded-md ${
            isSuccess
              ? 'text-green-800 bg-green-100'
              : 'text-red-800 bg-red-100'
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-4 text-center text-gray-800">
      <CardDescription className="text-sm">
        You're not subscribed to Linkeep. Please{' '}
        <a
          className="underline transition-colors duration-300 hover:text-gray-600"
          href="https://mylinkeep.com/#pricing"
          target="_blank"
          rel="noopener noreferrer"
        >
          subscribe
        </a>{' '}
        to use the extension to save links.
      </CardDescription>
    </div>
  );
};
