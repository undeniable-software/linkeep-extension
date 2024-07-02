export interface SaveMessage {
  mode: string;
  URL?: string;
}

export default defineBackground(async () => {
  browser.runtime.onMessage.addListener(async (message: SaveMessage) => {
    try {
      switch (message.mode) {
        case 'currentPage': {
          const URL = await getCurrentTabURL();
          if (URL) {
            console.log(URL);
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
            console.log(URL);
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
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
});

async function getCurrentTabURL() {
  try {
    const tab = await browser.tabs.query({});
    if (tab.length === 0 || !tab[0].url) {
      throw new Error('No active tab or URL found.');
    }
    return parseURL(tab[0].url);
  } catch (error) {
    console.error('Error getting current tab URL:', error);
    return null;
  }
}

function parseURL(url: string): URL {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return new URL(url);
  } catch (error) {
    throw new Error('Invalid URL, Error: ' + error);
  }
}

function sendToClassifcationAPI(URL: URL) {
  // Send URL to classification API
  // Return classification
}
