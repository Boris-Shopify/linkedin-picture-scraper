const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class LinkedInImageScraper {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        // Launch browser with realistic settings
        this.browser = await chromium.launch({
            headless: false, // Set to true for headless mode
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--disable-default-apps'
            ]
        });
        
        const context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport: { width: 1280, height: 720 }
        });
        
        this.page = await context.newPage();
        
        // Add stealth measures
        await this.page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
    }

    async scrapeProfileImage(profileUrl, outputDir = './images') {
        try {
            console.log(`🔍 Navigating to: ${profileUrl}`);
            
            // Navigate to the LinkedIn profile
            await this.page.goto(profileUrl, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            // Wait a bit for the page to fully load
            await this.page.waitForTimeout(3000);

            // Try multiple selectors for profile images
            const profileImageSelectors = [
                'img[data-ghost-classes="pv-top-card-profile-picture__image"]',
                '.pv-top-card-profile-picture__image',
                'img.pv-top-card__photo',
                'img.profile-photo-edit__preview',
                '.presence-entity__image img',
                'img[alt*="profile photo"]',
                '.pv-top-card--photo img',
                '[data-control-name="identity_profile_photo"] img'
            ];

            let profileImage = null;
            let usedSelector = null;

            // Try each selector until we find an image
            for (const selector of profileImageSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 5000 });
                    profileImage = await this.page.$(selector);
                    if (profileImage) {
                        usedSelector = selector;
                        console.log(`✅ Found profile image using selector: ${selector}`);
                        break;
                    }
                } catch (error) {
                    // Continue to next selector
                    continue;
                }
            }

            if (!profileImage) {
                throw new Error('Profile image not found with any of the attempted selectors');
            }

            // Get the image URL
            const imageUrl = await profileImage.getAttribute('src');
            if (!imageUrl) {
                throw new Error('Profile image src attribute is empty');
            }

            console.log(`📥 Found image URL: ${imageUrl}`);

            // Create output directory if it doesn't exist
            await fs.mkdir(outputDir, { recursive: true });

            // Extract name from URL or use timestamp
            const urlParams = new URL(profileUrl);
            const profileName = urlParams.pathname.split('/in/')[1]?.replace('/', '') || 'unknown';
            const fileName = `${profileName}_profile_image.jpg`;
            const filePath = path.join(outputDir, fileName);

            // Download the image
            const imageResponse = await this.page.goto(imageUrl);
            const imageBuffer = await imageResponse.body();
            
            await fs.writeFile(filePath, imageBuffer);
            
            console.log(`🎉 Profile image saved to: ${filePath}`);
            
            return {
                success: true,
                imagePath: filePath,
                imageUrl: imageUrl,
                selector: usedSelector
            };

        } catch (error) {
            console.error(`❌ Error scraping profile image: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    // Batch scraping method
    async scrapeMultipleProfiles(profileUrls, outputDir = './images') {
        const results = [];
        
        for (const url of profileUrls) {
            console.log(`\n📋 Processing ${url}...`);
            const result = await this.scrapeProfileImage(url, outputDir);
            results.push({ url, ...result });
            
            // Wait between requests to be respectful
            await this.page.waitForTimeout(2000);
        }
        
        return results;
    }
}

// Main function to run the scraper
async function main() {
    const scraper = new LinkedInImageScraper();
    
    try {
        await scraper.init();
        
        // Get URL from command line arguments
        const profileUrl = process.argv[2];
        const outputDir = process.argv[3] || './images';
        
        if (!profileUrl) {
            console.log('Usage: node linkedin-scraper.js <LinkedIn-Profile-URL> [output-directory]');
            console.log('Example: node linkedin-scraper.js "https://www.linkedin.com/in/boristai/" "./downloaded_images"');
            return;
        }

        // Validate URL
        if (!profileUrl.includes('linkedin.com/in/')) {
            console.error('❌ Please provide a valid LinkedIn profile URL');
            return;
        }

        console.log('🚀 Starting LinkedIn Profile Image Scraper...');
        const result = await scraper.scrapeProfileImage(profileUrl, outputDir);
        
        if (result.success) {
            console.log('\n🎯 Scraping completed successfully!');
            console.log(`📍 Image saved to: ${result.imagePath}`);
        } else {
            console.log('\n💥 Scraping failed!');
            console.log(`Error: ${result.error}`);
        }
        
    } catch (error) {
        console.error(`💥 Fatal error: ${error.message}`);
    } finally {
        await scraper.close();
    }
}

// Export for use as module
module.exports = LinkedInImageScraper;

// Run if called directly
if (require.main === module) {
    main();
}
