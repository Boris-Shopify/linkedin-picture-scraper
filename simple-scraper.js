const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function scrapeLinkedInImage(profileUrl, outputDir = './images') {
    let browser = null;
    
    try {
        console.log('🚀 Starting browser...');
        
        // Launch browser in non-headless mode so user can log in if needed
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000 // Slow down for better reliability
        });
        
        const page = await browser.newPage();
        
        console.log(`🔍 Navigating to: ${profileUrl}`);
        
        // Navigate with a longer timeout and different wait condition
        await page.goto(profileUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 60000 
        });
        
        console.log('📋 Page loaded. Looking for profile image...');
        
        // Wait for page to settle
        await page.waitForTimeout(3000);
        
        // Check if we need to log in
        const loginForm = await page.$('form[action*="login"]');
        if (loginForm) {
            console.log('⚠️  LinkedIn requires login. Please log in manually in the browser window.');
            console.log('   After logging in, press ENTER in this terminal to continue...');
            
            // Wait for user input
            process.stdin.setRawMode(true);
            process.stdin.resume();
            await new Promise(resolve => process.stdin.once('data', resolve));
            process.stdin.setRawMode(false);
            process.stdin.pause();
            
            console.log('▶️  Continuing after login...');
            
            // Navigate again after login
            await page.goto(profileUrl, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            await page.waitForTimeout(3000);
        }
        
        // More comprehensive image selectors
        const imageSelectors = [
            'img.pv-top-card-profile-picture__image',
            '.pv-top-card-profile-picture__image',
            'img[alt*="profile photo" i]',
            'img[alt*="headshot" i]',
            '.presence-entity__image img',
            '.pv-top-card--photo img',
            'img[data-ghost-classes*="profile-picture"]',
            'img.profile-photo-edit__preview',
            '.EntityPhoto-square-3 img',
            'img.lazy-image',
            '.pv-member-card__actor-detail img'
        ];
        
        let imageElement = null;
        let foundSelector = null;
        
        for (const selector of imageSelectors) {
            console.log(`🔍 Trying selector: ${selector}`);
            
            try {
                imageElement = await page.$(selector);
                if (imageElement) {
                    // Check if image actually has a source
                    const src = await imageElement.getAttribute('src');
                    if (src && src.length > 10) {
                        foundSelector = selector;
                        console.log(`✅ Found image with selector: ${selector}`);
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!imageElement) {
            console.log('📷 Taking a screenshot for debugging...');
            await page.screenshot({ path: './debug-screenshot.png', fullPage: true });
            throw new Error('No profile image found. Check debug-screenshot.png to see what the page looks like.');
        }
        
        // Get image source
        const imageSrc = await imageElement.getAttribute('src');
        console.log(`📥 Found image URL: ${imageSrc}`);
        
        // Create output directory
        await fs.mkdir(outputDir, { recursive: true });
        
        // Extract filename
        const urlParts = new URL(profileUrl);
        const profileUsername = urlParts.pathname.split('/in/')[1]?.replace('/', '') || 'unknown';
        const timestamp = Date.now();
        const filename = `${profileUsername}_${timestamp}.jpg`;
        const filepath = path.join(outputDir, filename);
        
        // Download image
        if (imageSrc.startsWith('data:')) {
            // Handle data URLs
            const base64Data = imageSrc.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            await fs.writeFile(filepath, imageBuffer);
        } else {
            // Handle regular URLs
            const response = await page.goto(imageSrc);
            const buffer = await response.body();
            await fs.writeFile(filepath, buffer);
        }
        
        console.log(`🎉 Success! Image saved to: ${filepath}`);
        
        return {
            success: true,
            filepath: filepath,
            imageUrl: imageSrc,
            selector: foundSelector
        };
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
        
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Main execution
async function main() {
    const profileUrl = process.argv[2] || 'https://www.linkedin.com/in/boristai/';
    const outputDir = process.argv[3] || './images';
    
    console.log('🔄 LinkedIn Profile Image Scraper (Interactive Version)');
    console.log(`📍 Profile: ${profileUrl}`);
    console.log(`💾 Output: ${outputDir}`);
    console.log('');
    
    const result = await scrapeLinkedInImage(profileUrl, outputDir);
    
    if (result.success) {
        console.log('');
        console.log('✨ DONE! ✨');
        console.log(`📁 Image saved to: ${result.filepath}`);
    } else {
        console.log('');
        console.log('💥 Failed to scrape image');
        console.log(`Error: ${result.error}`);
    }
}

if (require.main === module) {
    main();
}

module.exports = scrapeLinkedInImage;
