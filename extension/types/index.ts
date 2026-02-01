// Maybe use zod to validate the data
// Also, maybe the types should be in a separate file per feature

export type LinkedInScrapedJobData =
    | {
          success: true;
          data: {
              title: string;
              company: string;
              metadata: LinkedInJobMetadata;
              description: string;
          };
      }
    | {
          success: false;
          error: unknown;
      };

export interface LinkedInJobMetadata {
    location: string;
    announcement: string;
    applyCount: string;
    promotedBy: string;
    answerManagement: string;
}