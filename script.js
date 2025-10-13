//  WEATHER ICON MAPPING

// Lookup table that connects Open-Meteo weather codes to your local icons
const weatherIcons = {
    0: './assets/images/icon-sunny.webp',              // Clear sky
    1: './assets/images/icon-partly-cloudy.webp',      // Mainly clear
    2: './assets/images/icon-partly-cloudy.webp',      // Partly cloudy
    3: './assets/images/icon-overcast.webp',           // Overcast
    45: './assets/images/icon-fog.webp',               // Fog
    48: './assets/images/icon-fog.webp',               // Depositing rime fog
    51: './assets/images/icon-drizzle.webp',           // Light drizzle
    53: './assets/images/icon-drizzle.webp',           // Moderate drizzle
    55: './assets/images/icon-drizzle.webp',           // Dense drizzle
    56: './assets/images/icon-drizzle.webp',           // Freezing drizzle
    57: './assets/images/icon-drizzle.webp',
    61: './assets/images/icon-rain.webp',              // Slight rain
    63: './assets/images/icon-rain.webp',              // Moderate rain
    65: './assets/images/icon-rain.webp',              // Heavy rain
    66: './assets/images/icon-rain.webp',              // Freezing rain
    67: './assets/images/icon-rain.webp',
    71: './assets/images/icon-snow.webp',              // Slight snow
    73: './assets/images/icon-snow.webp',              // Moderate snow
    75: './assets/images/icon-snow.webp',              // Heavy snow
    77: './assets/images/icon-snow.webp',              // Snow grains
    80: './assets/images/icon-rain.webp',              // Slight rain showers
    81: './assets/images/icon-rain.webp',              // Moderate rain showers
    82: './assets/images/icon-rain.webp',              // Violent rain showers
    85: './assets/images/icon-snow.webp',              // Slight snow showers
    86: './assets/images/icon-snow.webp',              // Heavy snow showers
    95: './assets/images/icon-storm.webp',             // Thunderstorm
    96: './assets/images/icon-storm.webp',             // Thunderstorm with hail
    99: './assets/images/icon-storm.webp',             // Thunderstorm with hail
};

// Helper to safely get the right icon
function getWeatherIcon(code) {
    return weatherIcons[code] || './assets/images/icon-overcast.webp';
}


async function getWeather(lat, long) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=auto`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data;
        console.log('Raw weather data:', data);
    } catch (err) {
        console.log('Error fetching weather', err);
    }
}
getWeather(52.52, 13.41).then(data => {
    if (data) {
        renderDailyForecast(data);
        renderHourlyForecast(0, data);
        populateDayDropdown(data);
    }
});

//Render Daily forecast 

function renderDailyForecast(data) {
    const container = document.querySelector('#dailyForecastContainer');
    container.innerHTML = ''; // clear previous forecast

    const days = data.daily.time;               // array of dates
    const codes = data.daily.weathercode;       // array of weather codes
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;

    days.forEach((date, i) => {
        const card = document.createElement('div');
        card.className = 'forecast-card p-4 rounded-2xl shadow bg-neutral-800 hover:bg-neutral-300 cursor-pointer flex flex-col items-center text-center';


        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherIcon(codes[i]);

        card.innerHTML = `
            <p class="font-semibold">${dayName}</p>
            <img src="${icon}" alt="Weather Icon" class="w-12 h-12 my-2" />
            <p class="text-sm text-white flex gap-2">
            <span>${Math.round(maxTemps[i])}°</span>
            <span>${Math.round(minTemps[i])}°</span>
            </p>`;

        // click → trigger hourly forecast display
        card.addEventListener('click', () => {
            renderHourlyForecast(i, data); // you’ll build this next step
        });

        container.appendChild(card);
    });
}


// RENDER HOURLY FORECAST
//    - Get hourly data for selected day
//    - Create list items with: time (12-hour format), temperature
//    - Append to #hourlyForecastContainer
//    - Update when day changes

function renderHourlyForecast(selectedDayIndex, data) {
    const container = document.querySelector('#hourlyForecastContainer');
    container.innerHTML = ''; // clear old data

    const allTimes = data.hourly.time;
    const allTemps = data.hourly.temperature_2m;

    // Find date for the selected day
    const targetDate = data.daily.time[selectedDayIndex];

    // Filter only hours belonging to that date
    const hours = allTimes
        .map((t, i) => ({ time: t, temp: allTemps[i] }))
        .filter(entry => entry.time.startsWith(targetDate));

    // Build the list
    hours.forEach(hour => {
        const li = document.createElement('li');
        li.className = 'flex justify-between p-2 border-b border-gray-200';

        // Convert time string → Date → 12-hour format
        const hourFormatted = new Date(hour.time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });

        li.innerHTML = `
            <span>${hourFormatted}</span>
            <span>${Math.round(hour.temp)}°</span>
        `;

        container.appendChild(li);
    });
}

//POPULATE DAY SELECTION DROPDOWN
//    - Create 7 day buttons (Monday - Sunday)
//    - Append to #daySelectionDropdown
//    - Add click handlers to update #hourlyDaySelector text
//    - Add click handlers to re-render hourly forecast
const dayDropdown = document.getElementById('daySelectionDropdown');

function populateDayDropdown(data) {
    const dayDropdown = document.getElementById('daySelectionDropdown');
    dayDropdown.innerHTML = '';

    data.daily.time.forEach((date, index) => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

        const btn = document.createElement('button');
        btn.textContent = dayName;
        btn.dataset.dayIndex = index;
        btn.className = 'w-full text-left px-4 py-2 bg-neutral-800 text-neutral-0 rounded hover:bg-neutral-700 transition-colors text-sm';

        btn.addEventListener('click', () => {
            // Update selector text
            document.getElementById('hourlyDaySelector').textContent = dayName;
            // Render hourly forecast for this day
            renderHourlyForecast(index, data);
            // Hide dropdown
            dayDropdown.classList.add('hidden');
        });

        dayDropdown.appendChild(btn);
    });
}

// 5. SEARCH FUNCTIONALITY
//    - Listen to #searchInput for user typing
//    - Make API call to geocode location names
//    - Show results in #searchResults dropdown
//    - Create clickable location items
//    - On selection: fetch weather for that location, update all sections

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let searchTimeout; // for debouncing

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();

    // Clear previous timeout
    clearTimeout(searchTimeout);

    if (!query) {
        searchResults.classList.remove('hidden');
        searchResults.innerHTML = `
        <p class="px-4 py-2 text-red-500 border border-red-500 rounded bg-red-100 text-sm">
            Please type a location to search
        </p>`;
        return;
    }

    // Debounce to avoid too many API calls
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            // Clear old results
            searchResults.innerHTML = '';

            if (!data.results || data.results.length === 0) {
                searchResults.innerHTML = '<p class="px-4 py-2 text-neutral-400 text-sm">No results found</p>';
                searchResults.classList.remove('hidden');
                return;
            }

            // Loop through results and create clickable items
            data.results.forEach(loc => {
                const item = document.createElement('div');
                item.className = 'px-4 py-2 cursor-pointer hover:bg-neutral-700 text-neutral-0';
                item.textContent = `${loc.name}, ${loc.country}`;

                item.addEventListener('click', () => {
                    searchInput.value = `${loc.name}, ${loc.country}`;
                    searchResults.classList.add('hidden');
                    searchResults.innerHTML = '';

                    getWeather(loc.latitude, loc.longitude).then(weatherData => {
                        if (weatherData) {
                            renderDailyForecast(weatherData);
                            renderHourlyForecast(0, weatherData);
                            populateDayDropdown(weatherData);

                            // Update current weather card
                            const currentCode = weatherData.daily.weathercode[0];
                            const currentTemp = weatherData.daily.temperature_2m_max[0];
                            const today = new Date(weatherData.daily.time[0]);

                            document.getElementById('locationName').textContent = `${loc.name}, ${loc.country}`;
                            document.getElementById('currentTemp').textContent = `${Math.round(currentTemp)}°`;
                            document.getElementById('currentWeatherIcon').src = getWeatherIcon(currentCode);
                            document.getElementById('dateDisplay').textContent = today.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                            });
                        }
                    });
                });

                searchResults.appendChild(item);
            });

            searchResults.classList.remove('hidden');
        } catch (err) {
            console.log('Error fetching locations', err);
        }
    }, 300); // 300ms debounce
});

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
    if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});






// 6. LOCAL STORAGE FOR UNITS
//    - Save selected units to localStorage when changed
//    - Load units on page load
//    - Apply unit conversions to all displayed values
//    - Update all temperature, wind, and precipitation displays

// 7. UNIT CONVERSIONS
//    - Celsius to Fahrenheit: (C × 9/5) + 32
//    - km/h to mph: km/h × 0.621371
//    - mm to inches: mm × 0.0393701
//    - Call conversion functions when units change
//    - Re-render affected DOM elements

// 8. UNITS DROPDOWN TOGGLE
const unitsBtn = document.getElementById('unitsBtn');
const unitsDropdown = document.getElementById('unitsDropdown');

unitsBtn.addEventListener('click', () => {
    unitsDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!unitsDropdown.contains(e.target) && !unitsBtn.contains(e.target)) {
        unitsDropdown.classList.add('hidden');
    }
});

// 9. HOURLY DAY SELECTOR TOGGLE
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

// // 10. SEARCH RESULTS TOGGLE
// const searchInput = document.getElementById('searchInput');
// const searchResults = document.getElementById('searchResults');

// searchInput.addEventListener('focus', () => {
//     if (searchInput.value.length > 0) {
//         searchResults.classList.remove('hidden');
//     }
// });

// document.addEventListener('click', (e) => {
//     if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
//         searchResults.classList.add('hidden');
//     }
// });
