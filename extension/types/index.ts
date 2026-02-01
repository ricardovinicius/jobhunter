// Maybe use zod to validate the data
// Also, maybe the types should be in a separate file per feature

export interface LinkedInScrapedJobData {
    success: boolean;
    data: {
        title: string;
        company: string;
        metadata: LinkedInJobMetadata;
        description: string;
    }
}

export interface LinkedInJobMetadata {
    location: string;
    announcement: string;
    applyCount: string;
    promotedBy: string;
    answerManagement: string;
}