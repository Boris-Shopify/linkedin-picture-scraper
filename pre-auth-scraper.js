const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function scrapePreAuthLinkedInImage(profileUrl, outputDir = './images') {
    let browser = null;
    
    try {
        console.log('🚀 Starting browser...');
        
        browser = await chromium.launch({ 
            headless: true, // Can run headless since no login needed
            args: ['--disable-blink-features=AutomationControlled']
        });
        
        const page = await browser.newPage({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        console.log(`🔍 Loading LinkedIn teaser page: ${profileUrl}`);
        
        // Navigate to the profile - LinkedIn shows teaser content before login
        await page.goto(profileUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        // Wait for images to load
        await page.waitForTimeout(3000);
        
        console.log('🔍 Looking for profile image on teaser page...');
        
        // Selectors that work on the pre-authentication LinkedIn page
        const preAuthSelectors = [
            // Main profile image on teaser page
            'img[alt*="profile photo"]',
            'img[alt*="headshot"]',
            '.top-card-layout__entity-info img',
            '.profile-topcard__image img', 
            '.top-card-layout img',
            'img.profile-photo',
            'img[src*="profile-displayphoto"]',
            'img[data-ghost-url*="profile-displayphoto"]',
            '.profile-topcard img',
            // Generic image selectors as fallback
            'img[src*="linkedin.com"]',
            'img[src*="licdn.com"]',
            '.profile img',
            '.top-card img'
        ];
        
        let profileImage = null;
        let usedSelector = null;
        let imageSrc = null;
        
        for (const selector of preAuthSelectors) {
            console.log(`  🔍 Trying: ${selector}`);
            
            try {
                const elements = await page.$$(selector);
                
                for (const element of elements) {
                    const src = await element.getAttribute('src');
                    const alt = await element.getAttribute('alt');
                    
                    // Check if this looks like a profile image
                    if (src && (
                        src.includes('profile-displayphoto') ||
                        src.includes('headshot') ||
                        (alt && alt.toLowerCase().includes('profile')) ||
                        (alt && alt.toLowerCase().includes('photo')) ||
                        src.includes('/profile-displayphoto-shrink')
                    )) {
                        profileImage = element;
                        imageSrc = src;
                        usedSelector = selector;
                        console.log(`  ✅ Found profile image: ${selector}`);
                        console.log(`     🖼️  Source: ${src.substring(0, 80)}...`);
                        break;
                    }
                }
                
                if (profileImage) break;
                
            } catch (error) {
                continue;
            }
        }
        
        if (!profileImage || !imageSrc) {
            // Take a screenshot for debugging
            console.log('📷 No profile image found, taking screenshot for debugging...');
            await page.screenshot({ path: './pre-auth-debug.png', fullPage: true });
            
            // Also log all images found
            const allImages = await page.$$eval('img', imgs => 
                imgs.map(img => ({
                    src: img.src?.substring(0, 100) + '...',
                    alt: img.alt,
                    className: img.className
                })).filter(img => img.src)
            );
            
            console.log('🖼️  All images found on page:');
            allImages.forEach((img, i) => {
                console.log(`   ${i+1}. ${img.alt || 'No alt'} - ${img.src}`);
            });
            
            throw new Error('No profile image found on pre-authentication page. Check pre-auth-debug.png');
        }
        
        // Create output directory
        await fs.mkdir(outputDir, { recursive: true });
        
        // Generate filename
        const urlParts = new URL(profileUrl);
        const username = urlParts.pathname.split('/in/')[1]?.replace('/', '') || 'unknown';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `${username}_profile_${timestamp}.jpg`;
        const filepath = path.join(outputDir, filename);
        
        console.log(`💾 Downloading image to: ${filepath}`);
        
        // Download the image
        if (imageSrc.startsWith('data:')) {
            // Handle data URLs (base64 encoded images)
            const base64Data = imageSrc.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            await fs.writeFile(filepath, buffer);
        } else {
            // Download from URL
            const response = await page.goto(imageSrc);
            if (!response.ok()) {
                throw new Error(`Failed to download image: ${response.status()}`);
            }
            const buffer = await response.body();
            await fs.writeFile(filepath, buffer);
        }
        
        console.log(`🎉 Success! Profile image saved to: ${filepath}`);
        
        return {
            success: true,
            filepath: filepath,
            imageUrl: imageSrc,
            selector: usedSelector,
            filename: filename
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

// Command line interface
async function main() {
    const profileUrl = process.argv[2] || 'https://www.linkedin.com/in/boristai/';
    const outputDir = process.argv[3] || './images';
    
    console.log('🎯 LinkedIn Pre-Auth Profile Image Scraper');
    console.log(`📍 Target: ${profileUrl}`);
    console.log(`💾 Output: ${outputDir}`);
    console.log('');
    
    const result = await scrapePreAuthLinkedInImage(profileUrl, outputDir);
    
    console.log('');
    if (result.success) {
        console.log('✨ SUCCESS! ✨');
        console.log(`📁 Image saved as: ${result.filename}`);
        console.log(`📍 Full path: ${result.filepath}`);
        console.log(`🔗 Original URL: ${result.imageUrl}`);
    } else {
        console.log('💥 FAILED');
        console.log(`❌ Error: ${result.error}`);
        console.log('💡 Try checking the debug screenshot if one was created');
    }
}

if (require.main === module) {
    main();
}

module.exports = scrapePreAuthLinkedInImage;
