import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractLinkedInJobData } from './linkedin';
import type { LinkedInJobMetadata } from '@/types';
import * as utils from './utils';

// Mock the waitForElement utility
vi.mock('./utils', () => ({
    waitForElement: vi.fn(() => Promise.resolve(document.createElement('div'))),
}));

describe('LinkedIn Job Scraper', () => {
    beforeEach(() => {
        // Clear the DOM before each test
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('getJobTitle', () => {
        it('should extract job title from DOM', async () => {
            // Setup DOM
            document.body.innerHTML = `
        <h1 class="job-details-jobs-unified-top-card__job-title">Senior Software Engineer</h1>
      `;

            const result = await extractLinkedInJobData();

            expect(result.success).toBe(true);
            expect(result.data.title).toBe('Senior Software Engineer');
        });

        it('should return empty string when title element is missing', async () => {
            // Setup DOM without title
            document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__company-name">Google</div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.title).toBe('');
        });

        it('should trim whitespace from title', async () => {
            // Setup DOM with whitespace
            document.body.innerHTML = `
        <h1 class="job-details-jobs-unified-top-card__job-title">  
          Frontend Developer  
        </h1>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.title).toBe('Frontend Developer');
        });
    });

    describe('getJobCompany', () => {
        it('should extract company name from DOM', async () => {
            // Setup DOM
            document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__company-name">Meta</div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.success).toBe(true);
            expect(result.data.company).toBe('Meta');
        });

        it('should return empty string when company element is missing', async () => {
            // Setup DOM without company
            document.body.innerHTML = `
        <h1 class="job-details-jobs-unified-top-card__job-title">DevOps Engineer</h1>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.company).toBe('');
        });

        it('should trim whitespace from company name', async () => {
            // Setup DOM with whitespace
            document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__company-name">
          Amazon Web Services
        </div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.company).toBe('Amazon Web Services');
        });
    });

    describe('getJobMetadata', () => {
        it('should parse complete metadata string with all fields', async () => {
            // Setup DOM with full metadata
            document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__primary-description-container">
          São Paulo, Brazil · Posted 2 days ago · 50+ applicants · Promoted by John Doe · Easy Apply
        </div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.metadata).toEqual({
                location: 'São Paulo, Brazil',
                announcement: 'Posted 2 days ago',
                applyCount: '50+ applicants',
                promotedBy: 'Promoted by John Doe',
                answerManagement: 'Easy Apply',
            });
        });

        it('should handle partial metadata with missing fields', async () => {
            // Setup DOM with partial metadata
            document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__primary-description-container">
          New York, NY · Posted 1 week ago
        </div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.metadata).toEqual({
                location: 'New York, NY',
                announcement: 'Posted 1 week ago',
                applyCount: '',
                promotedBy: '',
                answerManagement: '',
            });
        });

        it('should return empty metadata when element is missing', async () => {
            // Setup DOM without metadata
            document.body.innerHTML = `
        <h1 class="job-details-jobs-unified-top-card__job-title">Backend Engineer</h1>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.metadata).toEqual({
                location: '',
                announcement: '',
                applyCount: '',
                promotedBy: '',
                answerManagement: '',
            });
        });

        it('should trim whitespace from metadata fields', async () => {
            // Setup DOM with extra whitespace
            document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__primary-description-container">
          Remote  ·  Posted today  ·  100+ applicants
        </div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.metadata.location).toBe('Remote');
            expect(result.data.metadata.announcement).toBe('Posted today');
            expect(result.data.metadata.applyCount).toBe('100+ applicants');
        });
    });

    describe('getJobDescription', () => {
        it('should extract job description from DOM', async () => {
            // Setup DOM
            const description = 'We are looking for a talented engineer to join our team.';
            document.body.innerHTML = `
        <div class="jobs-description__content">${description}</div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.success).toBe(true);
            expect(result.data.description).toBe(description);
        });

        it('should return empty string when description element is missing', async () => {
            // Setup DOM without description
            document.body.innerHTML = `
        <h1 class="job-details-jobs-unified-top-card__job-title">Data Scientist</h1>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.description).toBe('');
        });

        it('should trim whitespace from description', async () => {
            // Setup DOM with whitespace
            document.body.innerHTML = `
        <div class="jobs-description__content">
          
          Join our innovative team working on cutting-edge technology.
          
        </div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.description).toBe('Join our innovative team working on cutting-edge technology.');
        });

        it('should handle multi-line descriptions', async () => {
            // Setup DOM with multi-line content
            document.body.innerHTML = `
        <div class="jobs-description__content">
          Role Description:
          - Design and implement features
          - Work with cross-functional teams
          - Mentor junior engineers
        </div>
      `;

            const result = await extractLinkedInJobData();

            expect(result.data.description).toContain('Role Description');
            expect(result.data.description).toContain('Design and implement features');
        });
    });

    describe('extractLinkedInJobData (integration)', () => {
        it('should extract all job data fields correctly', async () => {
            // Setup complete DOM
            document.body.innerHTML = `
        <div class="job-card">
          <h1 class="job-details-jobs-unified-top-card__job-title">Full Stack Developer</h1>
          <div class="job-details-jobs-unified-top-card__company-name">TechCorp</div>
          <div class="job-details-jobs-unified-top-card__primary-description-container">
            San Francisco, CA · Posted 3 days ago · 75+ applicants
          </div>
          <div class="jobs-description__content">
            We're seeking a Full Stack Developer to build amazing web applications.
          </div>
        </div>
      `;

            const result = await extractLinkedInJobData();

            expect(result).toEqual({
                success: true,
                data: {
                    title: 'Full Stack Developer',
                    company: 'TechCorp',
                    metadata: {
                        location: 'San Francisco, CA',
                        announcement: 'Posted 3 days ago',
                        applyCount: '75+ applicants',
                        promotedBy: '',
                        answerManagement: '',
                    },
                    description: "We're seeking a Full Stack Developer to build amazing web applications.",
                },
            });
        });

        it('should call waitForElement with correct selector', async () => {
            // Setup DOM
            document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__primary-description-container">
          Remote · Posted today
        </div>
      `;

            const waitForElementSpy = vi.spyOn(utils, 'waitForElement');

            await extractLinkedInJobData();

            expect(waitForElementSpy).toHaveBeenCalledWith(
                '.job-details-jobs-unified-top-card__primary-description-container',
                expect.any(Function)
            );
        });

        it('should handle completely empty DOM gracefully', async () => {
            // Setup empty DOM
            document.body.innerHTML = '';

            const result = await extractLinkedInJobData();

            expect(result).toEqual({
                success: true,
                data: {
                    title: '',
                    company: '',
                    metadata: {
                        location: '',
                        announcement: '',
                        applyCount: '',
                        promotedBy: '',
                        answerManagement: '',
                    },
                    description: '',
                },
            });
        });
    });
});
