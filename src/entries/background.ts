export interface SaveMessage {
  mode: string;
  URL?: string;
  intent?: string;
  clerkAuthToken?: string;
}

interface ClassificationResponse {
  data: {
    classification: string;
    suggestions: string[];
    title: string;
    url: string;
  };
  success: boolean;
}

class URLRetrievalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'URLRetrievalError';
  }
}

class ClassificationAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClassificationAPIError';
  }
}

import { getSubscriptionToken } from '@/lib/utils';

export default defineBackground(async () => {
  browser.runtime.onMessage.addListener(
    async (message: SaveMessage & { clerkAuthToken: string }, sendResponse) => {
      const { clerkAuthToken, ...saveMessage } = message;
      await getSubscriptionToken(clerkAuthToken);

      try {
        let classificationResponse: ClassificationResponse | null = null;

        switch (message.mode) {
          case 'currentPage': {
            const URL = await getCurrentTabURL();
            if (URL) {
              classificationResponse = await sendToClassificationAPI(
                URL,
                clerkAuthToken
              );
            } else {
              console.error('Failed to retrieve current tab URL.');
            }
            break;
          }
          case 'urlProvided': {
            if (!message.URL) {
              console.error('URL not provided in message.');
              break;
            }
            try {
              const URL = parseURL(message.URL);
              classificationResponse = await sendToClassificationAPI(
                URL,
                clerkAuthToken
              );
            } catch (error) {
              console.error('Error parsing provided URL:', error);
            }
            break;
          }
          default: {
            console.warn('Unknown message mode:', message.mode);
            break;
          }
        }

        if (classificationResponse) {
          return classificationResponse.success;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error handling message:', error);
        return false;
      }
    }
  );
});

async function getCurrentTabURL(): Promise<URL | null> {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length === 0 || !tabs[0].url) {
      throw new URLRetrievalError('No active tab or URL found.');
    }
    return parseURL(tabs[0].url);
  } catch (error) {
    console.error('Error getting current tab URL:', error);
    return null;
  }
}

function parseURL(url: string): URL {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  try {
    return new URL(url);
  } catch (error) {
    throw new URLRetrievalError(`Invalid URL: ${error}`);
  }
}

async function sendToClassificationAPI(
  URL: URL,
  clerkAuthToken: string
): Promise<ClassificationResponse> {
  try {
    if (!clerkAuthToken || clerkAuthToken === '') {
      throw new ClassificationAPIError('clerkAuthToken not provided');
    }

    console.log('Sending URL to classification API:', URL.href);

    const response = await fetch(
      `${import.meta.env.VITE_LINKEEP_API_URL}/classify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clerkAuthToken}`,
        },
        body: JSON.stringify({ url: URL.href }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new ClassificationAPIError(
        `Failed to classify URL: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    const data = await response.json();
    return data as ClassificationResponse;
  } catch (error) {
    console.error('Error in sendToClassificationAPI:', error);
    throw error;
  }
}
