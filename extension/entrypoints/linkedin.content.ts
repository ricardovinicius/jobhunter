import { extractLinkedInJobData } from "@/lib/linkedin";


export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  main() {
    console.log('[JobHunter] Content script running.');
    console.log('[JobHunter] Waiting for job scrape command...');

    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.command === 'SCRAPE_DATA') {
        console.log('[JobHunter] Scrape command received.');
        try {
          const data = await extractLinkedInJobData();
          console.log('[JobHunter] LinkedIn Data extracted:', data);

          sendResponse(data);
        } catch (error) {
          console.error('[JobHunter] Error extracting data:', error);

          sendResponse({ success: false, error: error });
        }
      }
    });
  },
});
