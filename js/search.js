// search.js
import { fetchLocationResults } from './data.js';
import { fetchWeather } from './data.js';

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBtn = document.getElementById('searchBtn');

let searchTimeout;
let highlightedIndex = -1;
let currentResults = [];

export function setupSearchHandlers() {
    if (!searchInput || !searchBtn || !searchResults) return;

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        clearTimeout(searchTimeout);
        highlightedIndex = -1;
        currentResults = [];

        if (!query) {
            searchResults.classList.add('hidden');
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const data = await fetchLocationResults(query);
                searchResults.innerHTML = '';
                currentResults = data.results || [];

                if (!currentResults.length) {
                    searchResults.innerHTML = '<p class="px-4 py-2 text-neutral-400 text-sm">No results found</p>';
                    searchResults.classList.remove('hidden');
                    return;
                }

                currentResults.forEach((loc) => {
                    const item = document.createElement('div');
                    item.className = 'px-4 py-2 cursor-pointer hover:bg-neutral-700 text-neutral-0 text-sm border-b border-neutral-700';
                    item.textContent = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}, ${loc.country}`;
                    item.addEventListener('click', () => selectLocation(loc));
                    searchResults.appendChild(item);
                });

                highlightedIndex = 0;
                updateHighlight();
                searchResults.classList.remove('hidden');
            } catch (err) {
                console.error('Error fetching locations:', err);
            }
        }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = Array.from(searchResults.children);
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex + 1) % items.length;
            updateHighlight();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
            updateHighlight();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && currentResults[highlightedIndex]) {
                selectLocation(currentResults[highlightedIndex]);
                highlightedIndex = -1;
            } else {
                performSearch();
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

function updateHighlight() {
    const items = Array.from(searchResults.children);
    items.forEach((item, i) => {
        if (i === highlightedIndex) item.classList.add('bg-blue-500', 'text-white');
        else item.classList.remove('bg-blue-500', 'text-white');
    });
}

function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    searchResults.classList.remove('hidden');
}

function selectLocation(loc) {
    searchInput.value = `${loc.name}, ${loc.country}`;
    searchResults.classList.add('hidden');
    document.getElementById('locationName').textContent = `${loc.name}, ${loc.country}`;

    const evt = new CustomEvent('locationSelected', { detail: { lat: loc.latitude, lon: loc.longitude } });
    document.dispatchEvent(evt);
}
