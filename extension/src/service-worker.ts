import { PromiseRejector } from '@consy/declarations';

function getActiveTab(): Promise<chrome.tabs.Tab> {
  return new Promise((resolve: PromiseRejector<chrome.tabs.Tab>, reject: PromiseRejector<Error>) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const firstActiveTab: chrome.tabs.Tab | undefined = tabs[0];
      if (firstActiveTab === undefined) {
        return reject(new Error('No active tab found'));
      }

      resolve(firstActiveTab);
    });
  });
}

Promise.resolve()
  .then(async () => {
    const { id: tabId, url: activeTabUrl }: chrome.tabs.Tab = await getActiveTab();

    if (activeTabUrl === undefined || activeTabUrl.startsWith('chrome://')) {
      return;
    }

    if (tabId === undefined) {
      throw new Error('No active tab ID found');
    }

    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: () => {
        console.log('injected script');
      }
    });
    console.log('script injected in all frames');
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Unknown error');
  });
