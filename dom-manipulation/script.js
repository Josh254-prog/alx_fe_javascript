// script.js

// Array to store quote objects
let quotes = [];
let currentFilterCategory = 'all'; // Default filter category

// Get DOM elements
const quoteTextElement = document.getElementById('quoteText');
const quoteCategoryElement = document.getElementById('quoteCategory');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
const exportQuotesButton = document.getElementById('exportQuotes');
const lastViewedQuoteInfo = document.getElementById('lastViewedQuoteInfo');
const categoryFilterDropdown = document.getElementById('categoryFilter');
const syncStatusElement = document.getElementById('syncStatus');
const syncNowButton = document.getElementById('syncNowButton');

// --- Simulated Server Data (Now fetched from JSONPlaceholder) ---
// The mockServerQuotes array is no longer the direct source of truth for server data,
// but it remains for clarity if you wish to switch back to a purely local simulation.
const mockServerQuotes = [
  { text: "The unexamined life is not worth living.", category: "Philosophy" },
  { text: "The only true wisdom is in knowing you know nothing.", category: "Philosophy" },
  { text: "Be the change that you wish to see in the world.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "That which does not kill us makes us stronger.", category: "Resilience" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Life" }
];

// --- Web Storage Functions ---

/**
 * Saves the current 'quotes' array to local storage.
 */
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Loads quotes from local storage when the application starts.
 * Initializes the 'quotes' array.
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // If no quotes in local storage, start with an empty array or initial defaults
    quotes = []; // Start empty so server can populate, or keep initial ones
    // We'll let syncQuotes populate initial quotes if local storage is empty
  }
}

// --- Category Filtering Functions ---

/**
 * Populates the category filter dropdown with unique categories from the 'quotes' array.
 * Preserves the currently selected filter if it exists.
 */
function populateCategories() {
  const categories = new Set(quotes.map(quote => quote.category));
  // Clear existing options, but keep the "All Categories" option
  categoryFilterDropdown.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilterDropdown.appendChild(option);
  });

  // Restore the last selected filter if it's valid
  const storedFilter = localStorage.getItem('selectedCategoryFilter');
  if (storedFilter && (Array.from(categories).includes(storedFilter) || storedFilter === 'all')) {
    categoryFilterDropdown.value = storedFilter;
    currentFilterCategory = storedFilter;
  } else {
    categoryFilterDropdown.value = 'all';
    currentFilterCategory = 'all';
  }
}

/**
 * Filters quotes based on the selected category from the dropdown.
 * Updates the current filter and displays a random quote from the filtered list.
 */
function filterQuotes() {
  currentFilterCategory = categoryFilterDropdown.value;
  localStorage.setItem('selectedCategoryFilter', currentFilterCategory); // Save filter to local storage
  showRandomQuote(); // Display a random quote from the filtered set
}

// --- Quote Display Functions ---

/**
 * Displays a random quote from the 'quotes' array, considering the current filter.
 * Stores the displayed quote in session storage.
 */
function showRandomQuote() {
  let quotesToDisplay = quotes;

  // Apply filter if a specific category is selected
  if (currentFilterCategory !== 'all') {
    quotesToDisplay = quotes.filter(quote => quote.category === currentFilterCategory);
  }

  if (quotesToDisplay.length === 0) {
    quoteTextElement.textContent = "No quotes available for this category. Try adding some or selecting 'All Categories'.";
    quoteCategoryElement.textContent = "";
    lastViewedQuoteInfo.textContent = "";
    sessionStorage.removeItem('lastViewedQuote');
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotesToDisplay.length);
  const randomQuote = quotesToDisplay[randomIndex];

  quoteTextElement.textContent = `"${randomQuote.text}"`;
  quoteCategoryElement.textContent = `- ${randomQuote.category}`;

  // Store the last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
  lastViewedQuoteInfo.textContent = `(Last viewed: "${randomQuote.text}" - ${randomQuote.category})`;
}

/**
 * Loads and displays the last viewed quote from session storage, if available.
 */
function loadLastViewedQuote() {
  const lastViewed = sessionStorage.getItem('lastViewedQuote');
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    // Only display if it matches the current filter, or if filter is 'all'
    if (currentFilterCategory === 'all' || quote.category === currentFilterCategory) {
        quoteTextElement.textContent = `"${quote.text}"`;
        quoteCategoryElement.textContent = `- ${quote.category}`;
        lastViewedQuoteInfo.textContent = `(Last viewed: "${quote.text}" - ${quote.category})`;
    } else {
        // If last viewed quote doesn't match current filter, show a random one
        showRandomQuote();
    }
  } else {
    showRandomQuote(); // If no last viewed quote, show a random one
  }
}

// --- Quote Addition Function ---

/**
 * Adds a new quote to the 'quotes' array based on user input.
 * Saves quotes to local storage and updates categories after adding.
 * Simulates sending the new quote to the server.
 */
async function addQuote() { // Made async to await the simulated post
  const quoteText = newQuoteTextInput.value.trim();
  const quoteCategory = newQuoteCategoryInput.value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  saveQuotes(); // Save updated quotes to local storage
  populateCategories(); // Update categories dropdown (in case of new category)

  newQuoteTextInput.value = "";
  newQuoteCategoryInput.value = "";

  showRandomQuote(); // Display a new random quote, considering the current filter

  displaySyncStatus('Quote added locally. Attempting to send to server (simulated).', 'text-yellow-700');
  try {
    // Simulate posting data to the server using a mock API
    // JSONPlaceholder doesn't actually save data, but we simulate the request
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Crucial for sending JSON data
      },
      body: JSON.stringify({ // Stringify the JavaScript object into a JSON string
        title: quoteText, // Map our quote text to JSONPlaceholder's title field
        body: `Category: ${quoteCategory}`, // Map category to body
        userId: 1 // Example user ID
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to post quote: ${response.status}`);
    }
    const responseData = await response.json();
    console.log('Simulated server response for new quote:', responseData);
    displaySyncStatus('Quote sent to server (simulated) successfully!', 'text-green-700');

  } catch (error) {
    console.error('Error simulating posting quote to server:', error);
    displaySyncStatus('Failed to send quote to server (simulated).', 'text-red-700');
  }
}

// --- JSON Import/Export Functions ---

/**
 * Exports the current quotes array to a JSON file.
 */
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2); // Pretty print JSON
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports quotes from a selected JSON file.
 * Appends imported quotes to the existing array and saves to local storage.
 * Updates categories and displays a random quote.
 * @param {Event} event The change event from the file input.
 */
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        // Merge imported quotes, ensuring uniqueness and server precedence (if any server quotes are already loaded)
        const combinedQuotes = [...quotes, ...importedQuotes];
        const uniqueQuotesMap = new Map();
        combinedQuotes.forEach(quote => {
          const key = `${quote.text.toLowerCase()}::${quote.category.toLowerCase()}`;
          uniqueQuotesMap.set(key, quote);
        });
        quotes = Array.from(uniqueQuotesMap.values());

        saveQuotes(); // Save updated quotes to local storage
        populateCategories(); // Update categories dropdown (in case of new categories)
        showRandomQuote(); // Display a new random quote after import
        displaySyncStatus('Quotes imported successfully!', 'text-green-700');
      } else {
        alert('Invalid JSON file format. Expected an array of quotes.');
      }
    } catch (e) {
      alert('Error parsing JSON file: ' + e.message);
    }
  };
  if (event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
}

// --- Server Sync and Conflict Resolution ---

/**
 * Displays a status message related to synchronization.
 * @param {string} message The message to display.
 * @param {string} type Tailwind CSS class for styling (e.g., 'text-green-700', 'text-red-700').
 */
function displaySyncStatus(message, type) {
  syncStatusElement.textContent = message;
  syncStatusElement.className = `text-sm p-2 rounded-md mb-4 ${type}`;
  syncStatusElement.style.display = 'block'; // Ensure it's visible
  setTimeout(() => {
    syncStatusElement.style.display = 'none';
  }, 5000); // Hide after 5 seconds
}

/**
 * Fetches data from a mock API (JSONPlaceholder) to simulate server quotes.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of quote objects.
 */
async function fetchQuotesFromServer() {
  try {
    displaySyncStatus('Fetching quotes from server...', 'bg-gray-100 text-gray-700');
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Map JSONPlaceholder posts to our quote format
    // Using 'title' as text and a generic 'Server' category for simplicity
    const serverQuotes = data.map(post => ({
      text: post.title.charAt(0).toUpperCase() + post.title.slice(1), // Capitalize first letter
      category: 'Server'
    }));
    return serverQuotes;
  } catch (error) {
    console.error('Error fetching data from JSONPlaceholder:', error);
    displaySyncStatus('Failed to fetch server data.', 'bg-red-100 text-red-800');
    // Fallback to local mock data if API fetch fails, or return empty array
    return []; // Or return mockServerQuotes if you want a local fallback
  }
}

/**
 * Simulates syncing local data with server data.
 * Server data takes precedence in case of identical quotes.
 */
async function syncQuotes() {
  displaySyncStatus('Initiating sync...', 'bg-yellow-100 text-yellow-800');

  let serverQuotes = [];
  try {
    serverQuotes = await fetchQuotesFromServer(); // Call the fetchQuotesFromServer function
  } catch (error) {
    // Error handling is inside fetchQuotesFromServer, so simply return if it failed
    return;
  }

  const newQuotesFromServerCount = { count: 0 };

  // Create a map for existing local quotes for quick lookup and to detect new server quotes
  const localQuotesMap = new Map();
  quotes.forEach(quote => {
    const key = `${quote.text.toLowerCase()}::${quote.category.toLowerCase()}`;
    localQuotesMap.set(key, quote);
  });

  // Create a new set of quotes by merging server and local, with server taking precedence
  const mergedQuotesMap = new Map();

  // 1. Add all server quotes first (they take precedence)
  serverQuotes.forEach(serverQuote => {
    const key = `${serverQuote.text.toLowerCase()}::${serverQuote.category.toLowerCase()}`;
    if (!localQuotesMap.has(key)) {
      newQuotesFromServerCount.count++;
    }
    mergedQuotesMap.set(key, serverQuote);
  });

  // 2. Add local quotes that are not present in the server's collection
  quotes.forEach(localQuote => {
    const key = `${localQuote.text.toLowerCase()}::${localQuote.category.toLowerCase()}`;
    if (!mergedQuotesMap.has(key)) { // If server didn't have this, keep local version
      mergedQuotesMap.set(key, localQuote);
    }
  });

  const newQuotes = Array.from(mergedQuotesMap.values());

  // Check if there are actual changes before updating
  if (JSON.stringify(newQuotes) !== JSON.stringify(quotes)) {
    quotes = newQuotes;
    saveQuotes();
    populateCategories();
    showRandomQuote();
    if (newQuotesFromServerCount.count > 0) {
      displaySyncStatus(`Synced successfully! ${newQuotesFromServerCount.count} new quotes added from server.`, 'bg-green-100 text-green-800');
    } else {
      displaySyncStatus('Synced successfully! No new quotes from server.', 'bg-green-100 text-green-800');
    }
  } else {
    displaySyncStatus('Synced successfully! No changes detected.', 'bg-blue-100 text-blue-800');
  }
}

// --- Initialization ---

// Event listeners
newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesButton.addEventListener('click', exportQuotesToJson);
syncNowButton.addEventListener('click', syncQuotes); // Call to syncQuotes

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes(); // Load quotes from local storage
  populateCategories(); // Populate filter dropdown based on loaded quotes
  loadLastViewedQuote(); // Load last viewed quote and apply initial filter
  syncQuotes(); // Perform an initial sync on load

  // Set up periodic sync (e.g., every 30 seconds)
  setInterval(syncQuotes, 30000); // Sync every 30 seconds
});
