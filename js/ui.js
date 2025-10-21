// ui.js
import { getWeatherIcon } from './utils.js';

const loadingState = document.getElementById('loadingState');
const appWrapper = document.getElementById('appWrapper');
const apiErrorEl = document.getElementById('apiError');
const retryBtn = document.getElementById('retryBtn');

export function showLoading() {
    loadingState.classList.remove('hidden');
    appWrapper.classList.add('opacity-50', 'pointer-events-none');
}
export function hideLoading() {
    loadingState.classList.add('hidden');
    appWrapper.classList.remove('opacity-50', 'pointer-events-none');
}

export function showApiError() { apiErrorEl.classList.remove('hidden'); }
export function hideApiError() { apiErrorEl.classList.add('hidden'); }

retryBtn.addEventListener('click', () => {
    hideApiError();
    // main will handle retry via a provided callback in main.js
    const evt = new CustomEvent('apiRetry');
    document.dispatchEvent(evt);
});

// Render helpers (DOM-only)
export function renderAllWeather(data) {
    updateCurrentWeather(data);
    renderDailyForecast(data);
    renderHourlyForecast(0, data);
    populateDayDropdown(data);
}

export function updateCurrentWeather(data) {
    const current = data.current_weather || {};
    const daily = data.daily || {};

    // Temperature
    const tempC = current.temperature ?? 0;
    const currentTempEl = document.getElementById('currentTemp');
    currentTempEl.dataset.tempC = Math.round(tempC);
    // text content will be set by units.applyUnits later; put raw C value for now
    currentTempEl.textContent = `${Math.round(tempC)}°C`;

    // Feels Like
    const feelsC = (daily.apparent_temperature_max && daily.apparent_temperature_max[0]) ?? tempC;
    const feelsEl = document.getElementById('feelsLike');
    feelsEl.dataset.tempC = Math.round(feelsC);
    feelsEl.textContent = `${Math.round(feelsC)}°C`;

    // Humidity
    const humidity = (daily.relative_humidity_2m_max && daily.relative_humidity_2m_max[0]) ?? '-';
    document.getElementById('humidity').textContent = `${humidity}%`;

    // Wind Speed
    const windKmh = current.windspeed ?? 0;
    const windEl = document.getElementById('windSpeed');
    windEl.dataset.windKmh = windKmh;
    windEl.textContent = `${Math.round(windKmh)} km/h`;

    // Precipitation
    const precipMm = (daily.precipitation_sum && daily.precipitation_sum[0]) ?? 0;
    const precipEl = document.getElementById('precipitation');
    precipEl.dataset.precipMm = precipMm;
    precipEl.textContent = `${Math.round(precipMm)} mm`;

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

export function renderDailyForecast(data) {
    const container = document.getElementById('dailyForecastContainer');
    container.innerHTML = '';

    const dayTextEl = document.getElementById('dayText');
    if (dayTextEl && data.daily && data.daily.time && data.daily.time[0]) {
        dayTextEl.textContent = new Date(data.daily.time[0]).toLocaleDateString('en-US', { weekday: 'long' });
    }

    const days = data.daily.time || [];
    const codes = data.daily.weather_code || [];
    const maxTemps = data.daily.temperature_2m_max || [];
    const minTemps = data.daily.temperature_2m_min || [];

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
        <span class="text-neutral-0 high-temp" data-temp-c="${Math.round(maxTemps[i] ?? 0)}">${Math.round(maxTemps[i] ?? 0)}°</span>
        <span class="text-neutral-0 low-temp" data-temp-c="${Math.round(minTemps[i] ?? 0)}">${Math.round(minTemps[i] ?? 0)}°</span>
      </div>
    `;

        card.addEventListener('click', () => {
            const evt = new CustomEvent('daySelected', { detail: { index: i } });
            document.dispatchEvent(evt);
        });

        container.appendChild(card);
    });
}

export function renderHourlyForecast(selectedDayIndex, data, updateDayLabel = true) {
    if (!data || !data.daily || !data.hourly) return;
    const dayName = new Date(data.daily.time[selectedDayIndex]).toLocaleDateString('en-US', { weekday: 'long' });
    const hourlySelector = document.getElementById('hourlyDaySelector');
    if (hourlySelector) hourlySelector.textContent = `${dayName} ↓`;

    const container = document.getElementById('hourlyForecastContainer');
    container.innerHTML = '';

    const allTimes = data.hourly.time || [];
    const allTemps = data.hourly.temperature_2m || [];
    const allCodes = data.hourly.weathercode || [];
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
      <span class="heading text-sm md:text-base font-bold" data-temp-c="${Math.round(hour.temp ?? 0)}">
        ${Math.round(hour.temp ?? 0)}°
      </span>
    `;

        container.appendChild(div);
    });
}

export function populateDayDropdown(data) {
    const dayDropdown = document.getElementById('daySelectionDropdown');
    if (!dayDropdown) return;
    // dropdown container wrapper is first child .py-2; maintain structure
    const inner = dayDropdown.querySelector('.py-2') || dayDropdown;
    inner.innerHTML = '';

    (data.daily.time || []).forEach((date, index) => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        const btn = document.createElement('button');
        btn.textContent = dayName;
        btn.dataset.dayIndex = index;
        btn.className = 'block w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-600 text-sm transition-colors';

        btn.addEventListener('click', () => {
            const evt = new CustomEvent('daySelected', { detail: { index } });
            document.dispatchEvent(evt);
            dayDropdown.classList.add('hidden');
        });

        inner.appendChild(btn);
    });
}
