# LinkedIn Profile Image Scraper

A fast, reliable tool to download LinkedIn profile pictures without authentication using browser automation.

## ✨ Features

- 🚫 **No login required** - Works on LinkedIn's public teaser pages
- 🎯 **Smart detection** - Multiple fallback selectors to find profile images
- ⚡ **Fast & headless** - Runs in the background without opening browser windows
- 📁 **Custom output** - Save images to any directory
- 🔄 **Batch processing** - Can be easily extended for multiple profiles
- 🛡️ **Error handling** - Debug screenshots and detailed error messages
- 📱 **Cross-platform** - Works on Mac, Windows, and Linux

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/yourusername/linkedin-profile-scraper.git
   cd linkedin-profile-scraper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install browser engines:**
   ```bash
   npx playwright install
   ```

### Usage

**Basic usage:**
```bash
node scrape-linkedin.js "https://www.linkedin.com/in/username/"
```

**Specify output directory:**
```bash
node scrape-linkedin.js "https://www.linkedin.com/in/username/" "./my-images"
```

**Using npm scripts:**
```bash
npm run scrape "https://www.linkedin.com/in/username/"
```

## 📖 Examples

```bash
# Download to default ./downloads folder
node scrape-linkedin.js "https://www.linkedin.com/in/username/"

# Download to custom folder
node scrape-linkedin.js "https://www.linkedin.com/in/username/" "./team-photos"

# Using the advanced version with detailed logs
node pre-auth-scraper.js "https://www.linkedin.com/in/username/" "./images"
```

## 📂 Project Structure

```
linkedin-profile-scraper/
├── scrape-linkedin.js      # Main scraper (recommended)
├── pre-auth-scraper.js     # Advanced version with detailed logging
├── simple-scraper.js       # Interactive version (handles login)
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## ⚙️ Configuration

### Output Format
Images are saved with descriptive filenames:
- Format: `{username}_profile_{timestamp}.jpg`
- Example: `username_profile_20250910T173221.jpg`

### Supported URLs
- ✅ `https://www.linkedin.com/in/username/`
- ✅ `https://linkedin.com/in/username/`
- ✅ `https://www.linkedin.com/in/username`

## 🔧 Advanced Usage

### Programmatic Use
```javascript
const scrapeLinkedInImage = require('./pre-auth-scraper.js');

async function downloadProfileImage() {
    const result = await scrapeLinkedInImage(
        'https://www.linkedin.com/in/username/', 
        './output'
    );
    
    if (result.success) {
        console.log(`Downloaded: ${result.filepath}`);
    } else {
        console.error(`Failed: ${result.error}`);
    }
}
```

### Batch Processing
```javascript
const profiles = [
    'https://www.linkedin.com/in/user1/',
    'https://www.linkedin.com/in/user2/',
    'https://www.linkedin.com/in/user3/'
];

for (const profile of profiles) {
    await scrapeLinkedInImage(profile, './team-photos');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
}
```

## 🛠️ Available Scripts

- `npm run scrape` - Run the main scraper
- `npm run advanced` - Run with detailed logging
- `npm run simple` - Run interactive version
- `npm run example` - Run the example code

## 🐛 Troubleshooting

### Common Issues

**"Profile image not found"**
- The profile might be completely private
- LinkedIn might have changed their HTML structure
- Check if the URL is correct and publicly accessible

**"Browser launch failed"**
```bash
# Reinstall browser engines
npx playwright install
```

**"Permission denied"**
- Check write permissions for the output directory
- Make sure the output path exists or can be created

### Debug Mode
If the scraper fails, it automatically creates debug screenshots:
- `pre-auth-debug.png` - Shows what the page looked like
- Check console output for detailed error messages

## ⚠️ Important Notes

### Legal & Ethical Use
- ✅ **Personal use** - Download your own or public profiles
- ✅ **Small scale** - Respect rate limits and server resources  
- ❌ **Bulk scraping** - Don't overwhelm LinkedIn's servers
- ❌ **Commercial use** - Respect LinkedIn's Terms of Service
- ❌ **Private profiles** - Only works with publicly visible information

### Rate Limiting
- Built-in delays between requests
- Respectful to LinkedIn's servers
- Consider adding longer delays for batch processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/) for browser automation
- Inspired by the need for simple, reliable profile image extraction

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at existing [GitHub Issues](https://github.com/yourusername/linkedin-profile-scraper/issues)
3. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Complete error message
   - The LinkedIn URL you're trying to scrape

---

**⭐ If this tool helped you, please star the repository!**