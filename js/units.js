// units.js
import { cToF, kmhToMph, mmToIn } from './utils.js';

export const currentUnits = {
    temperature: localStorage.getItem('unitTemp') || 'metric',
    wind: localStorage.getItem('unitWind') || 'metric',
    precipitation: localStorage.getItem('unitPrecip') || 'metric'
};

export function loadSavedUnits() {
    const savedTemp = localStorage.getItem('unitTemp');
    const savedWind = localStorage.getItem('unitWind');
    const savedPrecip = localStorage.getItem('unitPrecip');

    if (savedTemp) currentUnits.temperature = savedTemp;
    if (savedWind) currentUnits.wind = savedWind;
    if (savedPrecip) currentUnits.precipitation = savedPrecip;

    updateUnitsUI();
}

export function saveUnits() {
    localStorage.setItem('unitTemp', currentUnits.temperature);
    localStorage.setItem('unitWind', currentUnits.wind);
    localStorage.setItem('unitPrecip', currentUnits.precipitation);
}

export function updateUnitsUI() {
    const tempF = document.querySelector('input[name="temperature"][value="fahrenheit"]');
    const tempC = document.querySelector('input[name="temperature"][value="celsius"]');
    if (tempF) tempF.checked = currentUnits.temperature === 'fahrenheit';
    if (tempC) tempC.checked = currentUnits.temperature !== 'fahrenheit';

    const windMph = document.querySelector('input[name="wind"][value="mph"]');
    const windKmh = document.querySelector('input[name="wind"][value="kmh"]');
    if (windMph) windMph.checked = currentUnits.wind === 'mph';
    if (windKmh) windKmh.checked = currentUnits.wind !== 'mph';

    const precipIn = document.querySelector('input[name="precipitation"][value="inches"]');
    const precipMm = document.querySelector('input[name="precipitation"][value="mm"]');
    if (precipIn) precipIn.checked = currentUnits.precipitation === 'inches';
    if (precipMm) precipMm.checked = currentUnits.precipitation !== 'inches';
}

export function applyUnits() {
    applyTemperatureUnits();
    applyWindUnits();
    applyPrecipitationUnits();
    updateUnitCheckmarks();
}

export function applyTemperatureUnits() {
    document.querySelectorAll('[data-temp-c]').forEach(el => {
        const c = parseFloat(el.dataset.tempC) || 0;
        el.textContent = currentUnits.temperature === 'fahrenheit'
            ? `${Math.round(cToF(c))}°F`
            : `${Math.round(c)}°C`;
    });
}

export function applyWindUnits() {
    document.querySelectorAll('[data-wind-kmh]').forEach(el => {
        const kmh = parseFloat(el.dataset.windKmh) || 0;
        el.textContent = currentUnits.wind === 'mph'
            ? `${Math.round(kmhToMph(kmh))} mph`
            : `${Math.round(kmh)} km/h`;
    });
}

export function applyPrecipitationUnits() {
    document.querySelectorAll('[data-precip-mm]').forEach(el => {
        const mm = parseFloat(el.dataset.precipMm) || 0;
        el.textContent = currentUnits.precipitation === 'inches'
            ? `${(mmToIn(mm)).toFixed(2)} in`
            : `${Math.round(mm)} mm`;
    });
}

export function updateUnitCheckmarks() {
    document.querySelectorAll('.unit-radio').forEach(radio => {
        const checkmark = radio.parentElement.querySelector('.checkmark');
        if (!checkmark) return;
        if (radio.checked) checkmark.classList.remove('hidden');
        else checkmark.classList.add('hidden');
    });
}
