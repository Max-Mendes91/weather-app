// 1. STATE & INITIALIZATION

let currentWeatherData = null;
let currentUnits = {
    temperature: localStorage.getItem('unitTemp') || 'metric',
    wind: localStorage.getItem('unitWind') || 'metric',
    precipitation: localStorage.getItem('unitPrecip') || 'metric'
};
let selectedDayIndex = 0;

// Load units on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedUnits();
    initializeEventListeners();
    getWeather(50.812, 19.113).then((data) => {
        document.getElementById('locationName').textContent = 'Częstochowa, Poland';
        renderDailyForecast(data);   // now #dayText exists
        renderHourlyForecast(0, data);

    });
    applyUnits();
});

// 2. WEATHER ICON MAPPING
const weatherIcons = {
    0: './assets/images/icon-sunny.webp',
    1: './assets/images/icon-partly-cloudy.webp',
    2: './assets/images/icon-partly-cloudy.webp',
    3: './assets/images/icon-overcast.webp',
    45: './assets/images/icon-fog.webp',
    48: './assets/images/icon-fog.webp',
    51: './assets/images/icon-drizzle.webp',
    53: './assets/images/icon-drizzle.webp',
    55: './assets/images/icon-drizzle.webp',
    56: './assets/images/icon-drizzle.webp',
    57: './assets/images/icon-drizzle.webp',
    61: './assets/images/icon-rain.webp',
    63: './assets/images/icon-rain.webp',
    65: './assets/images/icon-rain.webp',
    66: './assets/images/icon-rain.webp',
    67: './assets/images/icon-rain.webp',
    71: './assets/images/icon-snow.webp',
    73: './assets/images/icon-snow.webp',
    75: './assets/images/icon-snow.webp',
    77: './assets/images/icon-snow.webp',
    80: './assets/images/icon-rain.webp',
    81: './assets/images/icon-rain.webp',
    82: './assets/images/icon-rain.webp',
    85: './assets/images/icon-snow.webp',
    86: './assets/images/icon-snow.webp',
    95: './assets/images/icon-storm.webp',
    96: './assets/images/icon-storm.webp',
    99: './assets/images/icon-storm.webp',
};

function getWeatherIcon(code) {
    return weatherIcons[code] || './assets/images/icon-overcast.webp';
}


//Loading state functions
const loadingState = document.getElementById('loadingState');
const appWrapper = document.getElementById('appWrapper');

function showLoading() {
    loadingState.classList.remove('hidden');
    appWrapper.classList.add('opacity-50', 'pointer-events-none');
}

function hideLoading() {
    loadingState.classList.add('hidden');
    appWrapper.classList.remove('opacity-50', 'pointer-events-none');
}

// 3. API CALLS

let lastWeatherCoords = null;

async function getWeather(lat, long) {
    lastWeatherCoords = { lat, lon: long };
    showLoading();

    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_max&hourly=temperature_2m,weathercode&timezone=auto`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        currentWeatherData = data;

        renderAllWeather(data);
        return data;
    } catch (err) {
        console.error(err);
        showApiError();
    } finally {
        hideLoading();
    }
}

//show API error 
const apiErrorEl = document.getElementById('apiError');
const retryBtn = document.getElementById('retryBtn');

function showApiError() { apiErrorEl.classList.remove('hidden'); }
function hideApiError() { apiErrorEl.classList.add('hidden'); }

retryBtn.addEventListener('click', () => {
    hideApiError();
    if (lastWeatherCoords) getWeather(lastWeatherCoords.lat, lastWeatherCoords.lon);
});


// 4. RENDER ALL WEATHER DATA
function renderAllWeather(data) {
    updateCurrentWeather(data);
    renderDailyForecast(data);
    renderHourlyForecast(0, data);
    populateDayDropdown(data);
}


// 5. UPDATE CURRENT WEATHER
function updateCurrentWeather(data) {
    const current = data.current_weather || {};
    const daily = data.daily || {};

    // Temperature
    const tempC = current.temperature ?? 0;
    document.getElementById('currentTemp').dataset.tempC = Math.round(tempC);
    document.getElementById('currentTemp').textContent =
        currentUnits === 'imperial'
            ? `${Math.round(tempC * 9 / 5 + 32)}°F`
            : `${Math.round(tempC)}°C`;

    // Feels Like (approximation: Open-Meteo current doesn’t provide apparent temperature)
    const feelsC = (daily.apparent_temperature_max && daily.apparent_temperature_max[0]) ?? tempC;
    document.getElementById('feelsLike').dataset.tempC = Math.round(feelsC);
    document.getElementById('feelsLike').textContent =
        currentUnits.temperature === 'fahrenheit'
            ? `${Math.round(feelsC * 9 / 5 + 32)}°F`
            : `${Math.round(feelsC)}°C`;

    // Humidity
    const humidity = (daily.relative_humidity_2m_max && daily.relative_humidity_2m_max[0]) ?? '-';
    document.getElementById('humidity').textContent = `${humidity}%`;

    // Wind Speed
    const windKmh = current.windspeed ?? 0;
    document.getElementById('windSpeed').dataset.windKmh = windKmh;
    document.getElementById('windSpeed').textContent =
        currentUnits.wind === 'mph'
            ? `${Math.round(windKmh * 0.621371)} mph`
            : `${Math.round(windKmh)} km/h`;

    // Precipitation
    const precipMm = (daily.precipitation_sum && daily.precipitation_sum[0]) ?? 0;
    document.getElementById('precipitation').dataset.precipMm = precipMm;
    document.getElementById('precipitation').textContent =
        currentUnits.precipitation === 'inches'
            ? `${(precipMm * 0.0393701).toFixed(2)} in`
            : `${Math.round(precipMm)} mm`;

    // Weather Icon
    document.getElementById('currentWeatherIcon').src = getWeatherIcon(current.weathercode ?? 0);

    // Date
    const dateObj = daily.time ? new Date(daily.time[0]) : new Date();
    document.getElementById('dateDisplay').textContent = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}




// 6. RENDER DAILY FORECAST

function renderDailyForecast(data) {
    const container = document.getElementById('dailyForecastContainer');
    container.innerHTML = '';

    const dayTextEl = document.getElementById('dayText');
    if (dayTextEl) dayTextEl.textContent = new Date(data.daily.time[0]).toLocaleDateString('en-US', { weekday: 'long' });

    const days = data.daily.time;
    const codes = data.daily.weather_code;
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;

    days.forEach((date, i) => {
        const card = document.createElement('div');
        card.className = 'bg-neutral-800  rounded-xl p-3 md:p-4 text-center hover:bg-neutral-700 transition-colors cursor-pointer border border-neutral-700 day-card';
        card.dataset.dayIndex = i;

        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherIcon(codes[i]);

        card.innerHTML = `
            <p class="text-neutral-300 text-xs md:text-sm mb-2 font-medium">${dayName}</p>
            <img src="${icon}" alt="Weather" class="w-8 h-8 mx-auto mb-2">
            <div class="flex justify-between text-xs md:text-sm gap-1">
                <span class="text-neutral-0 high-temp" data-temp-c="${Math.round(maxTemps[i])}">${Math.round(maxTemps[i])}°</span>
                <span class="text-neutral-0 low-temp" data-temp-c="${Math.round(minTemps[i])}">${Math.round(minTemps[i])}°</span>
            </div>
        `;

        card.addEventListener('click', () => {
            selectedDayIndex = i;
            renderHourlyForecast(i, data);
            // dayTextEl.textContent = dayName;
        });

        container.appendChild(card);
    });
}


// 7. RENDER HOURLY FORECAST

function renderHourlyForecast(selectedDayIndex, data, updateDayLabel = true) {
    const dayName = new Date(data.daily.time[selectedDayIndex]).toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('hourlyDaySelector').textContent = `${dayName} ↓`;

    const container = document.getElementById('hourlyForecastContainer');
    container.innerHTML = '';

    const allTimes = data.hourly.time;
    const allTemps = data.hourly.temperature_2m;
    const allCodes = data.hourly.weathercode || []; // include this in your API call
    const targetDate = data.daily.time[selectedDayIndex];

    const hours = allTimes
        .map((t, i) => ({ time: t, temp: allTemps[i], code: allCodes[i] }))
        .filter(entry => entry.time.startsWith(targetDate));

    hours.forEach(hour => {
        const div = document.createElement('div');
        div.className = 'bg-neutral-700 p-2 md:p-3 rounded-lg hover:bg-neutral-600 transition-colors flex items-center justify-between';

        const hourFormatted = new Date(hour.time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
        });

        const icon = getWeatherIcon(hour.code);

        div.innerHTML = `
            <div class="flex items-center gap-2">
                <img src="${icon}" alt="icon" class="w-6 h-6">
                <span class="text-neutral-400 text-xs md:text-sm font-medium">${hourFormatted}</span>
            </div>
            <span class="heading text-sm md:text-base font-bold" data-temp-c="${Math.round(hour.temp)}">
                ${Math.round(hour.temp)}°
            </span>
        `;

        container.appendChild(div);
    });
}




// 8. POPULATE DAY DROPDOWN
function populateDayDropdown(data) {
    const dayDropdown = document.getElementById('daySelectionDropdown');
    dayDropdown.innerHTML = '';

    data.daily.time.forEach((date, index) => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        const btn = document.createElement('button');
        btn.textContent = dayName;
        btn.dataset.dayIndex = index;
        btn.className = 'block w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-600 text-sm transition-colors';

        btn.addEventListener('click', () => {
            selectedDayIndex = index;
            document.getElementById('hourlyDaySelector').textContent = `${dayName} ↓`;
            renderHourlyForecast(index, data, false); // don’t override label
            dayDropdown.classList.add('hidden');
        });

        dayDropdown.appendChild(btn);
    });
}



// 9. SEARCH FUNCTIONALITY
let searchTimeout;
let highlightedIndex = -1;
let currentResults = []; // store last fetched locations

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBtn = document.getElementById('searchBtn');

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
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            searchResults.innerHTML = '';
            currentResults = data.results || [];

            if (!currentResults.length) {
                searchResults.innerHTML = '<p class="px-4 py-2 text-neutral-400 text-sm">No results found</p>';
                searchResults.classList.remove('hidden');
                return;
            }

            currentResults.forEach((loc, index) => {
                const item = document.createElement('div');
                item.className = 'px-4 py-2 cursor-pointer hover:bg-neutral-700 text-neutral-0 text-sm border-b border-neutral-700';
                item.textContent = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}, ${loc.country}`;
                item.addEventListener('click', () => selectLocation(loc));
                searchResults.appendChild(item);
            });

            // HIGHLIGHT FIRST ITEM AUTOMATICALLY
            if (currentResults.length > 0) {
                highlightedIndex = 0;
                const items = Array.from(searchResults.children);
                updateHighlight(items);
            }

            searchResults.classList.remove('hidden');
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    }, 300);
});

// KEYBOARD NAVIGATION
searchInput.addEventListener('keydown', (e) => {
    const items = Array.from(searchResults.children);
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % items.length;
        updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
        updateHighlight(items);
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

function updateHighlight(items) {
    items.forEach((item, i) => {
        if (i === highlightedIndex) {
            item.classList.add('bg-blue-500', 'text-white');
        } else {
            item.classList.remove('bg-blue-500', 'text-white');
        }
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
    getWeather(loc.latitude, loc.longitude);
}



// 10. UNITS & CONVERSIONS

function loadSavedUnits() {
    const savedTemp = localStorage.getItem('unitTemp');
    const savedWind = localStorage.getItem('unitWind');
    const savedPrecip = localStorage.getItem('unitPrecip');

    if (savedTemp) currentUnits.temperature = savedTemp;
    if (savedWind) currentUnits.wind = savedWind;
    if (savedPrecip) currentUnits.precipitation = savedPrecip;

    updateUnitsUI();
}


function updateUnitsUI() {
    document.querySelector('input[name="temperature"][value="fahrenheit"]').checked =
        currentUnits.temperature === 'fahrenheit';
    document.querySelector('input[name="temperature"][value="celsius"]').checked =
        currentUnits.temperature !== 'fahrenheit';

    document.querySelector('input[name="wind"][value="mph"]').checked =
        currentUnits.wind === 'mph';
    document.querySelector('input[name="wind"][value="kmh"]').checked =
        currentUnits.wind !== 'mph';

    document.querySelector('input[name="precipitation"][value="inches"]').checked =
        currentUnits.precipitation === 'inches';
    document.querySelector('input[name="precipitation"][value="mm"]').checked =
        currentUnits.precipitation !== 'inches';
}

function applyUnits() {
    applyTemperatureUnits();
    applyWindUnits();
    applyPrecipitationUnits();
}

function applyTemperatureUnits() {
    document.querySelectorAll('[data-temp-c]').forEach(el => {
        const c = parseFloat(el.dataset.tempC);
        el.textContent = currentUnits.temperature === 'fahrenheit'
            ? `${Math.round(c * 9 / 5 + 32)}°F`
            : `${Math.round(c)}°C`;
    });
}

function applyWindUnits() {
    document.querySelectorAll('[data-wind-kmh]').forEach(el => {
        const kmh = parseFloat(el.dataset.windKmh);
        el.textContent = currentUnits.wind === 'mph'
            ? `${Math.round(kmh * 0.621371)} mph`
            : `${Math.round(kmh)} km/h`;
    });
}

function applyPrecipitationUnits() {
    document.querySelectorAll('[data-precip-mm]').forEach(el => {
        const mm = parseFloat(el.dataset.precipMm);
        el.textContent = currentUnits.precipitation === 'inches'
            ? `${(mm * 0.0393701).toFixed(2)} in`
            : `${Math.round(mm)} mm`;
    });
}

// Show checkmark for selected unit
function updateUnitCheckmarks() {
    document.querySelectorAll('.unit-radio').forEach(radio => {
        const checkmark = radio.parentElement.querySelector('.checkmark');
        if (radio.checked) {
            checkmark.classList.remove('hidden');
        } else {
            checkmark.classList.add('hidden');
        }
    });
}

// Initial update on page load
updateUnitCheckmarks();

// Update checkmarks whenever a unit is changed
document.querySelectorAll('.unit-radio').forEach(radio => {
    radio.addEventListener('change', updateUnitCheckmarks);
});


// 11. EVENT LISTENERS - UNITS DROPDOWN


const unitsBtn = document.getElementById('unitsBtn');
const unitsDropdown = document.getElementById('unitsDropdown');

unitsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    unitsDropdown.classList.toggle('hidden');
});

// Radio buttons for units
document.querySelectorAll('.unit-radio').forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Update the specific unit type
        if (e.target.name === 'temperature') {
            currentUnits.temperature = e.target.value === 'fahrenheit' ? 'fahrenheit' : 'metric';
            localStorage.setItem('unitTemp', currentUnits.temperature);
        } else if (e.target.name === 'wind') {
            currentUnits.wind = e.target.value === 'mph' ? 'mph' : 'metric';
            localStorage.setItem('unitWind', currentUnits.wind);
        } else if (e.target.name === 'precipitation') {
            currentUnits.precipitation = e.target.value === 'inches' ? 'inches' : 'metric';
            localStorage.setItem('unitPrecip', currentUnits.precipitation);
        }

        // Apply all conversions
        applyUnits();
        updateUnitsUI();
    });
});

document.addEventListener('click', (e) => {
    if (!unitsDropdown.contains(e.target) && !unitsBtn.contains(e.target)) {
        unitsDropdown.classList.add('hidden');
    }
});


// 12. EVENT LISTENERS - HOURLY DAY SELECTOR
const hourlyDaySelector = document.getElementById('hourlyDaySelector');
const daySelectionDropdown = document.getElementById('daySelectionDropdown');

hourlyDaySelector.addEventListener('click', (e) => {
    e.stopPropagation();
    daySelectionDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!daySelectionDropdown.contains(e.target) && !hourlyDaySelector.contains(e.target)) {
        daySelectionDropdown.classList.add('hidden');
    }
});


// 13. CLOSE SEARCH RESULTS ON CLICK OUTSIDE
document.addEventListener('click', (e) => {
    if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});


// 14. INITIALIZE ALL EVENT LISTENERS
function initializeEventListeners() {
}
initializeEventListeners();