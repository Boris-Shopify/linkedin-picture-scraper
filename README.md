# LinkedIn Profile Image Scraper

A fast, reliable tool to download LinkedIn profile pictures without authentication.

## ✨ Features

- 🚫 **No login required** - Works on LinkedIn's public profile pages
- ⚡ **Fast & headless** - Runs in the background
- 📁 **Custom output** - Save images to any directory
- 🛡️ **Error handling** - Clear error messages and debug info
- 📱 **Cross-platform** - Works on Mac, Windows, and Linux

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)

### Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/Boris-Shopify/linkedin-picture-scraper.git
   cd linkedin-picture-scraper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npx playwright install
   ```

### Usage

**Basic usage:**
```bash
node scrape-linkedin.js "https://www.linkedin.com/in/username/"
```

**Save to custom directory:**
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
```

## 📂 Output

Images are saved with descriptive filenames:
- Format: `{username}_profile_{timestamp}.jpg`
- Example: `username_profile_20250910T173221.jpg`

## 🔧 Supported URLs

- ✅ `https://www.linkedin.com/in/username/`
- ✅ `https://linkedin.com/in/username/`
- ✅ `https://www.linkedin.com/in/username`

## ❓ Troubleshooting

**Profile not found?**
- Make sure the LinkedIn profile is public
- Check that the URL is correct
- Some profiles may have restricted visibility

**Installation issues?**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npx playwright install
```

## 📄 License

MIT License - see LICENSE file for details.

## ⚠️ Legal Notice

This tool is for educational and personal use only. Respect LinkedIn's Terms of Service and only use with publicly visible profile information.