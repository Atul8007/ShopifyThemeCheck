/**
 * Extracts the Shopify theme schema name from the active webpage.
 * Tries multiple methods to find the theme name or ID.
 * 
 * @returns {{type: string, name: string}} An object containing the result type and name/ID.
 */
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

/**
 * Converts a text string into a URL-friendly slug.
 * 
 * @param {string} text - The text to convert.
 * @returns {string} The URL-friendly slug.
 */
function createSlug(text) {
    if (!text) return '';
    const cleanText = text.includes('/') ? text.split('/').pop() : text;

    return cleanText.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/**
 * Creates a clickable link element.
 * 
 * @param {string} text - The link text.
 * @param {string} url - The URL to link to.
 * @returns {HTMLAnchorElement} The created anchor element.
 */
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
    const preloader = document.getElementById('preloader');
    const content = document.getElementById('content');
    const resultDiv = document.getElementById('theme-result');

    // Helper to show content and hide preloader
    const showContent = () => {
        if (preloader) preloader.style.display = 'none';
        if (content) {
            content.classList.remove('hidden');
            // Trigger reflow to enable transition
            void content.offsetWidth;
            content.classList.add('visible');
        }
    };

    // 1. Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const isShopifyUrl = activeTab.url.includes('.myshopify.com') || activeTab.url.includes('myshopify.com');

        // 2. Execute the detection function in the active page's context
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: getShopifyThemeSchemaName
        }, (injectionResults) => {

            // Simulate a small delay for the preloader to be visible (UX)
            setTimeout(() => {
                if (chrome.runtime.lastError) {
                    resultDiv.innerHTML = `
                        <div class="status-message status-error">
                            <strong>Connection Error</strong><br>
                            Please refresh the page and try again.
                        </div>
                    `;
                    showContent();
                    return;
                }

                const themeResult = injectionResults[0].result;
                resultDiv.innerHTML = '';

                if (themeResult.type === "not_found") {
                    resultDiv.innerHTML = `
                        <div class="status-message status-info">
                            ${isShopifyUrl ? 'Shopify store detected, but the theme is hidden.' : 'This page does not appear to be a Shopify store.'}
                        </div>
                    `;
                }
                else {
                    // Success case (Schema, ID, or Fallback)
                    const cleanThemeName = themeResult.name;
                    const themeSlug = createSlug(cleanThemeName);
                    const isFallback = themeResult.type === 'id' || themeResult.type === 'fallback_name';

                    // Build the Result Card
                    const card = document.createElement('div');
                    card.className = 'result-card';

                    const label = document.createElement('div');
                    label.className = 'theme-label';
                    label.textContent = isFallback ? 'Detected Theme (Fallback)' : 'Active Theme';
                    card.appendChild(label);

                    const name = document.createElement('div');
                    name.className = 'theme-name';
                    name.textContent = cleanThemeName;
                    card.appendChild(name);

                    // Buttons
                    // Shopify Theme Store Link
                    const shopifyUrl = `https://themes.shopify.com/themes/${themeSlug}`;
                    const shopifyBtn = document.createElement('a');
                    shopifyBtn.className = 'btn btn-primary';
                    shopifyBtn.href = shopifyUrl;
                    shopifyBtn.textContent = 'View on Shopify Store';
                    shopifyBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        chrome.tabs.create({ url: shopifyUrl, active: true });
                    });
                    card.appendChild(shopifyBtn);

                    // ThemeForest Search Link
                    const themeForestSearchTerm = encodeURIComponent(cleanThemeName);
                    const themeforestUrl = `https://themeforest.net/category/ecommerce/shopify?term=${themeForestSearchTerm}`;
                    const themeforestBtn = document.createElement('a');
                    themeforestBtn.className = 'btn btn-secondary';
                    themeforestBtn.href = themeforestUrl;
                    themeforestBtn.textContent = 'Search on ThemeForest';
                    themeforestBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        chrome.tabs.create({ url: themeforestUrl, active: true });
                    });
                    card.appendChild(themeforestBtn);

                    if (isFallback) {
                        const note = document.createElement('div');
                        note.style.fontSize = '11px';
                        note.style.color = '#6b7280';
                        note.style.marginTop = '10px';
                        note.textContent = '* Exact match not guaranteed via fallback method.';
                        card.appendChild(note);
                    }

                    resultDiv.appendChild(card);
                }

                showContent();
            }, 600); // 600ms delay for smooth animation
        });
    });
});