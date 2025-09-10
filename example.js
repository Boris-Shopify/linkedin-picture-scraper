const LinkedInImageScraper = require('./linkedin-scraper.js');

async function example() {
    const scraper = new LinkedInImageScraper();
    
    try {
        await scraper.init();
        
        // Example: Scrape Boris's LinkedIn profile image
        const result = await scraper.scrapeProfileImage(
            'https://www.linkedin.com/in/boristai/', 
            './downloaded_images'
        );
        
        console.log('Result:', result);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await scraper.close();
    }
}

example();
