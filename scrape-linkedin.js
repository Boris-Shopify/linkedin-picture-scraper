#!/usr/bin/env node

/**
 * Quick LinkedIn Profile Image Scraper
 * Usage: node scrape-linkedin.js <profile-url> [output-path]
 * 
 * Examples:
 *   node scrape-linkedin.js "https://www.linkedin.com/in/username/"
 *   node scrape-linkedin.js "https://www.linkedin.com/in/username/" "/path/to/save/"
 */

const scrapePreAuthLinkedInImage = require('./pre-auth-scraper.js');
const path = require('path');

async function quickScrape() {
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
    
    console.log('🔥 Quick LinkedIn Scraper');
    console.log(`📥 Downloading: ${url}`);
    console.log(`📁 Saving to: ${outputPath}`);
    console.log('');
    
    const result = await scrapePreAuthLinkedInImage(url, outputPath);
    
    if (result.success) {
        console.log('');
        console.log('🎉 Downloaded successfully!');
        console.log(`📍 File: ${result.filename}`);
        console.log(`📂 Path: ${result.filepath}`);
        
        // Return the path for programmatic use
        return result.filepath;
    } else {
        console.log('');
        console.log('💥 Download failed');
        console.log(`❌ ${result.error}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    quickScrape().catch(console.error);
}

module.exports = quickScrape;
