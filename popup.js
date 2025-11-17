// Function to run in the context of the active webpage (Content Script)
function getShopifyThemeSchemaName() {
    
    // --- 1. Primary Check: Extract 'schema_name' from Shopify.theme object ---
    let scripts = document.querySelectorAll('script');
    for (const script of scripts) {
        if (script.textContent.includes('Shopify.theme')) {
            const schemaNameMatch = script.textContent.match(/"schema_name"\s*:\s*"([^"]+)"/);
            if (schemaNameMatch && schemaNameMatch[1]) {
                return { type: 'schema', name: schemaNameMatch[1] };
            }
        }
    }

    // --- 2. Fallback Check: Extract general 'name' ---
    for (const script of scripts) {
        if (script.textContent.includes('Shopify.theme')) {
            const themeNameMatch = script.textContent.match(/"name"\s*:\s*"([^"]+)"/);
            if (themeNameMatch && themeNameMatch[1]) {
                return { type: 'fallback_name', name: themeNameMatch[1] };
            }
        }
    }
    
    // --- 3. Fallback Check: Check for Meta Tag Theme ID ---
    let metaThemeId = document.querySelector('meta[name="shopify-theme-id"]');
    if (metaThemeId) {
        return { type: 'id', name: metaThemeId.content };
    }

    // If nothing is found across all methods
    return { type: 'not_found', name: 'Theme details not found.' };
}

// Function to convert Theme Name into a URL-friendly slug
function createSlug(text) {
    if (!text) return '';
    const cleanText = text.includes('/') ? text.split('/').pop() : text;

    return cleanText.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") 
        .trim()
        .replace(/\s+/g, '-') 
        .replace(/-+/g, '-'); 
}

// Function to create a clickable link element (now simpler as styling is in CSS)
function createLinkElement(text, url) {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = text;
    // We'll handle opening in new tab via event listener to respect CSP
    link.addEventListener('click', (event) => {
        event.preventDefault(); 
        chrome.tabs.create({ url: url, active: true });
    });
    return link;
}

// Main logic that runs when the popup opens
document.addEventListener('DOMContentLoaded', () => {
    const resultDiv = document.getElementById('theme-result');
    resultDiv.innerHTML = 'Analyzing page...';
    resultDiv.classList.add('loading');

    // 1. Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const isShopifyUrl = activeTab.url.includes('.myshopify.com');

        // 2. Execute the detection function in the active page's context
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: getShopifyThemeSchemaName
        }, (injectionResults) => {
            
            if (chrome.runtime.lastError) {
                resultDiv.textContent = 'Error: Check permissions or refresh page.';
                resultDiv.classList.add('not-shopify');
                resultDiv.classList.remove('loading');
                return;
            }

            const themeResult = injectionResults[0].result; 
            resultDiv.innerHTML = ''; 
            resultDiv.classList.remove('loading');

            if (themeResult.type === "not_found") {
                resultDiv.textContent = isShopifyUrl ? 
                    'Shopify store detected, but theme details are obscured.' : 
                    'This does not appear to be a Shopify store.';
                resultDiv.classList.add('not-shopify');
            } 
            else if (themeResult.type === 'id' || themeResult.type === 'fallback_name') {
                // Display fallbacks
                resultDiv.innerHTML = `
                    <div class="theme-name-display" style="background-color: #ffffff; color: #000000; border: 1px solid #000000; padding: 5px 8px;">
                        ${themeResult.name}
                    </div>
                    <div class="fallback-result">Theme name found via fallback method. Direct links may be inaccurate.</div>
                `;
                resultDiv.classList.add('found');
            } 
            else { // themeResult.type === 'schema'
                resultDiv.classList.add('found');
                const cleanThemeName = themeResult.name;
                const themeSlug = createSlug(cleanThemeName);

                // --- UI Construction ---
                const themeNameDisplay = document.createElement('div');
                themeNameDisplay.className = 'theme-name-display';
                themeNameDisplay.textContent = cleanThemeName;
                resultDiv.appendChild(themeNameDisplay);

                const linksSection = document.createElement('div');
                linksSection.className = 'links-section';
                
                const linksTitle = document.createElement('strong');
                linksTitle.textContent = 'Search on:';
                linksSection.appendChild(linksTitle);

                // Shopify Theme Store Link
                const shopifyUrl = `https://themes.shopify.com/themes/${themeSlug}`;
                const shopifyLink = createLinkElement(`Official Shopify Store`, shopifyUrl);
                linksSection.appendChild(shopifyLink);
                
                // ThemeForest Search Link
                const themeForestSearchTerm = encodeURIComponent(cleanThemeName);
                const themeforestUrl = `https://themeforest.net/category/ecommerce/shopify?term=${themeForestSearchTerm}`;
                const themeforestLink = createLinkElement(`ThemeForest Marketplace`, themeforestUrl);
                linksSection.appendChild(themeforestLink);

                resultDiv.appendChild(linksSection);
            }
        });
    });
});