// utils.js
export const weatherIcons = {
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

export function getWeatherIcon(code) {
    return weatherIcons[code] || './assets/images/icon-overcast.webp';
}

export function cToF(c) {
    return (c * 9) / 5 + 32;
}
export function kmhToMph(kmh) {
    return kmh * 0.621371;
}
export function mmToIn(mm) {
    return mm * 0.0393701;
}
