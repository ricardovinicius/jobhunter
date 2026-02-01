import { useState } from "react";
import { browser } from "wxt/browser";
import type { LinkedInScrapedJobData } from "@/types";

export const useScraper = () => {
    const [data, setData] = useState<LinkedInScrapedJobData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrapeCurrentTab = async () => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) {
                throw new Error('[JobHunter] No active tab found');
            }

            const response = await browser.tabs.sendMessage(tab.id, { command: 'SCRAPE_DATA' });

            setData(response);
        } catch (error) {
            setError(error as string);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, scrapeCurrentTab };
};