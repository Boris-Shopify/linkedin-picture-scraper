#!/usr/bin/env node

/**
 * LinkedIn Profile Image Scraper
 * Usage: node scrape-linkedin.js <profile-url> [output-path]
 * 
 * Examples:
 *   node scrape-linkedin.js "https://www.linkedin.com/in/username/"
 *   node scrape-linkedin.js "https://www.linkedin.com/in/username/" "./my-folder"
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function scrapeLinkedInImage(profileUrl, outputDir = './downloads') {
    let browser = null;
    
    try {
        console.log('🚀 Starting browser...');
        
        browser = await chromium.launch({ 
            headless: true,
            args: ['--disable-blink-features=AutomationControlled']
        });
        
        const page = await browser.newPage({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        console.log(`🔍 Loading LinkedIn profile: ${profileUrl}`);
        
        // Navigate to the profile
        await page.goto(profileUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        await page.waitForTimeout(2000);
        
        console.log('📋 Looking for profile image...');
        
        // Multiple selectors to find profile image
        const profileImageSelectors = [
            '.top-card-layout__entity-info img',
            '.pv-top-card-profile-picture__image',
            '.profile-photo-edit__preview img',
            '.pv-top-card-profile-picture img',
            '.profile-photo img',
            'img[data-delayed-url*="profile-displayphoto"]',
            '.EntityPhoto-circle-6 img'
        ];
        
        let imageElement = null;
        let foundSelector = null;
        
        for (const selector of profileImageSelectors) {
            try {
                imageElement = await page.$(selector);
                if (imageElement) {
                    foundSelector = selector;
                    console.log(`✅ Found profile image: ${selector}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!imageElement) {
            return {
                success: false,
                error: 'Profile image not found. The profile might be private or the page structure has changed.'
            };
        }
        
        // Get the image source URL
        const imageSrc = await imageElement.getAttribute('src');
        if (!imageSrc) {
            return {
                success: false,
                error: 'Could not get image source URL'
            };
        }
        
        console.log(`📷 Image URL: ${imageSrc}`);
        
        // Extract username from URL for filename
        const usernameMatch = profileUrl.match(/\/in\/([^\/]+)/);
        const username = usernameMatch ? usernameMatch[1] : 'profile';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
        const filename = `${username}_profile_${timestamp}.jpg`;
        
        // Create output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });
        const filepath = path.join(outputDir, filename);
        
        // Download the image
        console.log('⬇️ Downloading image...');
        const imageResponse = await page.goto(imageSrc);
        const imageBuffer = await imageResponse.body();
        
        // Save the image
        await fs.writeFile(filepath, imageBuffer);
        const stats = await fs.stat(filepath);
        
        console.log(`✅ Downloaded: ${filename} (${(stats.size / 1024).toFixed(1)}KB)`);
        console.log(`📁 Saved to: ${filepath}`);
        
        return {
            success: true,
            filename: filename,
            filepath: filepath,
            size: stats.size,
            imageUrl: imageSrc
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
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

async function main() {
    const url = process.argv[2];
    const outputPath = process.argv[3] || './downloads';
    
    if (!url) {
        console.log('❌ Please provide a LinkedIn profile URL');
        console.log('');
        console.log('Usage:');
        console.log('  node scrape-linkedin.js "https://www.linkedin.com/in/username/"');
        console.log('  node scrape-linkedin.js "https://www.linkedin.com/in/username/" "./my-folder"');
        console.log('');
        process.exit(1);
    }
    
    if (!url.includes('linkedin.com/in/')) {
        console.log('❌ Please provide a valid LinkedIn profile URL');
        console.log('   Format: https://www.linkedin.com/in/username/');
        process.exit(1);
    }
    
    console.log('🔥 LinkedIn Profile Image Scraper');
    console.log(`📥 Profile: ${url}`);
    console.log(`📁 Output: ${outputPath}`);
    console.log('');
    
    const result = await scrapeLinkedInImage(url, outputPath);
    
    if (result.success) {
        console.log('');
        console.log('🎉 Download completed successfully!');
    } else {
        console.log('');
        console.log('💥 Download failed');
        console.log(`❌ ${result.error}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = scrapeLinkedInImage;