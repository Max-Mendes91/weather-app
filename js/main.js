// main.js
import { fetchWeather } from './data.js';
import * as UI from './ui.js';
import * as Units from './units.js';
import { setupSearchHandlers } from './search.js';

let currentWeatherData = null;
let selectedDayIndex = 0;
const defaultLocation = { lat: 50.812, lon: 19.113 }; // Częstochowa

async function loadAndRender(lat, lon) {
    UI.hideApiError();
    UI.showLoading();
    try {
        const data = await fetchWeather(lat, lon);
        currentWeatherData = data;
        UI.renderAllWeather(data);
        Units.applyUnits(); // ensure units shown correctly
    } catch (err) {
        console.error(err);
        UI.showApiError();
    } finally {
        UI.hideLoading();
    }
}

function setupUnitListeners() {
    const unitsBtn = document.getElementById('unitsBtn');
    const unitsDropdown = document.getElementById('unitsDropdown');

    if (unitsBtn) {
        unitsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            unitsDropdown.classList.toggle('hidden');
        });
    }

    document.querySelectorAll('.unit-radio').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.name === 'temperature') {
                Units.currentUnits.temperature = e.target.value === 'fahrenheit' ? 'fahrenheit' : 'metric';
            } else if (e.target.name === 'wind') {
                Units.currentUnits.wind = e.target.value === 'mph' ? 'mph' : 'metric';
            } else if (e.target.name === 'precipitation') {
                Units.currentUnits.precipitation = e.target.value === 'inches' ? 'inches' : 'metric';
            }
            Units.saveUnits();
            Units.applyUnits();
            Units.updateUnitsUI();
        });
    });

    document.addEventListener('click', (e) => {
        if (!unitsDropdown.contains(e.target) && !unitsBtn.contains(e.target)) {
            unitsDropdown.classList.add('hidden');
        }
    });
}

function setupDaySelection() {
    document.addEventListener('daySelected', (e) => {
        selectedDayIndex = e.detail.index;
        if (!currentWeatherData) return;
        UI.renderHourlyForecast(selectedDayIndex, currentWeatherData);
        Units.applyUnits();
    });

    document.addEventListener('locationSelected', (e) => {
        const { lat, lon } = e.detail;
        loadAndRender(lat, lon);
    });

    document.addEventListener('apiRetry', () => {
        if (lastWeatherCoords) loadAndRender(lastWeatherCoords.lat, lastWeatherCoords.lon);
    });
}

// retain last coords for retry
let lastWeatherCoords = { ...defaultLocation };

document.addEventListener('locationSelected', (e) => {
    lastWeatherCoords = { lat: e.detail.lat, lon: e.detail.lon };
});

document.addEventListener('DOMContentLoaded', async () => {
    Units.loadSavedUnits();
    setupSearchHandlers();
    setupUnitListeners();
    setupDaySelection();

    // Close dropdowns handlers (hourly/day)
    const hourlyDaySelector = document.getElementById('hourlyDaySelector');
    const daySelectionDropdown = document.getElementById('daySelectionDropdown');
    if (hourlyDaySelector) {
        hourlyDaySelector.addEventListener('click', (e) => {
            e.stopPropagation();
            daySelectionDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!daySelectionDropdown.contains(e.target) && !hourlyDaySelector.contains(e.target)) {
                daySelectionDropdown.classList.add('hidden');
            }
        });
    }

    // Search click outside handled by search module.

    // Initial load
    lastWeatherCoords = { ...defaultLocation };
    await loadAndRender(defaultLocation.lat, defaultLocation.lon);
    document.getElementById('locationName').textContent = 'Częstochowa, Poland';
});
