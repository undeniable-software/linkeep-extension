export interface SaveMessage {
  mode: string;
  URL?: string;
  intent?: string;
  token?: string;
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

export default defineBackground(async () => {
  browser.runtime.onMessage.addListener(
    async (message: SaveMessage & { token: string }, sendResponse) => {
      const { token, ...saveMessage } = message;

      try {
        let classificationResponse: ClassificationResponse | null = null;

        switch (message.mode) {
          case 'currentPage': {
            const URL = await getCurrentTabURL();
            if (URL) {
              classificationResponse = await sendToClassificationAPI(
                URL,
                token
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
                token
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
      throw new Error('No active tab or URL found.');
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
    throw new Error(`Invalid URL: ${error}`);
  }
}

async function sendToClassificationAPI(URL: URL, token: string) {
  try {
    if (!token || token === '') {
      throw new Error('Token not provided');
    }

    console.log('Sending URL to classification API:', URL.href);

    const apiUrl = import.meta.env.LINKEEP_API_URL;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: URL.href, title: URL.hostname }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to classify URL: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    // console.log(
    //   'Classification API response:',
    //   response.status,
    //   response.statusText
    // );

    const data = await response.json();
    // console.log(data);
    return data as ClassificationResponse;
  } catch (error) {
    console.error('Error in sendToClassificationAPI:', error);
    throw error;
  }
}
