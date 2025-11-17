# Shopify Theme Check 🔍

A minimal and modern Chrome extension that instantly identifies the **official theme (schema_name)** used by any public Shopify store, with quick links to explore the theme across marketplaces.

## ✨ Overview

The **Shopify Theme Check** scans any Shopify storefront and extracts the real **schema_name** defined in the theme’s code—bypassing misleading developer labels.  
It displays the detected theme in a clean popup UI, with one-click links to search the theme on the **Shopify Theme Store** and **ThemeForest**.

Perfect for developers, agencies, and Shopify enthusiasts who need to identify themes quickly during audits, competitor research, or store teardown sessions.

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **🎯 Accurate Theme Detection** | Extracts the official `schema_name` directly from the store’s source |
| **🔗 Quick Search Links** | Instantly search the detected theme on Shopify Theme Store & ThemeForest |
| **🎨 Minimal UI** | High-contrast black & white interface with Shopify green (#95bf47) accents |
| **🧠 Smart Fallbacks** | Detects theme IDs or developer names when schema name is hidden |
| **⚡ Fast & Lightweight** | Zero dependencies, instant popup loading |

## 📦 Installation

### Method 1: Install from Source (Developer Mode)

1. Clone the repository:
git clone https://github.com/Atul8007/ShopifyThemeCheck.git
cd ShopifyThemeCheck

2. Load in Chrome:
- Go to chrome://extensions/
- Enable Developer Mode
- Click Load unpacked
- Select the ShopifyThemeCheck/

3. Start using the extension:
- Open any Shopify store  
- Click the extension icon  
- View the detected theme instantly  

### Method 2: Manual Installation

1. Download the ZIP from GitHub Releases  
2. Extract the folder  
3. Follow the same steps under Load in Chrome  

## 🖼️ What You'll See

The popup displays:

### 🎨 Theme Details
- Theme Name (schema_name) — e.g., Dawn, Impulse, Motion  
- Theme ID (if available)
- Developer Theme Name (fallback)  
- Direct Search Buttons for Shopify Theme Store & ThemeForest  

## 🛠️ Technical Details

### Tech Stack
- Chrome Extension Manifest v3  
- JavaScript (Vanilla), HTML, CSS  
- No external API calls  

### Project Structure
ShopifyThemeCheck/
├── manifest.json
├── popup.html
├── popup.js
└── icon.png

### Permissions
{
  "permissions": ["activeTab", "scripting"]
}

## 🔧 How It Works

1. Injects a script into the active page  
2. Extracts theme metadata  
3. Parses schema_name, theme ID, fallbacks  
4. Displays the result inside the popup  

## 🚀 Future Enhancements

- Theme Asset Inspector  
- Theme Version Detection  
- Export Theme Metadata  
- Dark Mode  
- One-Click Theme Comparison  

## 🤝 Contributing

Contributions are welcome!

## 📄 License

MIT License  

## 🐛 Found a Bug?

Report issues on GitHub with:
- Store URL  
- Chrome version  
- Steps to reproduce  
- Screenshot  

## 👨‍💻 Author

**Atul Mundakkal**  

GitHub: https://github.com/Atul8007
