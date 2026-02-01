import { LinkedInJobMetadata, LinkedInScrapedJobData } from "@/types"
import { waitForElement } from "./utils";

const QUERY_SELECTORS = {
    JOB_TITLE: '.job-details-jobs-unified-top-card__job-title',
    JOB_COMPANY: '.job-details-jobs-unified-top-card__company-name',
    JOB_METADATA: '.job-details-jobs-unified-top-card__primary-description-container', // I am not sure about this nomenclature
    JOB_DESCRIPTION: '.jobs-description__content',
}

const getJobTitle = (): string => {
    return document.querySelector(QUERY_SELECTORS.JOB_TITLE)?.textContent?.trim() || '';
}

const getJobCompany = (): string => {
    return document.querySelector(QUERY_SELECTORS.JOB_COMPANY)?.textContent?.trim() || '';
}

const getJobMetadata = (): LinkedInJobMetadata => {
    const metadata = document.querySelector(QUERY_SELECTORS.JOB_METADATA)?.textContent?.trim() || '';
    const metadataArray = metadata?.split('·') || [];

    const jobLocation = metadataArray[0]?.trim() || '';
    const jobAnnouncement = metadataArray[1]?.trim() || '';
    const jobApplyCount = metadataArray[2]?.trim() || '';
    const jobPromotedBy = metadataArray[3]?.trim() || '';
    const jobAnswerManagement = metadataArray[4]?.trim() || '';

    return {
        location: jobLocation,
        announcement: jobAnnouncement,
        applyCount: jobApplyCount,
        promotedBy: jobPromotedBy,
        answerManagement: jobAnswerManagement
    }
}

const getJobDescription = (): string => {
    return document.querySelector(QUERY_SELECTORS.JOB_DESCRIPTION)?.textContent?.trim() || '';
}

export const extractLinkedInJobData = async (): Promise<LinkedInScrapedJobData> => {
    console.log('[JobHunter] Extracting data...');

    await waitForElement(QUERY_SELECTORS.JOB_METADATA, (el) => el.textContent?.trim() !== ''); // This is to ensure the job card is loaded

    const title = getJobTitle();
    const company = getJobCompany();
    const metadata = getJobMetadata();
    const description = getJobDescription();

    // TODO: Define a logic to validate if the data is correct, probably using zod later

    return {
        success: true,
        data: {
            title,
            company,
            metadata,
            description
        }
    };
}